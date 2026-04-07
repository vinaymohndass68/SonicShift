import React, { useState, useRef, useEffect } from 'react';
import { SongDetails } from '../types';
import { Check, X, Disc, Calendar, User, Music, Play, Pause, Loader2 } from 'lucide-react';

interface DetailsStepProps {
  song: SongDetails;
  onConfirm: () => void;
  onCancel: () => void;
  onPlayPreview: () => Promise<string>;
}

const DetailsStep: React.FC<DetailsStepProps> = ({ song, onConfirm, onCancel, onPlayPreview }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoadingPreview, setIsLoadingPreview] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Cleanup URL on unmount
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, []);

  // Effect to autoplay when URL is ready
  useEffect(() => {
    if (previewUrl && audioRef.current) {
        audioRef.current.play()
            .then(() => setIsPlaying(true))
            .catch(e => {
                console.error("Play failed", e);
                setIsPlaying(false);
            });
    }
  }, [previewUrl]);

  const handlePlayToggle = async () => {
    if (isPlaying) {
      audioRef.current?.pause();
      setIsPlaying(false);
    } else {
      if (!previewUrl) {
        setIsLoadingPreview(true);
        try {
          const url = await onPlayPreview();
          setPreviewUrl(url); // This will trigger the useEffect to play
        } catch (error) {
          console.error("Failed to load preview", error);
          alert("Could not load preview. Please try again.");
        } finally {
          setIsLoadingPreview(false);
        }
      } else {
        audioRef.current?.play()
            .then(() => setIsPlaying(true))
            .catch(e => console.error("Play resume failed", e));
      }
    }
  };

  const handleEnded = () => {
    setIsPlaying(false);
  };

  return (
    <div className="w-full max-w-lg mx-auto animate-fade-in-up">
      <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700 rounded-2xl overflow-hidden shadow-2xl">
        {/* Header Art Placeholder */}
        <div className="h-32 bg-gradient-to-r from-slate-700 to-slate-600 relative overflow-hidden group">
            <div className="absolute inset-0 opacity-20 mix-blend-overlay bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
            
            <div className="absolute inset-0 flex items-center justify-center bg-black/10 group-hover:bg-black/30 transition-colors">
                 <button 
                    onClick={handlePlayToggle}
                    disabled={isLoadingPreview}
                    className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center hover:bg-white/30 hover:scale-110 transition-all border border-white/40 shadow-xl"
                 >
                    {isLoadingPreview ? (
                        <Loader2 className="w-6 h-6 text-white animate-spin" />
                    ) : isPlaying ? (
                        <Pause className="w-6 h-6 text-white fill-current" />
                    ) : (
                        <Play className="w-6 h-6 text-white fill-current ml-1" />
                    )}
                 </button>
            </div>

            <div className="absolute bottom-0 left-0 p-6 pointer-events-none">
                <h2 className="text-3xl font-bold text-white tracking-tight drop-shadow-md">{song.title}</h2>
                <p className="text-indigo-200 text-lg font-medium flex items-center gap-2 drop-shadow-md">
                    <User className="w-4 h-4" /> {song.artist}
                </p>
            </div>
        </div>

        {/* Hidden Audio Element */}
        <audio 
            ref={audioRef} 
            src={previewUrl || undefined} 
            onEnded={handleEnded} 
            className="hidden" 
        />

        <div className="p-6 space-y-6">
          <p className="text-slate-300 italic text-center border-l-4 border-indigo-500 pl-4 py-1 bg-slate-800/50 rounded-r-lg">
            "{song.description}"
          </p>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="p-3 bg-slate-900/50 rounded-lg flex items-center gap-3">
               <div className="p-2 bg-slate-800 rounded-full text-indigo-400"><Disc className="w-4 h-4" /></div>
               <div>
                 <p className="text-slate-500 text-xs">Album</p>
                 <p className="font-medium text-slate-200 truncate">{song.album}</p>
               </div>
            </div>
            <div className="p-3 bg-slate-900/50 rounded-lg flex items-center gap-3">
               <div className="p-2 bg-slate-800 rounded-full text-indigo-400"><Calendar className="w-4 h-4" /></div>
               <div>
                 <p className="text-slate-500 text-xs">Year</p>
                 <p className="font-medium text-slate-200">{song.year}</p>
               </div>
            </div>
             <div className="p-3 bg-slate-900/50 rounded-lg col-span-2 flex items-center gap-3">
               <div className="p-2 bg-slate-800 rounded-full text-indigo-400"><Music className="w-4 h-4" /></div>
               <div>
                 <p className="text-slate-500 text-xs">Genre</p>
                 <p className="font-medium text-slate-200">{song.genre}</p>
               </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-700 flex gap-4">
             <button
              onClick={() => {
                  if(isPlaying) audioRef.current?.pause();
                  onCancel();
              }}
              className="flex-1 py-3 rounded-lg border border-slate-600 hover:bg-slate-700 text-slate-300 font-medium transition-colors flex items-center justify-center gap-2"
            >
              <X className="w-4 h-4" /> No, try again
            </button>
            <button
              onClick={() => {
                  if(isPlaying) audioRef.current?.pause();
                  onConfirm();
              }}
              className="flex-1 py-3 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold shadow-lg shadow-indigo-500/20 transition-all transform hover:scale-[1.02] flex items-center justify-center gap-2"
            >
              <Check className="w-4 h-4" /> Yes, Convert This
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DetailsStep;
