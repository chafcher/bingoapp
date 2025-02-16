import { useState, useMemo } from 'react';
import { championRoles } from '../data/championRoles';

interface ChampionsSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  allChampions: string[];
  handleSelectChamp: (champion: string) => void;
}

const roles = ['Top', 'Jungle', 'Mid', 'Adc', 'Support'];

export default function ChampionsSidebar({
  isOpen,
  onClose,
  allChampions,
  handleSelectChamp
}: ChampionsSidebarProps) {
  const [filters, setFilters] = useState({
    searchQuery: '',
    selectedRole: ''
  });

  const filteredChampions = useMemo(() => {
    return allChampions.filter(champ => {
      const matchesSearch = champ.toLowerCase().includes(filters.searchQuery.toLowerCase());
      const matchesRole = filters.selectedRole === '' || 
        (championRoles[champ] && championRoles[champ].includes(filters.selectedRole));
      return matchesSearch && matchesRole;
    });
  }, [allChampions, filters]);

  return (
    <div 
      className={`fixed right-0 top-0 h-screen w-64 bg-gray-800 p-4 transform transition-transform duration-300 ${
        isOpen ? 'translate-x-0' : 'translate-x-full'
      }`}
    >
      <button 
        onClick={onClose}
        className="absolute top-2 left-2 text-white hover:text-gray-300"
        aria-label="Close sidebar"
      >
        &times;
      </button>
      
      <div className="space-y-4 mb-4">
        <input
          type="text"
          placeholder="Search champions..."
          value={filters.searchQuery}
          onChange={(e) => setFilters(prev => ({ ...prev, searchQuery: e.target.value }))}
          className="w-full p-2 rounded bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        
        <select
          value={filters.selectedRole}
          onChange={(e) => setFilters(prev => ({ ...prev, selectedRole: e.target.value }))}
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

      <h2 className="text-white text-lg font-bold mb-4">Champions</h2>
      
      <div className="overflow-y-auto h-[calc(100vh-12rem)]">
        {filteredChampions.map((champ) => (
          <button
            key={champ}
            onClick={() => handleSelectChamp(champ)}
            className="w-full p-2 text-left flex items-center gap-2 hover:bg-gray-700 text-gray-300"
          >
            <img
              src={`/out/${champ}.png`}
              alt={champ}
              className="w-6 h-6 rounded-full"
              onError={(e) => {
                e.target.src = '/fallback-champion-icon.png';
              }}
            />
            <span className="text-sm">{champ}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
