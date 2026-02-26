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

      <div className="relative z-10 text-center mb-12 flex flex-col items-center">
        <motion.img 
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, type: "spring" }}
          src="https://storage.googleapis.com/aistudio-janus-prod-appspot-com/user_content/images/737d2f9d-161b-4b2a-89a1-09d57a41c107.png"
          alt="Бабай Bab-AI"
          className="w-72 md:w-80 drop-shadow-[0_0_25px_rgba(220,38,38,0.5)]"
        />
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
