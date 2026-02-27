import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { usePlayerStore } from "../store/playerStore";
import { motion, AnimatePresence } from "motion/react";
import { ShoppingCart, ArrowLeft, Skull, Zap, Loader2, X } from "lucide-react";
import { editAvatarWithItem } from "../services/geminiService";
import CurrencyModal, { CurrencyType } from "../components/CurrencyModal";
import { SHOP_ITEMS, BOSS_ITEMS } from "../data/items";

export default function Shop() {
  const navigate = useNavigate();
  const { fear, watermelons, inventory, buyItem, upgradeTelekinesis, upgradeBossLevel, bossLevel, character, updateCharacter, addToGallery } =
    usePlayerStore();
  const [isProcessing, setIsProcessing] = useState(false);
  const [infoModal, setInfoModal] = useState<CurrencyType>(null);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [warningModal, setWarningModal] = useState<{ item: any, deficit: number } | null>(null);

  const handleBuy = async (item: any) => {
    if (inventory.includes(item.id)) {
      alert("Уже куплено!");
      return;
    }
    
    if (item.currency === "watermelons" && watermelons < item.cost) {
      setWarningModal({ item, deficit: item.cost - watermelons });
      return;
    } else if (item.currency === "fear" && fear < item.cost) {
      setWarningModal({ item, deficit: item.cost - fear });
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
      const allOwnedItems = [...inventory, item.id]
        .map(id => [...SHOP_ITEMS, ...BOSS_ITEMS].find(i => i.id === id)?.name)
        .filter(Boolean) as string[];
      
      const newAvatar = await editAvatarWithItem(character.avatarUrl, character, allOwnedItems, item.name);
      updateCharacter({ avatarUrl: newAvatar });
      alert(`Вы купили: ${item.name}. Внешность обновлена!`);
    }
    
    setIsProcessing(false);
  };

  const handleUpgrade = () => {
    if (!character) return;
    const cost = 50 * Math.pow(2, character.telekinesisLevel - 1);
    if (fear < cost) {
      setWarningModal({ 
        item: { name: "Телекинез", currency: "fear" }, 
        deficit: cost - fear 
      });
      return;
    }
    if (upgradeTelekinesis(cost)) {
      alert("Телекинез улучшен!");
    }
  };

  const handleUpgradeBoss = () => {
    const cost = 500 * Math.pow(5, bossLevel - 1);
    if (watermelons < cost) {
      setWarningModal({ 
        item: { name: "Усиление Босса", currency: "watermelons" }, 
        deficit: cost - watermelons 
      });
      return;
    }
    if (upgradeBossLevel(cost)) {
      alert("Уровень босса повышен!");
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

        {/* Upgrades */}
        <section>
          <h2 className="text-lg font-bold text-white mb-4 uppercase tracking-wider border-b border-neutral-800 pb-2">
            Способности и Улучшения
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div 
              onClick={() => setSelectedItem({
                id: "telekinesis",
                name: "Телекинез",
                type: "Способность",
                icon: "🧠",
                description: `Увеличивает количество получаемого страха за правильные ответы. Текущий бонус: +${character ? character.telekinesisLevel - 1 : 0} страха.`,
                cost: 50 * Math.pow(2, (character?.telekinesisLevel || 1) - 1),
                currency: "fear",
                isUpgrade: true,
                action: handleUpgrade
              })}
              className="bg-neutral-900 border border-neutral-800 hover:border-neutral-600 rounded-2xl p-4 flex flex-col items-center text-center gap-3 transition-colors cursor-pointer"
            >
              <div className="w-16 h-16 rounded-2xl bg-purple-900/30 flex items-center justify-center text-3xl border border-purple-500/30 shadow-inner">
                🧠
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-white leading-tight">Телекинез</h3>
                <p className="text-[10px] text-neutral-500 uppercase tracking-wider mt-1">Уровень: {character?.telekinesisLevel}</p>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleUpgrade();
                }}
                className={`w-full py-2 rounded-xl font-bold text-sm transition-colors flex items-center justify-center gap-1 ${
                  character && fear >= 50 * Math.pow(2, character.telekinesisLevel - 1)
                    ? "bg-red-900/30 hover:bg-red-900/50 text-red-400 border border-red-900/50"
                    : "bg-neutral-800 hover:bg-neutral-700 text-white border border-neutral-700"
                }`}
              >
                <Skull size={14} />{" "}
                {character ? 50 * Math.pow(2, character.telekinesisLevel - 1) : 0}
              </button>
            </div>

            <div 
              onClick={() => setSelectedItem({
                id: "boss_level",
                name: "Усиление Босса",
                type: "Улучшение",
                icon: "👹",
                description: `Увеличивает здоровье босса и награду за его убийство. Текущая награда: ${25 * Math.pow(2, bossLevel - 1)} арбузов.`,
                cost: 500 * Math.pow(5, bossLevel - 1),
                currency: "watermelons",
                isUpgrade: true,
                action: handleUpgradeBoss
              })}
              className="bg-neutral-900 border border-neutral-800 hover:border-neutral-600 rounded-2xl p-4 flex flex-col items-center text-center gap-3 transition-colors cursor-pointer"
            >
              <div className="w-16 h-16 rounded-2xl bg-green-900/30 flex items-center justify-center text-3xl border border-green-500/30 shadow-inner">
                👹
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-white leading-tight">Усиление Босса</h3>
                <p className="text-[10px] text-neutral-500 uppercase tracking-wider mt-1">Уровень: {bossLevel}</p>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleUpgradeBoss();
                }}
                className={`w-full py-2 rounded-xl font-bold text-sm transition-colors flex items-center justify-center gap-1 ${
                  watermelons >= 500 * Math.pow(5, bossLevel - 1)
                    ? "bg-green-900/30 hover:bg-green-900/50 text-green-400 border border-green-900/50"
                    : "bg-neutral-800 hover:bg-neutral-700 text-white border border-neutral-700"
                }`}
              >
                🍉 {500 * Math.pow(5, bossLevel - 1)}
              </button>
            </div>
          </div>
        </section>

        {/* Items */}
        <section>
          <h2 className="text-lg font-bold text-white mb-4 uppercase tracking-wider border-b border-neutral-800 pb-2">
            Товары за Страх
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {SHOP_ITEMS.map((item) => {
              const isOwned = inventory.includes(item.id);
              return (
                <div
                  key={item.id}
                  onClick={() => setSelectedItem(item)}
                  className={`bg-neutral-900 border ${isOwned ? "border-green-900/50 opacity-70" : "border-neutral-800 hover:border-neutral-600"} rounded-2xl p-4 flex flex-col items-center text-center gap-3 transition-colors cursor-pointer`}
                >
                  <div className="w-16 h-16 rounded-2xl bg-neutral-800 flex items-center justify-center text-3xl shadow-inner">
                    {item.icon}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-white leading-tight">{item.name}</h3>
                    <p className="text-[10px] text-neutral-500 uppercase tracking-wider mt-1">{item.type}</p>
                  </div>
                  <button
                    disabled={isOwned || isProcessing}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleBuy(item);
                    }}
                    className={`w-full py-2 rounded-xl font-bold text-sm transition-colors flex items-center justify-center gap-1 ${
                      isOwned
                        ? "bg-green-900/20 text-green-500 border border-green-900/30"
                        : fear >= item.cost
                        ? "bg-red-900/30 hover:bg-red-900/50 text-red-400 border border-red-900/50"
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {BOSS_ITEMS.map((item) => {
              const isOwned = inventory.includes(item.id);
              return (
                <div
                  key={item.id}
                  onClick={() => setSelectedItem(item)}
                  className={`bg-neutral-900 border ${isOwned ? "border-green-900/50 opacity-70" : "border-neutral-800 hover:border-neutral-600"} rounded-2xl p-4 flex flex-col items-center text-center gap-3 transition-colors cursor-pointer`}
                >
                  <div className="w-16 h-16 rounded-2xl bg-neutral-800 flex items-center justify-center text-3xl shadow-inner">
                    {item.icon}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-white leading-tight">{item.name}</h3>
                    <p className="text-[10px] text-neutral-500 uppercase tracking-wider mt-1">{item.type}</p>
                  </div>
                  <button
                    disabled={isOwned || isProcessing}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleBuy(item);
                    }}
                    className={`w-full py-2 rounded-xl font-bold text-sm transition-colors flex items-center justify-center gap-1 ${
                      isOwned
                        ? "bg-green-900/20 text-green-500 border border-green-900/30"
                        : watermelons >= item.cost
                        ? "bg-green-900/30 hover:bg-green-900/50 text-green-400 border border-green-900/50"
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
                  disabled={(!selectedItem.isUpgrade && inventory.includes(selectedItem.id)) || isProcessing}
                  onClick={() => {
                    if (selectedItem.isUpgrade) {
                      selectedItem.action();
                      if (selectedItem.currency === "fear" && fear >= selectedItem.cost) setSelectedItem(null);
                      if (selectedItem.currency === "watermelons" && watermelons >= selectedItem.cost) setSelectedItem(null);
                    } else {
                      handleBuy(selectedItem);
                      if (selectedItem.currency === "fear" && fear >= selectedItem.cost) setSelectedItem(null);
                      if (selectedItem.currency === "watermelons" && watermelons >= selectedItem.cost) setSelectedItem(null);
                    }
                  }}
                  className={`mt-4 w-full py-4 rounded-xl font-black uppercase tracking-widest transition-colors flex items-center justify-center gap-2 ${
                    !selectedItem.isUpgrade && inventory.includes(selectedItem.id)
                      ? "bg-green-900/20 text-green-500 border border-green-900/30"
                      : (selectedItem.currency === "fear" && fear >= selectedItem.cost) || (selectedItem.currency === "watermelons" && watermelons >= selectedItem.cost)
                      ? "bg-neutral-100 hover:bg-white text-neutral-900"
                      : "bg-neutral-800 text-neutral-400 border border-neutral-700"
                  }`}
                >
                  {!selectedItem.isUpgrade && inventory.includes(selectedItem.id) ? (
                    "УЖЕ КУПЛЕНО"
                  ) : isProcessing ? (
                    <Loader2 size={20} className="animate-spin" />
                  ) : (
                    <>
                      {selectedItem.isUpgrade ? "УЛУЧШИТЬ ЗА" : "КУПИТЬ ЗА"} {selectedItem.cost} {selectedItem.currency === 'fear' ? <Skull size={18} /> : '🍉'}
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {warningModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" onClick={() => setWarningModal(null)}>
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-neutral-900 border border-red-900/50 rounded-3xl p-6 max-w-sm w-full relative shadow-[0_0_40px_rgba(220,38,38,0.2)]"
            >
              <button onClick={() => setWarningModal(null)} className="absolute top-4 right-4 text-neutral-400 hover:text-white p-2 bg-neutral-800 rounded-full transition-colors">
                <X size={20} />
              </button>
              
              <div className="flex flex-col items-center text-center gap-4 mt-2">
                <div className="w-20 h-20 rounded-full bg-red-900/20 flex items-center justify-center text-red-500 mb-2">
                  <Skull size={40} />
                </div>
                
                <div>
                  <h2 className="text-xl font-black text-white uppercase tracking-wider">Недостаточно ресурсов</h2>
                  <p className="text-sm font-bold text-red-400 mt-1">Отказ в выдаче: {warningModal.item.name}</p>
                </div>
                
                <p className="text-neutral-300 leading-relaxed text-sm bg-neutral-800/50 p-4 rounded-xl border border-neutral-700/30 w-full">
                  Эй, Бабай! Твоих запасов не хватает для этой крутой штуки. 
                  Тебе нужно еще <strong className={warningModal.item.currency === 'fear' ? 'text-red-400' : 'text-green-400'}>
                    {warningModal.deficit} {warningModal.item.currency === 'fear' ? 'страха' : 'арбузов'}
                  </strong>, чтобы получить это. 
                  Иди пугай жильцов или побеждай боссов!
                </p>

                <button
                  onClick={() => setWarningModal(null)}
                  className="mt-2 w-full py-3 rounded-xl font-bold uppercase tracking-widest bg-neutral-800 hover:bg-neutral-700 text-white transition-colors"
                >
                  Понятно
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
