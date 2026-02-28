import { useNavigate, useLocation } from "react-router-dom";
import { usePlayerStore } from "../store/playerStore";
import { Home, ShoppingCart, Settings, Users } from "lucide-react";
import { motion } from "motion/react";

export default function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const { character } = usePlayerStore();

  const navItems = [
    { path: "/hub", icon: <Home size={24} />, label: "Главная" },
    { path: "/shop", icon: <ShoppingCart size={24} />, label: "Магазин" },
    { 
      path: "/profile", 
      icon: character?.avatarUrl ? (
        <img src={character.avatarUrl} alt="profile" className="w-6 h-6 rounded-full object-cover border border-neutral-500" />
      ) : (
        <div className="w-6 h-6 rounded-full bg-neutral-700 border border-neutral-500" />
      ), 
      label: "Профиль" 
    },
    { path: "/friends", icon: <Users size={24} />, label: "Друзья" },
    { path: "/settings", icon: <Settings size={24} />, label: "Настройки" },
  ];

  // Don't show on initial setup screens
  if (['/', '/create'].includes(location.pathname)) return null;

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-neutral-900/90 backdrop-blur-lg border-t border-neutral-800 z-50 pb-safe">
      <div className="flex justify-around items-center p-2">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`relative flex flex-col items-center justify-center w-16 h-14 transition-colors ${
                isActive ? "text-red-500" : "text-neutral-400 hover:text-neutral-200"
              }`}
            >
              <motion.div
                animate={{ 
                  scale: isActive ? 1.2 : 1,
                  y: isActive ? -4 : 0
                }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              >
                {item.icon}
              </motion.div>
              <span className={`text-[10px] mt-1 transition-opacity ${isActive ? "opacity-100 font-bold" : "opacity-70"}`}>
                {item.label}
              </span>
              {isActive && (
                <motion.div
                  layoutId="bottomNavIndicator"
                  className="absolute -bottom-2 w-8 h-1 bg-red-500 rounded-t-full"
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
