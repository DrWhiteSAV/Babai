import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import { usePlayerStore } from "./store/playerStore";
import { useEffect, useRef } from "react";
import { useAudio, menuMusic, bgMusics } from "./hooks/useAudio";

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
  const { playClick } = useAudio(settings.musicVolume);
  const location = useLocation();
  const bgMusicRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (!bgMusicRef.current) {
      bgMusicRef.current = new Audio();
      bgMusicRef.current.loop = true;
    }

    const isGame = location.pathname === "/game";
    const currentSrc = bgMusicRef.current.src;
    let targetSrc = menuMusic;

    if (isGame) {
      const isPlayingGameMusic = bgMusics.some(m => currentSrc.includes(encodeURI(m)) || currentSrc === m);
      if (!isPlayingGameMusic) {
        targetSrc = bgMusics[Math.floor(Math.random() * bgMusics.length)];
      } else {
        targetSrc = currentSrc;
      }
    }

    const normalizedCurrent = currentSrc.replace(window.location.origin, "");
    const normalizedTarget = targetSrc.replace(window.location.origin, "");

    if (normalizedCurrent !== normalizedTarget || bgMusicRef.current.paused) {
      bgMusicRef.current.src = targetSrc;
      bgMusicRef.current.play().catch(() => {});
    }

    bgMusicRef.current.volume = (settings.musicVolume / 100) * 0.2;
  }, [location.pathname, settings.musicVolume]);

  useEffect(() => {
    const handleInteraction = () => {
      if (bgMusicRef.current && bgMusicRef.current.paused) {
        bgMusicRef.current.play().catch(() => {});
      }
    };
    document.addEventListener("click", handleInteraction);
    return () => document.removeEventListener("click", handleInteraction);
  }, []);

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
