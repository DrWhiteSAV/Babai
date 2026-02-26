import { useNavigate } from "react-router-dom";
import { usePlayerStore } from "../store/playerStore";
import { motion } from "motion/react";
import {
  Play,
  ShoppingCart,
  Settings,
  User,
  Zap,
  Skull,
  Users,
} from "lucide-react";

export default function GameHub() {
  const navigate = useNavigate();
  const { character, fear, energy } = usePlayerStore();

  if (!character) {
    navigate("/");
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex-1 flex flex-col bg-neutral-950 text-neutral-200 relative overflow-hidden"
    >
      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1519074002996-a69e7ac46a42?q=80&w=1080&auto=format&fit=crop')] bg-cover bg-center opacity-30 pointer-events-none mix-blend-overlay" />
      
      <div className="fog-container">
        <div className="fog-layer"></div>
        <div className="fog-layer-2"></div>
      </div>

      {/* Header Stats */}
      <header className="flex items-center justify-between p-4 bg-neutral-900/80 backdrop-blur-md border-b border-neutral-800 sticky top-0 z-20">
        <div className="flex gap-4">
          <div className="flex items-center gap-1 text-yellow-500 font-mono font-bold">
            <Zap size={16} className="fill-yellow-500" /> {energy}
          </div>
          <div className="flex items-center gap-1 text-red-500 font-mono font-bold">
            <Skull size={16} className="fill-red-500" /> {fear}
          </div>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => navigate("/profile")}
            className="p-2 hover:bg-neutral-800 rounded-full transition-colors flex items-center justify-center"
          >
            <img src={character.avatarUrl} alt="Avatar" className="w-6 h-6 rounded-full object-cover border border-neutral-500" />
          </button>
          <button
            onClick={() => navigate("/settings")}
            className="p-2 hover:bg-neutral-800 rounded-full transition-colors text-neutral-400 hover:text-white"
          >
            <Settings size={20} />
          </button>
        </div>
      </header>

      {/* Character Display */}
      <div className="relative flex-1 flex flex-col items-center justify-center p-6 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-red-900/20 via-neutral-950 to-neutral-950 pointer-events-none" />

        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", damping: 15 }}
          className="relative z-10 text-center"
        >
          <div className="w-48 h-48 mx-auto rounded-full border-4 border-neutral-800 overflow-hidden shadow-[0_0_40px_rgba(220,38,38,0.15)] bg-neutral-900 mb-6 relative group">
            <img
              src={character.avatarUrl}
              alt={character.name}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 ring-inset ring-1 ring-white/10 rounded-full pointer-events-none" />
          </div>

          <h2
            className="text-3xl font-black text-white uppercase tracking-wider"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            {character.name}
          </h2>
          <p className="text-red-500 font-mono text-xs mt-2 uppercase tracking-widest">
            {character.style} • Ур. Телекинеза: {character.telekinesisLevel}
          </p>
        </motion.div>
      </div>

      {/* Action Buttons */}
      <div className="p-6 bg-neutral-900/50 backdrop-blur-sm border-t border-neutral-800 rounded-t-3xl space-y-3 relative z-20">
        <button
          onClick={() => navigate("/game")}
          className="w-full py-4 bg-red-700 hover:bg-red-600 text-white rounded-2xl font-bold text-lg transition-all active:scale-95 flex items-center justify-center gap-3 shadow-[0_0_20px_rgba(220,38,38,0.3)] lightning-btn"
        >
          <Play fill="currentColor" size={20} />
          ИГРАТЬ
        </button>

        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => navigate("/shop")}
            className="py-4 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded-2xl font-medium transition-all active:scale-95 flex flex-col items-center justify-center gap-2 border border-neutral-700"
          >
            <ShoppingCart size={20} className="text-neutral-400" />
            <span className="text-xs uppercase tracking-wider font-bold">
              Магазин
            </span>
          </button>
          <button
            onClick={() => navigate("/friends")}
            className="py-4 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded-2xl font-medium transition-all active:scale-95 flex flex-col items-center justify-center gap-2 border border-neutral-700"
          >
            <Users size={20} className="text-neutral-400" />
            <span className="text-xs uppercase tracking-wider font-bold">
              Друзья
            </span>
          </button>
        </div>
      </div>
    </motion.div>
  );
}
