import { useNavigate } from "react-router-dom";
import { usePlayerStore } from "../store/playerStore";
import { motion } from "motion/react";
import { Play, Settings as SettingsIcon, User } from "lucide-react";

export default function Home() {
  const navigate = useNavigate();
  const character = usePlayerStore((state) => state.character);

  const handlePlay = () => {
    if (character) {
      navigate("/hub");
    } else {
      navigate("/create");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex-1 flex flex-col items-center justify-center p-6 relative"
    >
      <div className="absolute inset-0 bg-[url('https://picsum.photos/seed/babai-bg/1080/1920?blur=4')] bg-cover bg-center opacity-20 pointer-events-none mix-blend-overlay" />

      <div className="relative z-10 text-center mb-12">
        <motion.h1
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, type: "spring" }}
          className="text-7xl font-black tracking-tighter text-red-600 drop-shadow-[0_0_15px_rgba(220,38,38,0.8)] uppercase"
          style={{ fontFamily: "'Playfair Display', serif" }}
        >
          Бабай
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-neutral-400 mt-2 font-mono text-sm tracking-widest uppercase"
        >
          Bab-AI
        </motion.p>
      </div>

      <div className="w-full max-w-xs space-y-4 relative z-10">
        <button
          onClick={handlePlay}
          className="w-full py-4 bg-red-700 hover:bg-red-600 text-white rounded-xl font-bold text-lg transition-all active:scale-95 flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(220,38,38,0.4)]"
        >
          <Play fill="currentColor" size={20} />
          {character ? "ПРОДОЛЖИТЬ" : "НАЧАТЬ"}
        </button>

        {character && (
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => navigate("/profile")}
              className="py-3 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded-xl font-medium transition-all active:scale-95 flex items-center justify-center gap-2 border border-neutral-700"
            >
              <User size={18} />
              Профиль
            </button>
            <button
              onClick={() => navigate("/settings")}
              className="py-3 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded-xl font-medium transition-all active:scale-95 flex items-center justify-center gap-2 border border-neutral-700"
            >
              <SettingsIcon size={18} />
              Настройки
            </button>
          </div>
        )}
      </div>

      <div className="absolute bottom-6 text-center w-full text-neutral-600 text-xs font-mono">
        v1.0.0 &copy; 2026 Bab-AI.ru
      </div>
    </motion.div>
  );
}
