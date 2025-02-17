import { useState, useEffect } from 'react';

const gridSizes = [5, 6, 7, 8];
const roles = ['Top', 'Jungle', 'Mid', 'Adc', 'Support'];

export default function Sidebar({ activeGridSize, onGridSizeChange }) {
  const [savedGames, setSavedGames] = useState({});
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState('');


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
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search champions..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full p-2 rounded bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <div className="mb-4">
        <select
          value={selectedRole}
          onChange={(e) => setSelectedRole(e.target.value)}
          className="w-full p-2 rounded bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All Roles</option>
          {roles.map((role) => (
            <option key={role} value={role}>
              {role}
            </option>
          ))}
        </select>
      </div>
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
