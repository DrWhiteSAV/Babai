import { useNavigate } from "react-router-dom";
import { usePlayerStore } from "../store/playerStore";
import { motion } from "motion/react";
import { User, ArrowLeft, Copy, Share2, Trophy } from "lucide-react";

export default function Profile() {
  const navigate = useNavigate();
  const { character, fear, energy, inventory } = usePlayerStore();

  if (!character) {
    navigate("/");
    return null;
  }

  const handleCopyRef = () => {
    navigator.clipboard.writeText(`https://bab-ai.ru/invite/${character.name}`);
    alert("Ссылка скопирована!");
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
          <User size={20} /> Профиль
        </h1>
        <div className="w-10" /> {/* Spacer */}
      </header>

      <div className="flex-1 overflow-y-auto p-6 space-y-8">
        {/* Avatar & Info */}
        <section className="flex flex-col items-center text-center">
          <div className="w-32 h-32 rounded-full border-4 border-red-900/50 overflow-hidden shadow-[0_0_30px_rgba(220,38,38,0.2)] bg-neutral-900 mb-4 relative">
            <img
              src={character.avatarUrl}
              alt={character.name}
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
          <h2
            className="text-3xl font-black text-white uppercase tracking-wider"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            {character.name}
          </h2>
          <p className="text-red-500 font-mono text-sm mt-1 uppercase tracking-widest">
            {character.gender} • {character.style}
          </p>
          <div className="flex gap-2 mt-4 flex-wrap justify-center">
            {character.wishes.map((w, i) => (
              <span
                key={i}
                className="px-3 py-1 bg-neutral-900 border border-neutral-800 rounded-full text-xs text-neutral-400"
              >
                {w}
              </span>
            ))}
          </div>
        </section>

        {/* Stats */}
        <section className="grid grid-cols-2 gap-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4 flex flex-col items-center justify-center">
            <span className="text-3xl font-black text-white">{fear}</span>
            <span className="text-xs text-neutral-500 uppercase tracking-widest mt-1">
              Страх
            </span>
          </div>
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4 flex flex-col items-center justify-center">
            <span className="text-3xl font-black text-white">{energy}</span>
            <span className="text-xs text-neutral-500 uppercase tracking-widest mt-1">
              Энергия
            </span>
          </div>
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4 flex flex-col items-center justify-center col-span-2">
            <span className="text-3xl font-black text-white">
              {character.telekinesisLevel}
            </span>
            <span className="text-xs text-neutral-500 uppercase tracking-widest mt-1">
              Уровень Телекинеза
            </span>
          </div>
        </section>

        {/* Inventory */}
        <section>
          <h3 className="text-lg font-bold text-white mb-4 uppercase tracking-wider border-b border-neutral-800 pb-2 flex items-center gap-2">
            <Trophy size={18} /> Инвентарь ({inventory.length})
          </h3>
          {inventory.length === 0 ? (
            <p className="text-neutral-500 text-sm italic text-center py-4">
              Пусто. Загляните в магазин.
            </p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {inventory.map((item, i) => (
                <span
                  key={i}
                  className="px-3 py-1 bg-red-900/20 border border-red-900/30 rounded-lg text-sm text-red-200"
                >
                  {item}
                </span>
              ))}
            </div>
          )}
        </section>

        {/* Referral */}
        <section className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5">
          <h3 className="text-lg font-bold text-white mb-2 uppercase tracking-wider flex items-center gap-2">
            <Share2 size={18} /> Пригласи друга
          </h3>
          <p className="text-xs text-neutral-400 mb-4">
            Получи 100 энергии и 100 страха за каждого друга, который
            присоединится по твоей ссылке.
          </p>
          <div className="flex items-center gap-2">
            <div className="flex-1 bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-3 text-sm font-mono text-neutral-500 truncate">
              bab-ai.ru/invite/
              {character.name.replace(/\s+/g, "").toLowerCase()}
            </div>
            <button
              onClick={handleCopyRef}
              className="p-3 bg-red-700 hover:bg-red-600 text-white rounded-xl transition-colors flex items-center justify-center"
            >
              <Copy size={18} />
            </button>
          </div>
        </section>
      </div>
    </motion.div>
  );
}
