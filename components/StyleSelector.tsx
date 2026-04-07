import React from 'react';
import { StyleOption } from '../types';
import { MUSIC_STYLES } from '../constants';
import { ArrowRight } from 'lucide-react';

interface StyleSelectorProps {
  onSelect: (style: StyleOption) => void;
  onBack: () => void;
}

const StyleSelector: React.FC<StyleSelectorProps> = ({ onSelect, onBack }) => {
  return (
    <div className="w-full max-w-4xl mx-auto space-y-8 animate-fade-in">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold text-white">Select Target Style</h2>
        <p className="text-slate-400">Choose a musical dimension to transport your song into.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {MUSIC_STYLES.map((style) => (
          <button
            key={style.id}
            onClick={() => onSelect(style)}
            className="group relative p-6 bg-slate-800 border border-slate-700 rounded-xl hover:border-slate-500 transition-all duration-300 text-left overflow-hidden flex flex-col justify-between h-48"
          >
            <div className={`absolute inset-0 bg-gradient-to-br ${style.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}></div>
            
            <div className="relative z-10">
                <span className="text-4xl mb-3 block transform group-hover:scale-110 transition-transform duration-300 origin-left">{style.icon}</span>
                <h3 className="text-xl font-bold text-white group-hover:text-indigo-300 transition-colors">{style.name}</h3>
                <p className="text-sm text-slate-400 mt-2 leading-relaxed">{style.description}</p>
            </div>
            
            <div className="relative z-10 flex justify-end mt-4 opacity-0 group-hover:opacity-100 transform translate-x-2 group-hover:translate-x-0 transition-all duration-300">
                <ArrowRight className="w-5 h-5 text-indigo-400" />
            </div>
          </button>
        ))}
      </div>

      <div className="text-center">
        <button 
            onClick={onBack}
            className="text-slate-500 hover:text-slate-300 text-sm font-medium transition-colors"
        >
            &larr; Back to song details
        </button>
      </div>
    </div>
  );
};

export default StyleSelector;
