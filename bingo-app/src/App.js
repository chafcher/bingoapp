import { useState, useEffect } from "react";
import Card from "./components/ui/Card";
import Button from "./components/ui/Button";
import { motion } from "framer-motion";


const allChampions = [
  "Ahri", "Zed", "LeeSin", "Jinx", "Thresh", "Yasuo", "Vayne", "Riven",
  "Darius", "LeBlanc", "Orianna", "KhaZix", "Ashe", "Renekton", "Ezreal", "Lulu"
];

const gridSizes = [4, 5, 6];

export default function Bingo() {
  const [gridSize, setGridSize] = useState(4);
  const [selectedChamps, setSelectedChamps] = useState([]);
  const [grid, setGrid] = useState(Array(4 * 4).fill(null));
  const [marked, setMarked] = useState(Array(4 * 4).fill(false));
  const [search, setSearch] = useState("");

  useEffect(() => {
    setGrid(Array(gridSize * gridSize).fill(null));
    setMarked(Array(gridSize * gridSize).fill(false));
  }, [gridSize]);

  const handleSelectChamp = (champ) => {
    if (selectedChamps.includes(champ)) return;
    setSelectedChamps((prev) => [...prev, champ]);
  };

  const randomizeGrid = () => {
    if (selectedChamps.length < gridSize * gridSize) return;
    const shuffled = [...selectedChamps].sort(() => Math.random() - 0.5);
    setGrid(shuffled.slice(0, gridSize * gridSize));
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
      <input
        type="text"
        placeholder="Search for a champion..."
        className="border border-gray-300 rounded-lg p-3 w-full max-w-md focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 w-full max-w-4xl mb-6">
        {allChampions.filter(champ => champ.toLowerCase().includes(search.toLowerCase())).map((champ) => (
          <Button 
            key={champ} 
            onClick={() => handleSelectChamp(champ)}
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
