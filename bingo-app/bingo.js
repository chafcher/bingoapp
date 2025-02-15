import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
    
    for (let i = 0; i < size; i++) {
      if (marked.slice(i * size, (i + 1) * size).every(Boolean)) bingo = true;
      if (marked.filter((_, idx) => idx % size === i).every(Boolean)) bingo = true;
    }
    
    if (marked.filter((_, idx) => idx % (size + 1) === 0).every(Boolean)) bingo = true;
    if (marked.filter((_, idx) => idx % (size - 1) === 0 && idx !== 0 && idx !== size * size - 1).every(Boolean)) bingo = true;

    return bingo;
  };

  return (
    <div className="p-6 flex flex-col items-center gap-4">
      <h1 className="text-2xl font-bold">Fearless Draft Bingo</h1>
      <div className="flex gap-2">
        {gridSizes.map((size) => (
          <Button key={size} onClick={() => setGridSize(size)}>{size}x{size}</Button>
        ))}
      </div>
      <input 
        type="text" 
        placeholder="Search for a champion..." 
        className="border p-2 mt-4 w-full max-w-md"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      <div className="grid grid-cols-4 gap-2 mt-4">
        {allChampions.filter(champ => champ.toLowerCase().includes(search.toLowerCase())).map((champ) => (
          <Button key={champ} onClick={() => handleSelectChamp(champ)}>
            <img src={`https://ddragon.leagueoflegends.com/cdn/13.1.1/img/champion/${champ}.png`} alt={champ} className="w-8 h-8 inline mr-2" />
            {champ}
          </Button>
        ))}
      </div>
      <Button onClick={randomizeGrid} className="mt-4">Randomize Grid</Button>
      <div className={`grid grid-cols-${gridSize} gap-2 mt-4 w-full max-w-screen-md`}>
        {grid.map((champ, index) => (
          <Card key={index} onClick={() => handleMark(index)} className={marked[index] ? "bg-green-500" : ""}>
            <CardContent className="flex items-center justify-center h-16 border cursor-pointer">
              {champ ? <img src={`https://ddragon.leagueoflegends.com/cdn/13.1.1/img/champion/${champ}.png`} alt={champ} className="w-12 h-12" /> : "?"}
            </CardContent>
          </Card>
        ))}
      </div>
      {checkBingo() && <motion.div className="text-xl font-bold text-green-500">BINGO!</motion.div>}
    </div>
  );
}
