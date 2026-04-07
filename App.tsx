import React, { useState } from 'react';
import { AppStep, SongDetails, StyleOption, ConversionResult } from './types';
import { identifySong, generateConversionDescription, generateAudioPreview, generateOriginalPreview } from './services/geminiService';
import SearchStep from './components/SearchStep';
import DetailsStep from './components/DetailsStep';
import StyleSelector from './components/StyleSelector';
import ConvertingStep from './components/ConvertingStep';
import ResultStep from './components/ResultStep';

const App: React.FC = () => {
  const [step, setStep] = useState<AppStep>(AppStep.SEARCH);
  const [loading, setLoading] = useState(false);
  const [song, setSong] = useState<SongDetails | null>(null);
  const [selectedStyle, setSelectedStyle] = useState<StyleOption | null>(null);
  const [result, setResult] = useState<ConversionResult | null>(null);

  const handleSearch = async (query: string) => {
    setLoading(true);
    try {
      const songData = await identifySong(query);
      setSong(songData);
      setStep(AppStep.VERIFY);
    } catch (error) {
      alert("Could not identify the song. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmSong = () => {
    setStep(AppStep.STYLE_SELECT);
  };

  const handleCancelSong = () => {
    setSong(null);
    setStep(AppStep.SEARCH);
  };

  const handlePlayOriginalPreview = async () => {
      if (!song) throw new Error("No song selected");
      return await generateOriginalPreview(song);
  };

  const handleStyleSelect = async (style: StyleOption) => {
    if (!song) return;
    setSelectedStyle(style);
    setStep(AppStep.CONVERTING);
    
    try {
        // Parallel execution for better UX
        const [desc, audioUrl] = await Promise.all([
            generateConversionDescription(song, style.name),
            generateAudioPreview(song, style.name)
        ]);

        setResult({
            description: desc,
            audioUrl: audioUrl
        });
        setStep(AppStep.RESULT);

    } catch (error) {
        console.error("Conversion failed", error);
        alert(`Conversion failed: ${error instanceof Error ? error.message : "Unknown error"}`);
        setStep(AppStep.STYLE_SELECT);
    }
  };

  const handleReset = () => {
      setStep(AppStep.SEARCH);
      setSong(null);
      setSelectedStyle(null);
      setResult(null);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col items-center justify-center p-4 md:p-8">
      <div className="w-full max-w-6xl">
        {step === AppStep.SEARCH && (
          <SearchStep onSearch={handleSearch} isLoading={loading} />
        )}

        {step === AppStep.VERIFY && song && (
          <DetailsStep 
            song={song} 
            onConfirm={handleConfirmSong} 
            onCancel={handleCancelSong}
            onPlayPreview={handlePlayOriginalPreview}
          />
        )}

        {step === AppStep.STYLE_SELECT && (
          <StyleSelector 
            onSelect={handleStyleSelect} 
            onBack={() => setStep(AppStep.VERIFY)} 
          />
        )}

        {step === AppStep.CONVERTING && (
          <ConvertingStep />
        )}

        {step === AppStep.RESULT && song && selectedStyle && result && (
            <ResultStep 
                song={song}
                style={selectedStyle}
                result={result}
                onReset={handleReset}
            />
        )}
      </div>

      {/* Footer */}
      <footer className="fixed bottom-4 text-center w-full pointer-events-none">
         <p className="text-slate-800 text-xs">Powered by Google Gemini</p>
      </footer>
    </div>
  );
};

export default App;