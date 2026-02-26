import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { usePlayerStore } from "../store/playerStore";
import { motion } from "motion/react";
import { ShoppingCart, ArrowLeft, Skull, Zap, Loader2 } from "lucide-react";
import { editAvatarWithItem } from "../services/geminiService";

const SHOP_ITEMS = [
  {
    id: "wig_1",
    name: 'Парик "Одуванчик"',
    type: "Аксессуар",
    cost: 10,
    icon: "💇‍♂️",
  },
  {
    id: "teeth_1",
    name: "Ржавые зубы",
    type: "Аксессуар",
    cost: 15,
    icon: "🦷",
  },
  {
    id: "pajamas_1",
    name: "Кровавая пижама",
    type: "Одежда",
    cost: 25,
    icon: "👕",
  },
  {
    id: "tongue_1",
    name: "Раздвоенный язык",
    type: "Мутация",
    cost: 50,
    icon: "👅",
  },
  {
    id: "weapon_1",
    name: "Ржавая труба",
    type: "Оружие",
    cost: 100,
    icon: "🔧",
  },
];

export default function Shop() {
  const navigate = useNavigate();
  const { fear, inventory, buyItem, upgradeTelekinesis, character, updateCharacter, addToGallery } =
    usePlayerStore();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleBuy = async (item: any) => {
    if (inventory.includes(item.id)) {
      alert("Уже куплено!");
      return;
    }
    
    if (fear < item.cost) {
      alert("Недостаточно страха!");
      return;
    }

    setIsProcessing(true);
    
    // Save current to gallery before changing
    if (character?.avatarUrl) {
      addToGallery(character.avatarUrl);
    }

    const success = buyItem(item.id, item.cost);
    if (success && character) {
      // Edit avatar
      const newAvatar = await editAvatarWithItem(character.avatarUrl, item.name);
      updateCharacter({ avatarUrl: newAvatar });
      alert(`Вы купили: ${item.name}. Внешность обновлена!`);
    }
    
    setIsProcessing(false);
  };

  const handleUpgrade = () => {
    if (!character) return;
    const cost = character.telekinesisLevel * 20;
    if (upgradeTelekinesis(cost)) {
      alert("Телекинез улучшен!");
    } else {
      alert("Недостаточно страха!");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
      className="flex-1 flex flex-col bg-neutral-950 text-neutral-200 relative overflow-hidden"
    >
      <div className="fog-container">
        <div className="fog-layer"></div>
        <div className="fog-layer-2"></div>
      </div>

      <header className="flex items-center justify-between p-4 bg-neutral-900 border-b border-neutral-800 sticky top-0 z-20">
        <button
          onClick={() => navigate("/hub")}
          className="p-2 hover:bg-neutral-800 rounded-full transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-xl font-bold uppercase tracking-widest flex items-center gap-2">
          <ShoppingCart size={20} /> Магазин
        </h1>
        <div className="flex items-center gap-1 text-red-500 font-mono font-bold">
          <Skull size={16} /> {fear}
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-6 space-y-8">
        {/* Shop Logo */}
        <div className="flex justify-center mb-6">
          <img 
            src="https://i.ibb.co/pvJ73kxN/babai2.png" 
            alt="Shop Logo" 
            className="w-48 drop-shadow-[0_0_15px_rgba(220,38,38,0.4)]"
          />
        </div>

        {/* Telekinesis Upgrade */}
        <section>
          <h2 className="text-lg font-bold text-white mb-4 uppercase tracking-wider border-b border-neutral-800 pb-2">
            Способности
          </h2>
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-purple-900/30 flex items-center justify-center text-2xl border border-purple-500/30">
                🧠
              </div>
              <div>
                <h3 className="font-bold text-white">Телекинез</h3>
                <p className="text-xs text-neutral-400">
                  Уровень: {character?.telekinesisLevel}
                </p>
              </div>
            </div>
            <button
              onClick={handleUpgrade}
              className="px-4 py-2 bg-red-900/30 hover:bg-red-900/50 text-red-400 border border-red-900/50 rounded-xl font-bold text-sm transition-colors flex items-center gap-1"
            >
              <Skull size={14} />{" "}
              {character ? character.telekinesisLevel * 20 : 0}
            </button>
          </div>
        </section>

        {/* Items */}
        <section>
          <h2 className="text-lg font-bold text-white mb-4 uppercase tracking-wider border-b border-neutral-800 pb-2">
            Товары
          </h2>
          <div className="grid grid-cols-1 gap-3">
            {SHOP_ITEMS.map((item) => {
              const isOwned = inventory.includes(item.id);
              return (
                <div
                  key={item.id}
                  className={`bg-neutral-900 border ${isOwned ? "border-green-900/50 opacity-70" : "border-neutral-800"} rounded-2xl p-4 flex items-center justify-between transition-colors`}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-neutral-800 flex items-center justify-center text-2xl">
                      {item.icon}
                    </div>
                    <div>
                      <h3 className="font-bold text-white">{item.name}</h3>
                      <p className="text-xs text-neutral-400">{item.type}</p>
                    </div>
                  </div>
                  <button
                    disabled={isOwned || isProcessing}
                    onClick={() => handleBuy(item)}
                    className={`px-4 py-2 rounded-xl font-bold text-sm transition-colors flex items-center gap-1 ${
                      isOwned
                        ? "bg-green-900/20 text-green-500 border border-green-900/30"
                        : "bg-neutral-800 hover:bg-neutral-700 text-white border border-neutral-700"
                    }`}
                  >
                    {isOwned ? (
                      "Куплено"
                    ) : isProcessing ? (
                      <Loader2 size={14} className="animate-spin" />
                    ) : (
                      <>
                        <Skull size={14} /> {item.cost}
                      </>
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </motion.div>
  );
}
