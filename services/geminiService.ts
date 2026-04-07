
import { GoogleGenAI, Type } from "@google/genai";
import { SongDetails } from "../types";

// Ensure API Key is present
const apiKey = process.env.API_KEY;
if (!apiKey) {
  console.error("API_KEY is missing from environment variables.");
}

const ai = new GoogleGenAI({ apiKey: apiKey || 'dummy-key-for-build' });

// Helper to decode base64 to Uint8Array
const decodeBase64 = (base64: string): Uint8Array => {
  const binaryString = atob(base64.replace(/\s/g, ''));
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
};

// Helper to create WAV header for raw PCM data
const createWavHeader = (dataLength: number, sampleRate: number = 24000, numChannels: number = 1, bitsPerSample: number = 16): Uint8Array => {
  const buffer = new ArrayBuffer(44);
  const view = new DataView(buffer);

  const writeString = (view: DataView, offset: number, string: string) => {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i));
    }
  };

  writeString(view, 0, 'RIFF'); // ChunkID
  view.setUint32(4, 36 + dataLength, true); // ChunkSize
  writeString(view, 8, 'WAVE'); // Format
  writeString(view, 12, 'fmt '); // Subchunk1ID
  view.setUint32(16, 16, true); // Subchunk1Size
  view.setUint16(20, 1, true); // AudioFormat (1 = PCM)
  view.setUint16(22, numChannels, true); // NumChannels
  view.setUint32(24, sampleRate, true); // SampleRate
  view.setUint32(28, sampleRate * numChannels * bitsPerSample / 8, true); // ByteRate
  view.setUint16(32, numChannels * bitsPerSample / 8, true); // BlockAlign
  view.setUint16(34, bitsPerSample, true); // BitsPerSample
  writeString(view, 36, 'data'); // Subchunk2ID
  view.setUint32(40, dataLength, true); // Subchunk2Size

  return new Uint8Array(buffer);
};

// Internal helper to generate audio from text
const generateTTSAudio = async (text: string): Promise<string> => {
    try {
        // Use a more descriptive prompt to avoid ambiguity filters
        const announcerPrompt = `Announcer: ${text}`;
        
        const audioResponse = await ai.models.generateContent({
            model: "gemini-2.5-flash-preview-tts",
            contents: [{ parts: [{ text: announcerPrompt }] }],
            config: {
                // Using string literal 'AUDIO' for robustness
                responseModalities: ['AUDIO' as any],
                speechConfig: {
                    voiceConfig: {
                        prebuiltVoiceConfig: { voiceName: 'Puck' }, // Switching to Puck
                    },
                },
            },
        });

        const candidate = audioResponse.candidates?.[0];
        let base64Audio: string | undefined;
        
        if (candidate?.content?.parts) {
            for (const part of candidate.content.parts) {
                if (part.inlineData?.data) {
                    base64Audio = part.inlineData.data;
                    break;
                }
            }
        }
        
        if (!base64Audio) {
            const finishReason = candidate?.finishReason;
            console.error("TTS Failed. Reason:", finishReason, "Full response:", JSON.stringify(audioResponse, null, 2));
            
            if (finishReason === 'OTHER') {
                throw new Error("The model encountered an internal safety or content restriction. Try changing the song query.");
            }
            throw new Error(`The model failed to return audio (Reason: ${finishReason || 'Unknown'}).`);
        }

        // Convert Raw PCM (Int16, 24kHz) to WAV
        let pcmData = decodeBase64(base64Audio);
        
        // Ensure data length is even
        if (pcmData.length % 2 !== 0) {
            const newPcmData = new Uint8Array(pcmData.length + 1);
            newPcmData.set(pcmData);
            newPcmData[pcmData.length] = 0;
            pcmData = newPcmData;
        }

        const wavHeader = createWavHeader(pcmData.length, 24000, 1, 16);
        const wavData = new Uint8Array(wavHeader.length + pcmData.length);
        wavData.set(wavHeader);
        wavData.set(pcmData, wavHeader.length);

        const blob = new Blob([wavData], { type: 'audio/wav' });
        return URL.createObjectURL(blob);
    } catch (error) {
        console.error("Critical TTS error:", error);
        throw error;
    }
}

/**
 * Identifies a song based on a user query using Gemini Flash.
 */
export const identifySong = async (query: string): Promise<SongDetails> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Identify the song based on this query: "${query}". Provide the most likely match.`,
      config: {
        systemInstruction: "You are a music expert. Return detailed JSON data about the song requested. If the song is ambiguous, pick the most popular one.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            artist: { type: Type.STRING },
            album: { type: Type.STRING },
            year: { type: Type.STRING },
            genre: { type: Type.STRING },
            description: { type: Type.STRING, description: "A brief 2-sentence description of the song's musical style and themes." }
          },
          required: ["title", "artist", "album", "year", "genre", "description"]
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");
    
    return JSON.parse(text) as SongDetails;
  } catch (error) {
    console.error("Error identifying song:", error);
    throw new Error("Failed to identify song. Please try again.");
  }
};

/**
 * Generates a creative description of the converted song.
 */
export const generateConversionDescription = async (song: SongDetails, targetStyle: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Describe how the song "${song.title}" by ${song.artist} would sound if reimagined in the style of ${targetStyle}. Focus on instrumentation, tempo, and mood changes. Keep it evocative but under 80 words.`,
    });
    return response.text || "A unique musical re-interpretation.";
  } catch (error) {
    console.error("Error generating description:", error);
    return "An AI-generated musical transformation.";
  }
};

/**
 * Generates a spoken intro/preview using the TTS model to simulate the result.
 */
export const generateAudioPreview = async (song: SongDetails, targetStyle: string): Promise<string> => {
  try {
    const script = `Generating a new version of "${song.title}". Transforming this into a ${targetStyle} arrangement.`;
    return await generateTTSAudio(script);
  } catch (error) {
    console.error("Error generating conversion preview audio:", error);
    throw new Error(`Conversion preview failed: ${error instanceof Error ? error.message : "Internal Error"}`);
  }
};

/**
 * Generates a preview of the original song.
 */
export const generateOriginalPreview = async (song: SongDetails): Promise<string> => {
  try {
    const script = `Preparing to play the original version of "${song.title}" by ${song.artist}. A classic track from the ${song.genre} genre.`;
    return await generateTTSAudio(script);
  } catch (error) {
    console.error("Error generating original audio preview:", error);
    throw new Error(`Original preview failed: ${error instanceof Error ? error.message : "Internal Error"}`);
  }
};
