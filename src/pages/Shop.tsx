import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { usePlayerStore } from "../store/playerStore";
import { motion, AnimatePresence } from "motion/react";
import { ShoppingCart, ArrowLeft, Skull, Zap, Loader2, X } from "lucide-react";
import { editAvatarWithItem } from "../services/geminiService";
import CurrencyModal, { CurrencyType } from "../components/CurrencyModal";

const SHOP_ITEMS = [
  {
    id: "wig_1",
    name: 'Парик "Одуванчик"',
    type: "Аксессуар",
    cost: 10,
    currency: "fear",
    icon: "💇‍♂️",
    description: "Стильный парик, который заставит монстров чихать. Немного щекочет уши, но зато выглядит эффектно.",
  },
  {
    id: "teeth_1",
    name: "Ржавые зубы",
    type: "Аксессуар",
    cost: 15,
    currency: "fear",
    icon: "🦷",
    description: "Ржавые зубы для устрашения соседей. Не рекомендуется использовать для пережевывания твердой пищи.",
  },
  {
    id: "pajamas_1",
    name: "Кровавая пижама",
    type: "Одежда",
    cost: 25,
    currency: "fear",
    icon: "👕",
    description: "Удобная, но слегка испачканная пижама. Монстры подумают, что вы уже с кем-то подрались.",
  },
  {
    id: "tongue_1",
    name: "Раздвоенный язык",
    type: "Мутация",
    cost: 50,
    currency: "fear",
    icon: "👅",
    description: "Позволяет шипеть на врагов с двойной эффективностью. Отлично подходит для передразнивания змей.",
  },
  {
    id: "weapon_1",
    name: "Ржавая труба",
    type: "Оружие",
    cost: 100,
    currency: "fear",
    icon: "🔧",
    description: "Надежный аргумент в любом споре с нечистью. Тяжелая, холодная и очень убедительная.",
  },
  {
    id: "mantle_1",
    name: "Мантия",
    type: "Одежда",
    cost: 5000,
    currency: "fear",
    icon: "🧥",
    description: "Темная мантия, скрывающая вас во мраке. Идеально подходит для драматичных появлений.",
  },
  {
    id: "cloak_1",
    name: "Плащ невидимка",
    type: "Одежда",
    cost: 10000,
    currency: "fear",
    icon: "🥷",
    description: "Делает вас почти невидимым для глупых монстров. Главное — не наступить на кота в темноте.",
  },
  {
    id: "predator_suit",
    name: "Костюм Хищника",
    type: "Одежда",
    cost: 20000,
    currency: "fear",
    icon: "👽",
    description: "Высокотехнологичный костюм инопланетного охотника. Встроенный тепловизор в комплект не входит.",
  },
  {
    id: "cyber_implants",
    name: "Кибер-импланты",
    type: "Мутация",
    cost: 40000,
    currency: "fear",
    icon: "🦾",
    description: "Металлические импланты, делающие вас киборгом. Теперь вы можете заряжать телефон от пальца.",
  },
  {
    id: "exoskeleton",
    name: "Экзоскелет",
    type: "Броня",
    cost: 80000,
    currency: "fear",
    icon: "🤖",
    description: "Мощный каркас, многократно увеличивающий силу. Позволяет открывать банки с огурцами без усилий.",
  },
  {
    id: "astronaut_helmet",
    name: "Шлем Астронавта",
    type: "Аксессуар",
    cost: 150000,
    currency: "fear",
    icon: "👨‍🚀",
    description: "Защитит голову даже в открытом космосе. И от падающих с потолка пауков.",
  },
  {
    id: "doomguy_armor",
    name: "Броня Думгая",
    type: "Броня",
    cost: 300000,
    currency: "fear",
    icon: "🪖",
    description: "Броня легендарного палача рока. Демоны в ужасе разбегаются при одном вашем виде.",
  },
  {
    id: "one_ring",
    name: "Кольцо Всевластия",
    type: "Аксессуар",
    cost: 500000,
    currency: "fear",
    icon: "💍",
    description: "Моя прелесть... Дает невероятную власть над тенями, но вызывает странную тягу к вулканам.",
  },
  {
    id: "amulet_ancients",
    name: "Амулет Древних",
    type: "Аксессуар",
    cost: 1000000,
    currency: "fear",
    icon: "🧿",
    description: "Древний артефакт, пульсирующий темной энергией. Никто не знает, что он делает, но выглядит круто.",
  },
  {
    id: "crown_darkness",
    name: "Корона Тьмы",
    type: "Аксессуар",
    cost: 2000000,
    currency: "fear",
    icon: "👑",
    description: "Символ абсолютной власти над ночными кошмарами. Вы — новый повелитель этого хаба.",
  },
];

const BOSS_ITEMS = [
  {
    id: "pajama_home",
    name: "Домашняя пижама",
    type: "Пижама (+1 сек к боссу)",
    cost: 25,
    currency: "watermelons",
    icon: "🏠",
    description: "Мягкая и уютная. Дает немного больше времени, чтобы закликать босса.",
  },
  {
    id: "pajama_forest",
    name: "Лесная пижама",
    type: "Пижама (+5 сек к боссу)",
    cost: 250,
    currency: "watermelons",
    icon: "🌲",
    description: "Сшита из листьев и мха. Боссы путают вас с кустом и атакуют медленнее.",
  },
  {
    id: "pajama_star",
    name: "Звездная пижама",
    type: "Пижама (+15 сек к боссу)",
    cost: 2500,
    currency: "watermelons",
    icon: "⭐",
    description: "Светится в темноте. Ослепляет боссов, давая вам огромное преимущество по времени.",
  },
  {
    id: "tongue_frog",
    name: "Язык лягушки",
    type: "Язык (Урон боссу: 2)",
    cost: 100,
    currency: "watermelons",
    icon: "🐸",
    description: "Длинный и липкий. Позволяет наносить двойной урон при каждом клике по боссу.",
  },
  {
    id: "tongue_anteater",
    name: "Язык муравьеда",
    type: "Язык (Урон боссу: 3)",
    cost: 500,
    currency: "watermelons",
    icon: "🐜",
    description: "Очень длинный и очень липкий. Тройной урон по боссам гарантирован.",
  },
  {
    id: "tongue_chameleon",
    name: "Язык хамелеона",
    type: "Язык (Урон боссу: 4)",
    cost: 5000,
    currency: "watermelons",
    icon: "🦎",
    description: "Молниеносный удар. Четверной урон превращает битвы с боссами в легкую прогулку.",
  },
];

export default function Shop() {
  const navigate = useNavigate();
  const { fear, watermelons, inventory, buyItem, upgradeTelekinesis, character, updateCharacter, addToGallery } =
    usePlayerStore();
  const [isProcessing, setIsProcessing] = useState(false);
  const [infoModal, setInfoModal] = useState<CurrencyType>(null);
  const [selectedItem, setSelectedItem] = useState<any>(null);

  const handleBuy = async (item: any) => {
    if (inventory.includes(item.id)) {
      alert("Уже куплено!");
      return;
    }
    
    if (item.currency === "watermelons" && watermelons < item.cost) {
      alert("Недостаточно арбузов!");
      return;
    } else if (item.currency === "fear" && fear < item.cost) {
      alert("Недостаточно страха!");
      return;
    }

    setIsProcessing(true);
    
    // Save current to gallery before changing
    if (character?.avatarUrl) {
      addToGallery(character.avatarUrl);
    }

    const success = buyItem(item.id, item.cost, item.currency);
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
    const cost = 50 * Math.pow(2, character.telekinesisLevel - 1);
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
      <div className="absolute inset-0 bg-[url('https://picsum.photos/seed/shopbg/1080/1920?blur=3')] bg-cover bg-center opacity-20 pointer-events-none mix-blend-overlay" />
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
        <div className="flex gap-4">
          <div 
            className="flex items-center gap-1 text-red-500 font-mono font-bold cursor-pointer hover:opacity-80 transition-opacity"
            onClick={() => setInfoModal('fear')}
          >
            <Skull size={16} /> {fear}
          </div>
          <div 
            className="flex items-center gap-1 text-green-500 font-mono font-bold cursor-pointer hover:opacity-80 transition-opacity"
            onClick={() => setInfoModal('watermelons')}
          >
            🍉 {watermelons}
          </div>
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
                <p className="text-[10px] text-purple-400 mt-1">
                  +{character ? character.telekinesisLevel - 1 : 0} страха при успехе
                </p>
              </div>
            </div>
            <button
              onClick={handleUpgrade}
              className="px-4 py-2 bg-red-900/30 hover:bg-red-900/50 text-red-400 border border-red-900/50 rounded-xl font-bold text-sm transition-colors flex items-center gap-1"
            >
              <Skull size={14} />{" "}
              {character ? 50 * Math.pow(2, character.telekinesisLevel - 1) : 0}
            </button>
          </div>
        </section>

        {/* Items */}
        <section>
          <h2 className="text-lg font-bold text-white mb-4 uppercase tracking-wider border-b border-neutral-800 pb-2">
            Товары за Страх
          </h2>
          <div className="grid grid-cols-1 gap-3">
            {SHOP_ITEMS.map((item) => {
              const isOwned = inventory.includes(item.id);
              return (
                <div
                  key={item.id}
                  onClick={() => setSelectedItem(item)}
                  className={`bg-neutral-900 border ${isOwned ? "border-green-900/50 opacity-70" : "border-neutral-800 hover:border-neutral-600"} rounded-2xl p-4 flex items-center justify-between transition-colors cursor-pointer`}
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
                    onClick={(e) => {
                      e.stopPropagation();
                      handleBuy(item);
                    }}
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

        {/* Boss Items */}
        <section>
          <h2 className="text-lg font-bold text-white mb-4 uppercase tracking-wider border-b border-neutral-800 pb-2">
            Экипировка для Боссов
          </h2>
          <div className="grid grid-cols-1 gap-3">
            {BOSS_ITEMS.map((item) => {
              const isOwned = inventory.includes(item.id);
              return (
                <div
                  key={item.id}
                  onClick={() => setSelectedItem(item)}
                  className={`bg-neutral-900 border ${isOwned ? "border-green-900/50 opacity-70" : "border-neutral-800 hover:border-neutral-600"} rounded-2xl p-4 flex items-center justify-between transition-colors cursor-pointer`}
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
                    onClick={(e) => {
                      e.stopPropagation();
                      handleBuy(item);
                    }}
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
                        🍉 {item.cost}
                      </>
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        </section>
      </div>

      <CurrencyModal type={infoModal} onClose={() => setInfoModal(null)} />

      <AnimatePresence>
        {selectedItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setSelectedItem(null)}>
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6 max-w-sm w-full relative shadow-2xl"
            >
              <button onClick={() => setSelectedItem(null)} className="absolute top-4 right-4 text-neutral-400 hover:text-white p-2 bg-neutral-800 rounded-full transition-colors">
                <X size={20} />
              </button>
              
              <div className="flex flex-col items-center text-center gap-4 mt-2">
                <div className="w-24 h-24 rounded-2xl bg-neutral-800 flex items-center justify-center text-5xl border border-neutral-700/50 shadow-inner">
                  {selectedItem.icon}
                </div>
                
                <div>
                  <h2 className="text-2xl font-black text-white">{selectedItem.name}</h2>
                  <p className="text-sm font-bold text-neutral-500 uppercase tracking-widest mt-1">{selectedItem.type}</p>
                </div>
                
                <p className="text-neutral-300 leading-relaxed text-sm bg-neutral-800/50 p-4 rounded-xl border border-neutral-700/30 w-full">
                  {selectedItem.description}
                </p>

                <button
                  disabled={inventory.includes(selectedItem.id) || isProcessing}
                  onClick={() => {
                    handleBuy(selectedItem);
                    setSelectedItem(null);
                  }}
                  className={`mt-4 w-full py-4 rounded-xl font-black uppercase tracking-widest transition-colors flex items-center justify-center gap-2 ${
                    inventory.includes(selectedItem.id)
                      ? "bg-green-900/20 text-green-500 border border-green-900/30"
                      : "bg-neutral-100 hover:bg-white text-neutral-900"
                  }`}
                >
                  {inventory.includes(selectedItem.id) ? (
                    "УЖЕ КУПЛЕНО"
                  ) : isProcessing ? (
                    <Loader2 size={20} className="animate-spin" />
                  ) : (
                    <>
                      КУПИТЬ ЗА {selectedItem.cost} {selectedItem.currency === 'fear' ? <Skull size={18} /> : '🍉'}
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
