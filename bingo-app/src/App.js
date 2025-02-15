import { useState, useEffect, useRef } from "react";
import Card from "./components/ui/Card";
import Button from "./components/ui/Button";
import Modal from "./components/ui/Modal";
import { motion } from "framer-motion";


const allChampions = [
  "Ahri", "Akali", "Akshan", "Alistar", "Amumu", "Anivia", "Annie", "Aphelios",
  "Ashe", "AurelionSol", "Azir", "Bard", "Blitzcrank", "Brand", "Braum", "Caitlyn",
  "Camille", "Cassiopeia", "ChoGath", "Corki", "Darius", "Diana", "Draven", "DrMundo",
  "Ekko", "Elise", "Evelynn", "Ezreal", "Fiddlesticks", "Fiora", "Fizz", "Galio",
  "Gangplank", "Garen", "Gnar", "Gragas", "Graves", "Hecarim", "Heimerdinger", "Illaoi",
  "Irelia", "Ivern", "Janna", "JarvanIV", "Jax", "Jayce", "Jhin", "Jinx", "KaiSa",
  "Kalista", "Karma", "Karthus", "Kassadin", "Katarina", "Kayle", "Kayn", "Kennen",
  "KhaZix", "Kindred", "Kled", "KogMaw", "LeBlanc", "LeeSin", "Leona", "Lillia",
  "Lissandra", "Lucian", "Lulu", "Lux", "Malphite", "Malzahar", "Maokai", "MasterYi",
  "MissFortune", "Mordekaiser", "Morgana", "Nami", "Nasus", "Nautilus", "Neeko", "Nidalee",
  "Nocturne", "Nunu", "Olaf", "Orianna", "Ornn", "Pantheon", "Poppy", "Pyke", "Qiyana",
  "Quinn", "Rakan", "Rammus", "RekSai", "Rell", "Renekton", "Rengar", "Riven", "Rumble",
  "Ryze", "Samira", "Sejuani", "Senna", "Seraphine", "Sett", "Shaco", "Shen", "Shyvana",
  "Singed", "Sion", "Sivir", "Skarner", "Sona", "Soraka", "Swain", "Sylas", "Syndra",
  "TahmKench", "Taliyah", "Talon", "Taric", "Teemo", "Thresh", "Tristana", "Trundle",
  "Tryndamere", "TwistedFate", "Twitch", "Udyr", "Urgot", "Varus", "Vayne", "Veigar",
  "VelKoz", "Vi", "Viego", "Viktor", "Vladimir", "Volibear", "Warwick", "Wukong",
  "Xayah", "Xerath", "XinZhao", "Yasuo", "Yone", "Yorick", "Yuumi", "Zac", "Zed",
  "Ziggs", "Zilean", "Zoe", "Zyra"
];

const gridSizes = [4, 5, 6];

export default function Bingo() {
  const [gridSize, setGridSize] = useState(4);
  const [selectedChamps, setSelectedChamps] = useState([]);
  const [grid, setGrid] = useState(Array(4 * 4).fill(null));
  const [marked, setMarked] = useState(Array(4 * 4).fill(false));
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [currentPosition, setCurrentPosition] = useState(0);
  const searchInputRef = useRef(null);

  useEffect(() => {
    setGrid(Array(gridSize * gridSize).fill(null));
    setMarked(Array(gridSize * gridSize).fill(false));
  }, [gridSize]);

  const handleSelectChamp = (champ) => {
    if (selectedChamps.includes(champ)) {
      setSelectedChamps((prev) => prev.filter(c => c !== champ));
      return;
    }

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

  const randomizeGrid = () => {
    if (selectedChamps.length < gridSize * gridSize) {
      alert(`Please select at least ${gridSize * gridSize} champions`);
      return;
    }
    const shuffled = [...selectedChamps].sort(() => Math.random() - 0.5);
    setGrid(shuffled.slice(0, gridSize * gridSize));
    setMarked(Array(gridSize * gridSize).fill(false));
    setCurrentPosition(gridSize * gridSize);
  };


  const handleMark = (index) => {
    setMarked((prev) => {
      const newMarked = [...prev];
      newMarked[index] = !newMarked[index];
      return newMarked;
    });
  };

  const checkBingo = () => {
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

  return (
    <div className="min-h-screen bg-gray-50 p-6 flex flex-col items-center">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Fearless Draft Bingo</h1>
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
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && search) {
              const filtered = allChampions.filter(champ => 
                champ.toLowerCase().includes(search.toLowerCase())
              );
              if (filtered.length > 0) {
                handleSelectChamp(filtered[0]);
                setSearch('');
              }
            }
          }}
          ref={searchInputRef}
        />
        {search && (
          <div className="absolute z-10 mt-1 w-full bg-white rounded-lg shadow-lg max-h-60 overflow-auto">
            {allChampions
              .filter(champ => champ.toLowerCase().includes(search.toLowerCase()))
              .map((champ) => (
                <div
                  key={champ}
                  className="p-2 hover:bg-gray-100 cursor-pointer flex items-center gap-2"
                  onClick={() => {
                    handleSelectChamp(champ);
                    setSearch('');
                    searchInputRef.current.focus();
                  }}
                >
                  <img
                    src={`https://ddragon.leagueoflegends.com/cdn/13.1.1/img/champion/${champ}.png`}
                    alt={champ}
                    className="w-6 h-6 rounded-full"
                    onError={(e) => e.target.src = 'https://via.placeholder.com/24'}
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
                setShowModal(false);
              }}
              className="flex items-center justify-center gap-2 w-full"
            >
              <img
                src={`https://ddragon.leagueoflegends.com/cdn/13.1.1/img/champion/${champ}.png`}
                alt={champ}
                className="w-8 h-8 rounded-full"
                onError={(e) => e.target.src = 'https://via.placeholder.com/32'}
              />
              <span className="text-sm">{champ}</span>
            </Button>
          ))}
        </div>
      </Modal>
      <Button 
        onClick={randomizeGrid} 
        className="bg-primary hover:bg-secondary text-white font-semibold py-3 px-6 rounded-lg mb-6"
        disabled={selectedChamps.length < gridSize * gridSize}
      >
        Randomize Grid
      </Button>
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
            <div className="flex items-center justify-center h-20 cursor-pointer">
              {champ ? (
                <img
                  src={`https://ddragon.leagueoflegends.com/cdn/13.1.1/img/champion/${champ}.png`}
                  alt={champ}
                  className="w-12 h-12 rounded-full"
                onError={(e) => e.target.src = 'https://via.placeholder.com/48'}
                />
              ) : "?"}
            </div>
          </Card>
        ))}
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
