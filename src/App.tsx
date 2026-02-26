import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { usePlayerStore } from "./store/playerStore";
import { useEffect } from "react";
import { useAudio } from "./hooks/useAudio";

// Pages
import Home from "./pages/Home";
import CharacterCreate from "./pages/CharacterCreate";
import GameHub from "./pages/GameHub";
import Game from "./pages/Game";
import Shop from "./pages/Shop";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";
import Friends from "./pages/Friends";
import Chat from "./pages/Chat";
import Gallery from "./pages/Gallery";

function AppContent() {
  const { updateEnergy, settings } = usePlayerStore();
  const { playClick, playTransition } = useAudio(settings.musicVolume);

  useEffect(() => {
    // Update energy every minute
    const interval = setInterval(() => {
      updateEnergy();
    }, 60000);
    return () => clearInterval(interval);
  }, [updateEnergy]);

  useEffect(() => {
    const handleClick = () => playClick();
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, [playClick]);

  const fontSizeClass = 
    settings.fontSize === "small" ? "text-sm" :
    settings.fontSize === "large" ? "text-lg" : "text-base";

  const buttonSizeClass = 
    settings.buttonSize === "small" ? "btn-small" :
    settings.buttonSize === "large" ? "btn-large" : "btn-medium";

  return (
    <div className={`min-h-screen bg-neutral-950 text-neutral-100 font-sans selection:bg-red-900 selection:text-white ${fontSizeClass} ${buttonSizeClass}`}>
      <div className="max-w-md mx-auto min-h-screen bg-neutral-900 shadow-2xl relative overflow-hidden flex flex-col">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/create" element={<CharacterCreate />} />
          <Route path="/hub" element={<GameHub />} />
          <Route path="/game" element={<Game />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/gallery" element={<Gallery />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/friends" element={<Friends />} />
          <Route path="/chat" element={<Chat />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}
