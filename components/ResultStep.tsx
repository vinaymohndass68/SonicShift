import React, { useState, useRef, useEffect } from 'react';
import { SongDetails, StyleOption, ConversionResult } from '../types';
import { Play, Pause, Download, RotateCcw, Share2, Volume2 } from 'lucide-react';

interface ResultStepProps {
    song: SongDetails;
    style: StyleOption;
    result: ConversionResult;
    onReset: () => void;
}

const ResultStep: React.FC<ResultStepProps> = ({ song, style, result, onReset }) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    useEffect(() => {
        if (audioRef.current) {
            audioRef.current.volume = 0.8;
        }
    }, [result.audioUrl]);

    const togglePlay = () => {
        if (!audioRef.current) return;
        if (isPlaying) {
            audioRef.current.pause();
        } else {
            audioRef.current.play();
        }
        setIsPlaying(!isPlaying);
    };

    const handleTimeUpdate = () => {
        if (audioRef.current) {
            setCurrentTime(audioRef.current.currentTime);
        }
    };

    const handleLoadedMetadata = () => {
        if (audioRef.current) {
            setDuration(audioRef.current.duration);
        }
    };

    const handleEnded = () => {
        setIsPlaying(false);
        setCurrentTime(0);
    };

    const formatTime = (time: number) => {
        const min = Math.floor(time / 60);
        const sec = Math.floor(time % 60);
        return `${min}:${sec < 10 ? '0' : ''}${sec}`;
    };

    const handleDownload = () => {
        const link = document.createElement('a');
        link.href = result.audioUrl;
        link.download = `${song.title}_${style.id}_remix.wav`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="w-full max-w-2xl mx-auto space-y-8 animate-fade-in">
            <div className="bg-slate-800/80 backdrop-blur-md border border-slate-700 rounded-3xl overflow-hidden shadow-2xl">
                
                {/* Visualizer / Header */}
                <div className={`h-48 bg-gradient-to-br ${style.gradient} relative flex items-center justify-center p-6 text-center flex-col`}>
                    <div className="absolute inset-0 bg-black/20"></div>
                    <div className="relative z-10">
                         <h2 className="text-3xl font-bold text-white mb-2">{song.title}</h2>
                         <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-1 rounded-full text-white text-sm font-medium">
                            <span>{style.name} Remix</span>
                         </div>
                    </div>
                </div>

                {/* Player Controls */}
                <div className="p-8 space-y-6">
                    <div className="space-y-2">
                        <p className="text-slate-300 text-sm leading-relaxed text-center italic">
                            "{result.description}"
                        </p>
                    </div>

                    <audio
                        ref={audioRef}
                        src={result.audioUrl}
                        onTimeUpdate={handleTimeUpdate}
                        onLoadedMetadata={handleLoadedMetadata}
                        onEnded={handleEnded}
                        className="hidden"
                    />

                    {/* Progress Bar */}
                    <div className="space-y-2">
                        <div className="w-full bg-slate-700 rounded-full h-1.5 overflow-hidden cursor-pointer" onClick={(e) => {
                            if (!audioRef.current) return;
                            const rect = e.currentTarget.getBoundingClientRect();
                            const pos = (e.clientX - rect.left) / rect.width;
                            audioRef.current.currentTime = pos * duration;
                        }}>
                            <div 
                                className="h-full bg-indigo-500 rounded-full relative"
                                style={{ width: `${(currentTime / (duration || 1)) * 100}%` }}
                            >
                                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-md transform scale-0 hover:scale-100 transition-transform"></div>
                            </div>
                        </div>
                        <div className="flex justify-between text-xs text-slate-500 font-mono">
                            <span>{formatTime(currentTime)}</span>
                            <span>{formatTime(duration)}</span>
                        </div>
                    </div>

                    {/* Main Buttons */}
                    <div className="flex items-center justify-center gap-8">
                        <button className="text-slate-400 hover:text-white transition-colors" title="Share (Mock)">
                            <Share2 className="w-5 h-5" />
                        </button>
                        
                        <button 
                            onClick={togglePlay}
                            className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-slate-900 hover:scale-105 transition-transform shadow-lg shadow-indigo-500/20"
                        >
                            {isPlaying ? <Pause className="w-8 h-8 fill-current" /> : <Play className="w-8 h-8 fill-current ml-1" />}
                        </button>

                        <button 
                            onClick={handleDownload}
                            className="text-slate-400 hover:text-indigo-400 transition-colors" 
                            title="Download Audio"
                        >
                            <Download className="w-6 h-6" />
                        </button>
                    </div>
                </div>
            </div>

            <div className="text-center pt-4">
                 <button 
                    onClick={onReset}
                    className="inline-flex items-center gap-2 px-6 py-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors border border-transparent hover:border-slate-700"
                >
                    <RotateCcw className="w-4 h-4" /> Start Over
                </button>
            </div>
            
            <p className="text-center text-xs text-slate-600 mt-4">
                Note: This audio is a simulated preview generated by the Gemini Flash TTS model for demonstration purposes.
            </p>
        </div>
    );
};

export default ResultStep;
