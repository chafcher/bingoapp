import { useState, useEffect } from 'react';

const gridSizes = [5, 6, 7, 8];

export default function Sidebar({ activeGridSize, onGridSizeChange }) {
  const [savedGames, setSavedGames] = useState({});

  useEffect(() => {
    // Load saved games from localStorage
    const saved = {};
    gridSizes.forEach(size => {
      const game = localStorage.getItem(`bingoState_${size}`);
      if (game) {
        saved[size] = JSON.parse(game);
      }
    });
    setSavedGames(saved);
  }, []);

  return (
    <div className="fixed left-0 top-0 h-screen w-64 bg-gray-800 p-4">
      <h2 className="text-white text-lg font-bold mb-4">Saved Games</h2>
      <ul className="space-y-2">
        {gridSizes.map(size => (
          <li key={size}>
            <button
              className={`w-full p-2 rounded text-left ${
                size === activeGridSize
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
              onClick={() => onGridSizeChange(size)}
            >
              {size}x{size} Grid
              {savedGames[size] && (
                <span className="text-xs text-gray-400 ml-2">
                  (Saved)
                </span>
              )}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
