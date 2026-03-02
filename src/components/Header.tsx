import { useNavigate } from "react-router-dom";
import { usePlayerStore, ENERGY_REGEN_RATE } from "../store/playerStore";
import { ArrowLeft, Skull, Zap } from "lucide-react";
import { ReactNode, MouseEvent, useState, useEffect } from "react";

interface HeaderProps {
  title?: ReactNode;
  backUrl?: string;
  onInfoClick?: (type: 'fear' | 'watermelons' | 'energy', e: MouseEvent) => void;
  rightContent?: ReactNode; // We will use this for the profile icons
}

export default function Header({ title, backUrl, onInfoClick, rightContent }: HeaderProps) {
  const navigate = useNavigate();
  const { fear, watermelons, energy, lastEnergyUpdate } = usePlayerStore();
  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = Date.now();
      const diff = now - lastEnergyUpdate;
      const remaining = ENERGY_REGEN_RATE - (diff % ENERGY_REGEN_RATE);
      setTimeLeft(Math.floor(remaining / 1000));
    };

    calculateTimeLeft();
    const interval = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(interval);
  }, [lastEnergyUpdate]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <header 
      className="relative p-4 bg-neutral-900/80 backdrop-blur-md border-b border-neutral-800 sticky top-0 z-20 shrink-0"
      style={{ fontSize: '16px' }} // Fixed font size for header
    >
      {/* Back Button (absolute top-left, with 1 row padding equivalent) */}
      {backUrl && (
        <div className="absolute left-4 top-4 mt-6">
          <button
            onClick={() => navigate(backUrl)}
            className="p-2 hover:bg-neutral-800 rounded-full transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
        </div>
      )}

      <div className="flex flex-col items-center justify-center w-full">
        {/* Row 1: Stats */}
        <div className="flex items-center justify-center gap-4 mb-2">
          <div 
            className="flex flex-col items-center justify-center cursor-pointer hover:opacity-80 transition-opacity"
            onClick={(e) => onInfoClick?.('energy', e)}
          >
            <div className="flex items-center gap-1 text-yellow-500 font-bold">
              <Zap size={16} /> {energy}
            </div>
            <div className="text-[10px] text-yellow-500/70 font-bold -mt-1">
              {formatTime(timeLeft)}
            </div>
          </div>
          <div 
            className="flex items-center gap-1 text-red-500 font-bold cursor-pointer hover:opacity-80 transition-opacity"
            onClick={(e) => onInfoClick?.('fear', e)}
          >
            <Skull size={16} /> {fear}
          </div>
          <div 
            className="flex items-center gap-1 text-green-500 font-bold cursor-pointer hover:opacity-80 transition-opacity"
            onClick={(e) => onInfoClick?.('watermelons', e)}
          >
            🍉 {watermelons}
          </div>
        </div>

        {/* Extra Content (Profile icons) */}
        {rightContent && (
          <div className="flex justify-center w-full mb-2">
            {rightContent}
          </div>
        )}

        {/* Row 2: Title */}
        {title && (
          <h1 className="text-xl font-bold uppercase tracking-widest text-center flex items-center justify-center gap-2">
            {title}
          </h1>
        )}
      </div>
    </header>
  );
}
