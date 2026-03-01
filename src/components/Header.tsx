import { useNavigate } from "react-router-dom";
import { usePlayerStore, ENERGY_REGEN_RATE } from "../store/playerStore";
import { ArrowLeft, Skull, Zap } from "lucide-react";
import { ReactNode, MouseEvent, useState, useEffect } from "react";

interface HeaderProps {
  title?: ReactNode;
  backUrl?: string;
  onInfoClick?: (type: 'fear' | 'watermelons' | 'energy', e: MouseEvent) => void;
  rightContent?: ReactNode;
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
    <header className="flex flex-col md:flex-row items-center justify-between p-4 bg-neutral-900/80 backdrop-blur-md border-b border-neutral-800 sticky top-0 z-20">
      {/* Mobile: Stats on top, centered */}
      <div className="flex justify-center gap-4 w-full md:w-auto order-1 md:order-2 mb-4 md:mb-0">
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

      {/* Mobile: Back button and Title below */}
      <div className="flex items-center justify-between w-full md:w-auto order-2 md:order-1 mt-4 md:mt-0">
        {backUrl ? (
          <button
            onClick={() => navigate(backUrl)}
            className="p-2 hover:bg-neutral-800 rounded-full transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
        ) : (
          <div className="w-10 md:hidden" />
        )}
        
        {title && (
          <h1 className="text-xl font-bold uppercase tracking-widest flex items-center gap-2 px-2">
            {title}
          </h1>
        )}
        
        <div className="flex gap-2 md:order-3">
          {rightContent}
        </div>
      </div>
    </header>
  );
}
