import { useState, useEffect, useMemo } from "react";
import { SunIcon, MoonIcon } from "@heroicons/react/24/solid";
import { championRoles } from './data/championRoles';
import Tooltip from "./components/ui/Tooltip";
import Toast from "./components/ui/Toast";
import { motion } from "framer-motion";
import Switch from "./components/ui/Switch";
import Button from "./components/ui/Button";
import Modal from "./components/ui/Modal";


// State management utilities
const STORAGE_KEY = 'bingoState';
const getStorageKey = (size) => `bingoState_${size}`;

const saveState = (state) => {
  try {
    const serializedState = JSON.stringify(state);
    localStorage.setItem(STORAGE_KEY, serializedState);
  } catch (error) {
    console.error('Error saving state to localStorage:', error);
    // Clear storage if quota is exceeded
    if (error.name === 'QuotaExceededError') {
      localStorage.removeItem(STORAGE_KEY);
    }
  }
};

const loadState = () => {
  try {
    const savedState = localStorage.getItem(STORAGE_KEY);
    if (savedState) {
      return JSON.parse(savedState);
    }
  } catch (error) {
    console.error('Error loading state from localStorage:', error);
  }
  return null;
};

const PHASE = {
  SELECTION: 'selection',
  PLAYING: 'playing'
};

const allChampions = [
  "Aatrox", "Ahri", "Akali", "Akshan", "Alistar", "Ambessa", "Amumu", "Anivia", "Annie", "Aphelios",
  "Ashe", "AurelionSol","Aurora", "Azir", "Bard", "BelVeth", "Blitzcrank", "Brand", "Braum", "Briar", "Caitlyn",
  "Camille", "Cassiopeia", "ChoGath", "Corki", "Darius", "Diana", "Draven", "DrMundo",
  "Ekko", "Elise", "Evelynn", "Ezreal", "Fiddlesticks", "Fiora", "Fizz", "Galio",
  "Gangplank", "Garen", "Gnar", "Gragas", "Graves", "Gwen", "Hecarim", "Heimerdinger", "Hwei", "Illaoi",
  "Irelia", "Ivern", "Janna", "JarvanIV", "Jax", "Jayce", "Jhin", "Jinx", "KaiSa",
  "Kalista", "Karma", "Karthus", "Kassadin", "Katarina", "Kayle", "Kayn", "Kennen",
  "KhaZix", "Kindred", "Kled", "KogMaw", "KSante", "LeBlanc", "LeeSin", "Leona", "Lillia",
  "Lissandra", "Lucian", "Lulu", "Lux", "Malphite", "Malzahar", "Maokai", "Milio", "MasterYi", "Mel",
  "MissFortune", "Mordekaiser", "Morgana", "Naafiri", "Nami", "Nasus", "Nautilus", "Neeko", "Nidalee",
  "Nilah", "Nocturne", "Nunu", "Olaf", "Orianna", "Ornn", "Pantheon", "Poppy", "Pyke", "Qiyana",
  "Quinn", "Rakan", "Rammus", "RekSai", "Rell", "Renata", "Renekton", "Rengar", "Riven", "Rumble",
  "Ryze", "Samira", "Sejuani", "Senna", "Seraphine", "Sett", "Shaco", "Shen", "Shyvana",
  "Singed", "Sion", "Sivir", "Skarner","Smolder", "Sona", "Soraka", "Swain", "Sylas", "Syndra",
  "TahmKench", "Taliyah", "Talon", "Taric", "Teemo", "Thresh", "Tristana", "Trundle",
  "Tryndamere", "TwistedFate", "Twitch", "Udyr", "Urgot", "Varus", "Vayne", "Veigar",
  "VelKoz", "Vex", "Vi", "Viego", "Viktor", "Vladimir", "Volibear", "Warwick", "Wukong",
  "Xayah", "Xerath", "XinZhao", "Yasuo", "Yone", "Yorick", "Yuumi", "Zac", "Zed",
  "Zeri", "Ziggs", "Zilean", "Zoe", "Zyra"
];

const gridSizes = [5, 6, 7, 8, 9, 10, 11];

export default function Bingo() {
  const [isLoading, setIsLoading] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [showHowToPlayModal, setShowHowToPlayModal] = useState(false);
  const [gridSize, setGridSize] = useState(5);
  const [activeGridSize, setActiveGridSize] = useState(5);
  const [phase, setPhase] = useState(PHASE.SELECTION);
  const [showRemoveModal, setShowRemoveModal] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [selectedChamps, setSelectedChamps] = useState([]);
  const [grid, setGrid] = useState(Array(gridSize * gridSize).fill(null));
  const [marked, setMarked] = useState(Array(gridSize * gridSize).fill(false));
  const [toastMessage, setToastMessage] = useState(null);
  const [currentPosition, setCurrentPosition] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState('');

  const filteredChampions = useMemo(() => allChampions
    .filter(champ => {
      const matchesSearch = champ.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesRole = selectedRole === '' || 
        (championRoles[champ] && championRoles[champ].includes(selectedRole));
      return matchesSearch && matchesRole;
    })
    .sort(), [searchQuery, selectedRole]);

  // Handle dark mode class on HTML element
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Load saved state on initial render

  useEffect(() => {
    setShowHowToPlayModal(true);
    const savedState = loadState();

    if (savedState) {
      const size = savedState.gridSize || 5;
      setGridSize(size);
      setGrid(savedState.grid || Array(size * size).fill(null));
      setMarked(savedState.marked || Array(size * size).fill(false));
      setSelectedChamps(savedState.selectedChamps || []);
      setCurrentPosition(savedState.currentPosition || 0);
      setPhase(savedState.phase || PHASE.SELECTION);
    } else {
      // Initialize default state
      setGrid(Array(5 * 5).fill(null));
      setMarked(Array(5 * 5).fill(false));
    }
    setIsLoading(false);
  }, []);

  // Save state only when important changes occur
  useEffect(() => {
    if (!isLoading) {
      const state = {
        grid,
        marked,
        selectedChamps,
        gridSize,
        phase,
        currentPosition
      };
      // Debounce saving to prevent excessive writes
      const timeoutId = setTimeout(() => saveState(state), 500);
      return () => clearTimeout(timeoutId);
    }
  }, [grid, marked, selectedChamps, gridSize, phase, currentPosition, isLoading]);

  const handleGridSizeChange = (newSize) => {
    // Save current state before switching
    const currentState = {
      grid,
      marked,
      selectedChamps,
      gridSize,
      phase,
      currentPosition
    };
    localStorage.setItem(getStorageKey(gridSize), JSON.stringify(currentState));
    
    // Load new state
    const savedState = localStorage.getItem(getStorageKey(newSize));
    if (savedState) {
      const state = JSON.parse(savedState);
      setGrid(state.grid);
      setMarked(state.marked);
      setSelectedChamps(state.selectedChamps || []);
      setCurrentPosition(state.currentPosition || 0);
      setPhase(state.phase || PHASE.SELECTION);
    } else {
      // Initialize new grid
      setGrid(Array(newSize * newSize).fill(null));
      setMarked(Array(newSize * newSize).fill(false));
      setSelectedChamps([]);
      setCurrentPosition(0);
      setPhase(PHASE.SELECTION);
    }
    
    setGridSize(newSize);
    setActiveGridSize(newSize);
  };

  const handleSelectChamp = (champ) => {
    // First check for empty spots
    const emptyIndex = grid.findIndex(cell => cell === null);
    
    if (emptyIndex !== -1) {
      // If there's an empty spot, fill it
      setGrid(prevGrid => {
        const newGrid = [...prevGrid];
        newGrid[emptyIndex] = champ;
        return newGrid;
      });
      setSelectedChamps(prev => [...prev, champ]);
    } else if (currentPosition < gridSize * gridSize) {
      // If no empty spots but grid isn't full, add to next position
      setGrid(prevGrid => {
        const newGrid = [...prevGrid];
        newGrid[currentPosition] = champ;
        return newGrid;
      });
      setSelectedChamps(prev => [...prev, champ]);
      setCurrentPosition(prev => prev + 1);
    } else {
      // Grid is full
      alert('Grid is full! Please randomize or clear the grid.');
    }
  };

  const hasDuplicates = (arr) => new Set(arr).size !== arr.length;

  const isValidPlacement = (grid, index, champ) => {
    const size = gridSize;
    const row = Math.floor(index / size);
    const col = index % size;

    // Check row
    for (let i = 0; i < size; i++) {
      if (grid[row * size + i] === champ) return false;
    }

    // Check column
    for (let i = 0; i < size; i++) {
      if (grid[i * size + col] === champ) return false;
    }

    // Check diagonals
    if (row === col) {
      for (let i = 0; i < size; i++) {
        if (grid[i * size + i] === champ) return false;
      }
    }

    if (row + col === size - 1) {
      for (let i = 0; i < size; i++) {
        if (grid[i * size + (size - 1 - i)] === champ) return false;
      }
    }

    return true;
  };

  const randomizeGrid = () => {
    if (selectedChamps.length < gridSize * gridSize) {
      alert(`Please select at least ${gridSize * gridSize} champions`);
      return;
    }

    // If no duplicates, use simple shuffle
    if (!hasDuplicates(selectedChamps)) {
      const shuffled = [...selectedChamps].sort(() => Math.random() - 0.5);
      setGrid(shuffled.slice(0, gridSize * gridSize));
      setMarked(Array(gridSize * gridSize).fill(false));
      setCurrentPosition(gridSize * gridSize);
      return;
    }

    // For duplicates, use constrained placement
    const newGrid = Array(gridSize * gridSize).fill(null);
    const championsPool = [];
    while (championsPool.length < gridSize * gridSize) {
      championsPool.push(...selectedChamps);
    }
    
    let attempts = 0;
    const maxAttempts = 1000;
    
    while (attempts < maxAttempts) {
      attempts++;
      const shuffled = championsPool.sort(() => Math.random() - 0.5);
      let valid = true;
      
      for (let i = 0; i < gridSize * gridSize; i++) {
        if (!isValidPlacement(newGrid, i, shuffled[i])) {
          valid = false;
          break;
        }
        newGrid[i] = shuffled[i];
      }
      
      if (valid) {
        setGrid(newGrid);
        setMarked(Array(gridSize * gridSize).fill(false));
        setCurrentPosition(gridSize * gridSize);
        return;
      }
      
      // If we're about to hit max attempts, use a fallback arrangement
      if (attempts === maxAttempts - 1) {
        // Just fill the grid with champions in order
        for (let i = 0; i < gridSize * gridSize; i++) {
          newGrid[i] = championsPool[i];
        }
        setGrid(newGrid);
        setMarked(Array(gridSize * gridSize).fill(false));
        setCurrentPosition(gridSize * gridSize);
        return;
      }
    }
    
    alert('Could not find a valid grid configuration. Please try again or select different champions.');
  };

  const handleRemoveChampion = () => {
    if (selectedIndex !== null) {
      const champion = grid[selectedIndex];
      setGrid((prev) => {
        const newGrid = [...prev];
        newGrid[selectedIndex] = null;
        return newGrid;
      });
      setSelectedChamps((prev) => prev.filter(c => c !== champion));
      setCurrentPosition((prev) => prev - 1);
    }
    setShowRemoveModal(false);
  };

  const handleMark = (index) => {
    if (phase === PHASE.SELECTION) {
      if (!grid[index]) {
        alert('Please select a champion first.');
        return;
      }
      setSelectedIndex(index);
      setShowRemoveModal(true);
    } else {
      setMarked((prev) => {
        const newMarked = [...prev];
        newMarked[index] = !newMarked[index];
        return newMarked;
      });
    }
  };

  const checkBingo = () => {
    if (!marked.length) return false;
    
    const size = gridSize;
    let bingo = false;

    // Check rows and columns for bingo
    for (let i = 0; i < size; i++) {
      if (marked.slice(i * size, (i + 1) * size).every(Boolean)) bingo = true;
      if (marked.filter((_, idx) => idx % size === i).every(Boolean)) bingo = true;
    }

    // Check main diagonal (top-left to bottom-right)
    let mainDiagonal = true;
    for (let i = 0; i < size; i++) {
      if (!marked[i * size + i]) {
        mainDiagonal = false;
        break;
      }
    }
    if (mainDiagonal) bingo = true;

    // Check anti-diagonal (top-right to bottom-left)
    let antiDiagonal = true;
    for (let i = 0; i < size; i++) {
      if (!marked[i * size + (size - 1 - i)]) {
        antiDiagonal = false;
        break;
      }
    }
    if (antiDiagonal) bingo = true;

    return bingo;
  };

  if (isLoading) {
    return <div className="min-h-screen bg-gray-50 p-6 flex flex-col items-center justify-center">
      <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
    </div>;
  }

  return (

    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'} flex flex-col md:flex-row`}>

      <button
        onClick={() => setIsDarkMode(!isDarkMode)}
        className="fixed top-4 right-4 p-2 bg-gray-800 text-white rounded-full shadow-md hover:bg-gray-700 transition-colors z-50 w-10 h-10 flex items-center justify-center"
      >
        {isDarkMode ? <SunIcon className="h-6 w-6" /> : <MoonIcon className="h-6 w-6" />}
      </button>

      <div className="flex-1 p-6">
        <div className="flex flex-col md:flex-row gap-4 md:gap-8 p-4 md:p-6">
          {/* Left Column */}
          <div className="w-full md:w-1/2">
            <div className="flex flex-col items-center relative">
              <div className="flex items-center gap-4">
                <h1 className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>Fearless Draft Bingo</h1>
                <button
                  onClick={() => setShowHowToPlayModal(true)}
                  className="p-2 rounded-full hover:bg-gray-700 transition-colors"
                  title="How to Play"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </button>
              </div>

              <div className="flex gap-3 mb-6">
                {gridSizes.map((size) => (
                  <Button 
                    key={size} 
                    onClick={() => handleGridSizeChange(size)}
                    className={`${size === activeGridSize ? 'bg-blue-500' : ''} ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>

                    {size}x{size}
                  </Button>
                ))}
              </div>

              <div className="flex items-center gap-3 mb-4">
                <span className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>Selection Phase</span>

                <Switch
                  checked={phase === PHASE.PLAYING}
                  onChange={(checked) => setPhase(checked ? PHASE.PLAYING : PHASE.SELECTION)}
                />
                <span className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>Playing Phase</span>

              </div>


              <div className="flex gap-3 mb-6">
                <Tooltip 
                  content="Grid must be full to randomize."
                  show={selectedChamps.length < gridSize * gridSize}
                >
                  <Button 
                    onClick={randomizeGrid} 
                    className="bg-primary hover:bg-secondary text-white font-semibold py-3 px-6 rounded-lg"
                    disabled={selectedChamps.length < gridSize * gridSize}
                  >
                    Randomize Grid
                  </Button>
                </Tooltip>

                <Tooltip 
                  content="Instantly fill grid with random champions"
                >
                  <Button 
                    onClick={() => {
                      const uniqueChamps = [...new Set(allChampions)];
                      const shuffled = uniqueChamps
                        .sort(() => Math.random() - 0.5)
                        .slice(0, gridSize * gridSize);
                      setGrid(shuffled);
                      setSelectedChamps(shuffled);
                      setCurrentPosition(gridSize * gridSize);
                      setMarked(Array(gridSize * gridSize).fill(false));
                    }}
                    className="bg-purple-500 hover:bg-purple-600 text-white font-semibold py-3 px-6 rounded-lg"
                  >
                    Random Grid
                  </Button>
                </Tooltip>

                <Tooltip 
                  content="Grid must have at least one champion selected to clear."
                  show={selectedChamps.length === 0}
                >
                  <Button 
                    onClick={() => {
                      setGrid(Array(gridSize * gridSize).fill(null));
                      setSelectedChamps([]);
                      setCurrentPosition(0);
                      setMarked(Array(gridSize * gridSize).fill(false));
                      localStorage.removeItem('bingoState');
                    }}
                    className="bg-red-500 hover:bg-red-600 text-white font-semibold py-3 px-6 rounded-lg"
                    disabled={selectedChamps.length === 0}
                  >
                    Clear Grid
                  </Button>
                </Tooltip>
              </div>

              {/* Champion Table */}
              <div className="mt-5">
                <div className="space-y-1 mb-4">
                  <input
                    type="text"
                    placeholder="Search champions..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full p-2 rounded bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  
                  <select
                    value={selectedRole}
                    onChange={(e) => setSelectedRole(e.target.value)}
                    className="w-full p-2 rounded bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">All Roles</option>
                    <option value="Top">Top</option>
                    <option value="Jungle">Jungle</option>
                    <option value="Mid">Mid</option>
                    <option value="Adc">Adc</option>
                    <option value="Support">Support</option>
                  </select>
                </div>

                <div className={`grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2 overflow-y-auto ${isDarkMode ? 'bg-gray-800' : 'bg-gray-700'} rounded`} style={{ maxHeight: '415px' }}>
                  {filteredChampions.map((champ) => (
                    <button
                      key={champ}
                      onClick={() => handleSelectChamp(champ)}
                      className="p-2 flex flex-col items-center gap-1 hover:bg-gray-700 rounded"
                    >
                      <img
                        src={`/out/${champ}.png`}
                        alt={champ}
                        className="w-10 h-10 rounded-full"
                        onError={(e) => {
                          e.target.src = '/fallback-champion-icon.png';
                        }}
                      />
                      <span className={`text-xs text-center ${isDarkMode ? 'text-gray-200' : 'text-gray-300'}`}>{champ}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="w-full md:w-1/2 mt-4 md:mt-0">
            <div className="grid gap-2 mx-auto" style={{ 
              gridTemplateColumns: `repeat(${gridSize}, minmax(0, 1fr))`,
              width: '100%',
              maxWidth: `${gridSize * (gridSize <= 7 ? 100 : gridSize<=8 ? 90 : gridSize<=9 ? 80 : gridSize <= 10 ? 75 : 65)}px`
            }}>
              {grid.map((champion, index) => (
                <div
                  key={index}
                  className="relative aspect-square"
                  onClick={() => handleMark(index)}
                >
                  {!champion && (
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-100/50">
                      <span className="text-2xl font-bold text-gray-400">?</span>
                    </div>
                  )}
                  {champion && (
                    <>
                      <img 
                        src={`/out/${champion}.png`} 
                        alt={champion} 
                        style={{
                          width: '100%',
                          height: '100%'
                        }}
                        className="object-cover"
                      />
                      {marked[index] && (
                        <div className="absolute inset-0 bg-green-500/50">
                          <svg className="w-full h-full text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      )}
                    </>
                  )}
                </div>
              ))}
            </div>

            <Modal
              isOpen={showHowToPlayModal}
              onClose={() => setShowHowToPlayModal(false)}
              title="How to Play"
              actions={[
                {
                  label: 'Got it!',
                  onClick: () => setShowHowToPlayModal(false),
                  variant: 'primary',
                },
              ]}
            >
              <div className={`space-y-4 ${isDarkMode ? 'text-white' : 'text-black'}`}>
                <div className="flex items-start gap-4">
                  <span className="w-6 h-6 flex items-center justify-center bg-blue-500 text-white rounded-full">1</span>
                  <p>Choose Grid Size: Select a grid size that suits your needs.</p>
                </div>
                <div className="flex items-start gap-4">
                  <span className="w-6 h-6 flex items-center justify-center bg-blue-500 text-white rounded-full">2</span>
                  <p>Pick Selection Phase: Choose the phase in which you'll select your champions.</p>
                </div>
                <div className="flex items-start gap-4">
                  <span className="w-6 h-6 flex items-center justify-center bg-blue-500 text-white rounded-full">3</span>
                  <p>Fill the Grid: Either select/search for champions from the list to fill your grid or use the random grid option for automatic selection.</p>
                </div>
                <div className="flex items-start gap-4">
                  <span className="w-6 h-6 flex items-center justify-center bg-blue-500 text-white rounded-full">4</span>
                  <p>Randomize the Grid (Optional): Shuffle the grid to change the champion positions.</p>
                </div>
                <div className="flex items-start gap-4">
                  <span className="w-6 h-6 flex items-center justify-center bg-blue-500 text-white rounded-full">5</span>
                  <p>Switch to Playing Phase: Once you're ready, switch to the Playing Phase.</p>
                </div>
                <div className="flex items-start gap-4">
                  <span className="w-6 h-6 flex items-center justify-center bg-blue-500 text-white rounded-full">6</span>
                  <p>Mark Selected Champions: As champions are picked, mark them on your grid.</p>
                </div>
                <div className="flex items-start gap-4">
                  <span className="w-6 h-6 flex items-center justify-center bg-blue-500 text-white rounded-full">7</span>
                  <p>Achieve BINGO: Complete a row, column, or diagonal to get BINGO!</p>
                </div>
              </div>

            </Modal>

            <Modal
              isOpen={showRemoveModal}

              onClose={() => setShowRemoveModal(false)}
              title="Remove Champion"
              actions={[
                {
                  label: 'Cancel',
                  onClick: () => setShowRemoveModal(false),
                  variant: 'secondary',
                },
                {
                  label: 'Remove',
                  onClick: () => {
                    handleRemoveChampion();
                    setShowRemoveModal(false);
                  },
                  variant: 'danger',
                },
              ]}
            >
              <p>Are you sure you want to remove this champion?</p>
            </Modal>

            <div className="fixed inset-0 pointer-events-none">
              {toastMessage && (
                <Toast 
                  message={toastMessage} 
                  onClose={() => setToastMessage(null)}
                />
              )}
            </div>

            {checkBingo() && (
              <motion.div 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="text-2xl font-bold text-green-600 bg-green-100 px-6 py-3 rounded-full"
              >
                BINGO!
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
