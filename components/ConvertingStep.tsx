import React, { useEffect, useState } from 'react';

const convertingMessages = [
    "Analyzing spectral data...",
    "Deconstructing melody...",
    "Isolating vocal stems...",
    "Synthesizing new instruments...",
    "Re-harmonizing structure...",
    "Mastering final output...",
];

const ConvertingStep: React.FC = () => {
    const [progress, setProgress] = useState(0);
    const [messageIndex, setMessageIndex] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setProgress(prev => {
                if (prev >= 100) {
                    clearInterval(interval);
                    return 100;
                }
                return prev + 0.5; // Slow progress to allow API to finish
            });
        }, 50);

        const msgInterval = setInterval(() => {
            setMessageIndex(prev => (prev + 1) % convertingMessages.length);
        }, 2000);

        return () => {
            clearInterval(interval);
            clearInterval(msgInterval);
        };
    }, []);

    return (
        <div className="w-full max-w-md mx-auto text-center space-y-8 animate-fade-in py-12">
            <div className="relative w-32 h-32 mx-auto">
                <div className="absolute inset-0 rounded-full border-4 border-indigo-900"></div>
                <div className="absolute inset-0 rounded-full border-t-4 border-indigo-500 animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-xl font-bold font-mono text-indigo-400">{Math.floor(progress)}%</span>
                </div>
            </div>
            
            <div className="space-y-2">
                <h3 className="text-2xl font-semibold text-white">Converting...</h3>
                <p className="text-indigo-300 h-6 transition-all duration-300">
                    {convertingMessages[messageIndex]}
                </p>
            </div>

            <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                <div 
                    className="h-full bg-indigo-500 transition-all duration-100 ease-linear"
                    style={{ width: `${progress}%` }}
                ></div>
            </div>
        </div>
    );
};

export default ConvertingStep;
