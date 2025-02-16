import { useState } from 'react';
import Button from "./ui/Button";

export default function ChampionsSidebar({ isOpen, onClose, allChampions, handleSelectChamp }) {
  return (
    <div className={`fixed right-0 top-0 h-screen w-64 bg-gray-800 p-4 transform transition-transform duration-300 ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
      <button 
        onClick={onClose}
        className="absolute top-2 left-2 text-white hover:text-gray-300"
      >
        &times;
      </button>
      <h2 className="text-white text-lg font-bold mb-4">Champions</h2>
      <div className="overflow-y-auto h-[calc(100vh-6rem)]">
        {allChampions.map((champ) => (
          <div
            key={champ}
            className="p-2 cursor-pointer flex items-center gap-2 hover:bg-gray-700 text-gray-300"
            onClick={() => handleSelectChamp(champ)}
          >
            <img
              src={`/out/${champ}.png`}
              alt={champ}
              className="w-6 h-6 rounded-full"
              onError={(e) => e.target.src = '/fallback-champion-icon.png'}
            />
            <span className="text-sm">{champ}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
