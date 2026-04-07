import React, { useState } from 'react';
import { Search, Loader2, Music2 } from 'lucide-react';

interface SearchStepProps {
  onSearch: (query: string) => void;
  isLoading: boolean;
}

const SearchStep: React.FC<SearchStepProps> = ({ onSearch, isLoading }) => {
  const [query, setQuery] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query);
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto text-center space-y-8 animate-fade-in">
      <div className="space-y-4">
        <div className="inline-block p-4 rounded-full bg-indigo-500/10 border border-indigo-500/20 mb-4">
          <Music2 className="w-12 h-12 text-indigo-400" />
        </div>
        <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-400">
          SonicShift
        </h1>
        <p className="text-slate-400 text-lg">
          Reimagine your favorite songs in entirely new musical dimensions.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="relative group">
        <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg blur opacity-25 group-hover:opacity-50 transition duration-200"></div>
        <div className="relative flex items-center bg-slate-900 rounded-lg border border-slate-700 shadow-xl overflow-hidden">
          <Search className="w-6 h-6 text-slate-500 ml-4" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Enter a song name (e.g., 'Hotel California')"
            className="w-full bg-transparent border-none py-4 px-4 text-white placeholder-slate-500 focus:ring-0 text-lg outline-none"
            autoFocus
          />
          <button
            type="submit"
            disabled={isLoading || !query.trim()}
            className="mr-2 px-6 py-2 rounded-md bg-indigo-600 hover:bg-indigo-500 text-white font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          >
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Identify'}
          </button>
        </div>
      </form>
      
      <div className="flex flex-wrap justify-center gap-3 text-sm text-slate-500 mt-8">
        <span className="px-3 py-1 rounded-full bg-slate-800 border border-slate-700">Try "Bohemian Rhapsody"</span>
        <span className="px-3 py-1 rounded-full bg-slate-800 border border-slate-700">Try "Despacito"</span>
        <span className="px-3 py-1 rounded-full bg-slate-800 border border-slate-700">Try "Enter Sandman"</span>
      </div>
    </div>
  );
};

export default SearchStep;
