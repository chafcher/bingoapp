import { useState, useEffect, useRef } from "react";
import Tooltip from "./components/ui/Tooltip";
import Toast from "./components/ui/Toast";
import { motion } from "framer-motion";
import Switch from "./components/ui/Switch";
import Card from "./components/ui/Card";
import Button from "./components/ui/Button";
import Modal from "./components/ui/Modal";

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

const gridSizes = [5, 6, 7, 8];

export default function Bingo() {
  const [isLoading, setIsLoading] = useState(true);
  const [gridSize, setGridSize] = useState(5);
  const [phase, setPhase] = useState(PHASE.SELECTION);
  const [showRemoveModal, setShowRemoveModal] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [selectedChamps, setSelectedChamps] = useState([]);
  const [grid, setGrid] = useState(Array(gridSize * gridSize).fill(null));
  const [marked, setMarked] = useState(Array(gridSize * gridSize).fill(false));
  const [search, setSearch] = useState("");
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);
  const [currentPosition, setCurrentPosition] = useState(0);
  const searchInputRef = useRef(null);

  // Load saved state on initial render
  useEffect(() => {
    console.log('Attempting to load state from localStorage');
    const savedState = localStorage.getItem('bingoState');
    if (savedState) {
      console.log('Found saved state:', savedState);
      try {
        const state = JSON.parse(savedState);
        console.log('Parsed state:', state);
        
        // Initialize grid size first
        setGridSize(state.gridSize || 5);
        
        // Then initialize other state based on grid size
        const size = state.gridSize || 5;
        setGrid(state.grid || Array(size * size).fill(null));
        setMarked(state.marked || Array(size * size).fill(false));
        setSelectedChamps(state.selectedChamps || []);
        setCurrentPosition(state.grid ? state.grid.length - state.grid.filter(x => x === null).length : 0);
        setPhase(state.phase || PHASE.SELECTION);
        
        console.log('State successfully loaded');
      } catch (error) {
        console.error('Error loading state:', error);
      }
    } else {
      console.log('No saved state found');
      // Initialize default state
      setGrid(Array(gridSize * gridSize).fill(null));
      setMarked(Array(gridSize * gridSize).fill(false));
    }
    setIsLoading(false);
  }, []);

  // Save state whenever it changes
  useEffect(() => {
    console.log('Saving state to localStorage');
    const state = {
      grid,
      marked,
      selectedChamps,
      gridSize,
      phase
    };
    try {
      localStorage.setItem('bingoState', JSON.stringify(state));
      console.log('State successfully saved:', state);
    } catch (error) {
      console.error('Error saving state:', error);
    }
  }, [grid, marked, selectedChamps, gridSize, phase]);

  const handleSelectChamp = (champ) => {
    if (currentPosition >= gridSize * gridSize) {
      alert('Grid is full! Please randomize or clear the grid.');
      return;
    }

    setSelectedChamps((prev) => [...prev, champ]);
    setGrid((prevGrid) => {
      const newGrid = [...prevGrid];
      newGrid[currentPosition] = champ;
      return newGrid;
    });
    setCurrentPosition((prev) => prev + 1);
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
    }
    
    alert('Could not find a valid grid configuration. Please try again or select different champions.');
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

  const checkBingo = () => {
    if (!marked.length) return false;
    
    const size = gridSize;
    let bingo = false;

    // Check rows and columns for bingo
    for (let i = 0; i < size; i++) {
      if (marked.slice(i * size, (i + 1) * size).every(Boolean)) bingo = true;
      if (marked.filter((_, idx) => idx % size === i).every(Boolean)) bingo = true;
    }

    // Check diagonals for bingo
    if (marked.filter((_, idx) => idx % (size + 1) === 0).every(Boolean)) bingo = true;
    if (marked.filter((_, idx) => idx % (size - 1) === 0 && idx !== 0 && idx !== size * size - 1).every(Boolean)) bingo = true;

    return bingo;
  };

  if (isLoading) {
    return <div className="min-h-screen bg-gray-50 p-6 flex flex-col items-center justify-center">
      <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
    </div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6 flex flex-col items-center">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Fearless Draft Bingo</h1>
      <div className="flex items-center gap-3 mb-6">
        <span className="text-sm font-medium">Selection Phase</span>
        <Switch
          checked={phase === PHASE.PLAYING}
          onChange={(checked) => setPhase(checked ? PHASE.PLAYING : PHASE.SELECTION)}
        />
        <span className="text-sm font-medium">Playing Phase</span>
      </div>
      <div className="flex gap-3 mb-6">
        {gridSizes.map((size) => (
          <Button key={size} onClick={() => setGridSize(size)}>{size}x{size}</Button>
        ))}
      </div>
      <div className="w-full max-w-md mb-6 relative">
        <input
          type="text"
          placeholder="Search for a champion..."
          className="border border-gray-300 rounded-lg p-3 w-full focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setHighlightedIndex(0);
          }}
          onKeyDown={(e) => {
            const filtered = allChampions.filter(champ => 
              champ.toLowerCase().includes(search.toLowerCase())
            );
            
            if (e.key === 'Enter' && search && filtered.length > 0) {
              handleSelectChamp(filtered[highlightedIndex]);
              setSearch('');
              setHighlightedIndex(0);
            }
            else if (e.key === 'ArrowDown' && filtered.length > 0) {
              setHighlightedIndex((prev) => 
                Math.min(prev + 1, filtered.length - 1)
              );
            }
            else if (e.key === 'ArrowUp' && filtered.length > 0) {
              setHighlightedIndex((prev) => Math.max(prev - 1, 0));
            }
          }}
          ref={searchInputRef}
        />
        {search && (
          <div className="absolute z-10 mt-1 w-full bg-white rounded-lg shadow-lg max-h-60 overflow-auto">
            {allChampions
              .filter(champ => champ.toLowerCase().includes(search.toLowerCase()))
              .map((champ, index) => (
                <div
                  key={champ}
                  className={`p-2 cursor-pointer flex items-center gap-2 ${
                  index === highlightedIndex ? 'bg-blue-100' : 'hover:bg-gray-100'
                }`}
                  onClick={() => {
                    handleSelectChamp(champ);
                    setToastMessage(`${champ} is added to the grid`);
                    setSearch('');
                    searchInputRef.current.focus();
                  }}
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
        )}
      </div>
      <Button 
        onClick={() => setShowModal(true)}
        className="bg-primary hover:bg-secondary text-white font-semibold py-3 px-6 rounded-lg mb-6"
      >
        Show Champions
      </Button>
      <Modal isOpen={showModal} onClose={() => setShowModal(false)}>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {allChampions.map((champ) => (
            <Button 
              key={champ} 
              onClick={() => {
                handleSelectChamp(champ);
                setToastMessage(`${champ} is added to the grid`);
              }}
              className="flex items-center justify-center gap-2 w-full"
            >
                  <img 
                    src={`/out/${champ}.png`}
                    alt={champ}
                    className="w-8 h-8 rounded-full"
                    onError={(e) => e.target.src = '/fallback-champion-icon.png'}
                  />

              <span className="text-sm">{champ}</span>
            </Button>
          ))}
        </div>
      </Modal>
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
              // Create a set of unique champions
              const uniqueChamps = [...new Set(allChampions)];
              
              // Shuffle and select the required number of unique champions
              const shuffled = uniqueChamps
                .sort(() => Math.random() - 0.5)
                .slice(0, gridSize * gridSize);
                
              setGrid(shuffled);
              setSelectedChamps(shuffled);
              setCurrentPosition(gridSize * gridSize);
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
              localStorage.removeItem('bingoState');
            }}
            className="bg-red-500 hover:bg-red-600 text-white font-semibold py-3 px-6 rounded-lg"
            disabled={selectedChamps.length === 0}
          >
            Clear Grid
          </Button>
        </Tooltip>
      </div>
      <div
        className={`grid gap-3 w-full max-w-4xl`}
        style={{
          gridTemplateColumns: `repeat(${gridSize}, 1fr)`
        }}
      >
        {grid.map((champ, index) => (
          <Card
            key={index}
            onClick={() => handleMark(index)}
            className={`p-3 rounded-lg shadow-sm transition-all ${
              marked[index] ? "bg-green-500" : "bg-white hover:bg-gray-100"
            }`}
          >
            <div className="flex items-center justify-center h-20 cursor-pointer relative">
              {champ ? (
                <>
                  <img
                    src={`/out/${champ}.png`}
                    alt={champ}
                    className="w-12 h-12 rounded-full"
                    onError={(e) => e.target.src = '/fallback-champion-icon.png'}
                  />
                  {marked[index] && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-red-600 text-4xl font-bold">X</span>
                    </div>
                  )}
                </>
              ) : "?"}
            </div>
          </Card>
        ))}
      </div>
      <Modal
        isOpen={showRemoveModal}
        onClose={() => setShowRemoveModal(false)}
        title="Remove Champion"
        actions={[
          {
            label: 'Cancel',
            onClick: () => setShowRemoveModal(false),
            variant: 'secondary'
          },
          {
            label: 'Remove',
            onClick: () => {
              handleRemoveChampion();
              setShowRemoveModal(false);
            },
            variant: 'danger'
          }

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
  );
}
