import React from "react";
import { useNavigate } from "react-router-dom";
import { usePlayerStore, ButtonSize, FontFamily, Theme } from "../store/playerStore";
import { motion } from "motion/react";
import {
  Settings as SettingsIcon,
  ArrowLeft,
  Volume2,
  VolumeX,
  Type,
  Square,
} from "lucide-react";

export default function Settings() {
  const navigate = useNavigate();
  const { settings, updateSettings, character } = usePlayerStore();

  if (!character) {
    navigate("/");
    return null;
  }

  const handleButtonSizeChange = (size: ButtonSize) => {
    updateSettings({ buttonSize: size });
  };

  const handleFontSizeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateSettings({ fontSize: parseInt(e.target.value, 10) });
  };

  const handleFontFamilyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    updateSettings({ fontFamily: e.target.value as FontFamily });
  };

  const handleThemeChange = (theme: Theme) => {
    updateSettings({ theme });
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateSettings({ musicVolume: parseInt(e.target.value) });
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
      className="flex-1 flex flex-col bg-neutral-950 text-neutral-200 relative overflow-hidden"
    >
      <div className="absolute inset-0 bg-[url('https://picsum.photos/id/878/1920/1080')] bg-cover bg-center opacity-20 pointer-events-none mix-blend-overlay" />
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
          <SettingsIcon size={20} /> Настройки
        </h1>
        <div className="w-10" /> {/* Spacer */}
      </header>

      <div className="flex-1 overflow-y-auto p-6 space-y-8">
        {/* Button Size */}
        <section>
          <h2 className="text-lg font-bold text-white mb-4 uppercase tracking-wider border-b border-neutral-800 pb-2 flex items-center gap-2">
            <Square size={18} /> Размер кнопок
          </h2>
          <div className="grid grid-cols-3 gap-3">
            {(["small", "medium", "large"] as ButtonSize[]).map((size) => (
              <button
                key={size}
                onClick={() => handleButtonSizeChange(size)}
                className={`p-3 rounded-xl border font-medium transition-all ${settings.buttonSize === size ? "border-red-600 bg-red-900/30 text-white" : "border-neutral-800 bg-neutral-900 text-neutral-400 hover:bg-neutral-800"}`}
              >
                {size === "small"
                  ? "Мелкие"
                  : size === "medium"
                    ? "Средние"
                    : "Крупные"}
              </button>
            ))}
          </div>
        </section>

        {/* Theme Selection */}
        <section>
          <h2 className="text-lg font-bold text-white mb-4 uppercase tracking-wider border-b border-neutral-800 pb-2 flex items-center gap-2">
            <Square size={18} /> Тема оформления
          </h2>
          <div className="grid grid-cols-2 gap-3">
            {(["normal", "cyberpunk"] as Theme[]).map((theme) => (
              <button
                key={theme}
                onClick={() => handleThemeChange(theme)}
                className={`p-3 rounded-xl border font-bold transition-all uppercase tracking-wider ${settings.theme === theme ? "border-red-600 bg-red-900/30 text-white" : "border-neutral-800 bg-neutral-900 text-neutral-400 hover:bg-neutral-800"}`}
              >
                {theme === "normal" ? "Обычная" : "Киберпанк"}
              </button>
            ))}
          </div>
        </section>

        {/* Font Family */}
        <section>
          <h2 className="text-lg font-bold text-white mb-4 uppercase tracking-wider border-b border-neutral-800 pb-2 flex items-center gap-2">
            <Type size={18} /> Стиль шрифта
          </h2>
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4">
            <select
              value={settings.fontFamily}
              onChange={handleFontFamilyChange}
              className="w-full bg-neutral-800 text-white border border-neutral-700 rounded-xl p-3 outline-none focus:border-red-500 transition-colors"
            >
              <option value="Inter" className="font-sans">Обычный (Inter)</option>
              <option value="Roboto" style={{ fontFamily: "'Roboto', sans-serif" }}>Робото (Roboto)</option>
              <option value="Montserrat" style={{ fontFamily: "'Montserrat', sans-serif" }}>Монтсеррат (Montserrat)</option>
              <option value="Playfair Display" style={{ fontFamily: "'Playfair Display', serif" }}>Классический (Playfair)</option>
              <option value="JetBrains Mono" style={{ fontFamily: "'JetBrains Mono', monospace" }}>Технический (JetBrains)</option>
              <option value="Press Start 2P" style={{ fontFamily: "'Press Start 2P', cursive" }}>Ретро (8-bit)</option>
              <option value="Russo One" style={{ fontFamily: "'Russo One', sans-serif" }}>Мощный (Russo One)</option>
              <option value="Rubik Beastly" style={{ fontFamily: "'Rubik Beastly', cursive" }}>Монстр (Rubik Beastly)</option>
              <option value="Rubik Burned" style={{ fontFamily: "'Rubik Burned', cursive" }}>Сгоревший (Rubik Burned)</option>
              <option value="Rubik Glitch" style={{ fontFamily: "'Rubik Glitch', cursive" }}>Глитч (Rubik Glitch)</option>
              <option value="Neucha" style={{ fontFamily: "'Neucha', cursive" }}>Рукописный (Neucha)</option>
              <option value="Ruslan Display" style={{ fontFamily: "'Ruslan Display', cursive" }}>Славянский (Ruslan)</option>
            </select>
          </div>
        </section>

        {/* Font Size */}
        <section>
          <h2 className="text-lg font-bold text-white mb-4 uppercase tracking-wider border-b border-neutral-800 pb-2 flex items-center gap-2">
            <Type size={18} /> Размер шрифта: {settings.fontSize}px
          </h2>
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6">
            <input
              type="range"
              min="5"
              max="24"
              value={settings.fontSize}
              onChange={handleFontSizeChange}
              className="w-full accent-red-600 h-2 bg-neutral-800 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-xs text-neutral-500 mt-4 font-mono">
              <span>5px</span>
              <span>24px</span>
            </div>
          </div>
        </section>

        {/* TTS Toggle */}
        <section>
          <h2 className="text-lg font-bold text-white mb-4 uppercase tracking-wider border-b border-neutral-800 pb-2 flex items-center gap-2">
            {settings.ttsEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />} Озвучка текста
          </h2>
          <button
            onClick={() => updateSettings({ ttsEnabled: !settings.ttsEnabled })}
            className={`w-full p-4 rounded-xl border font-bold transition-all flex items-center justify-center gap-2 ${settings.ttsEnabled ? "border-green-600 bg-green-900/30 text-green-400" : "border-neutral-800 bg-neutral-900 text-neutral-500"}`}
          >
            {settings.ttsEnabled ? "ВКЛЮЧЕНА" : "ВЫКЛЮЧЕНА"}
          </button>
        </section>

        {/* Music Volume */}
        <section>
          <h2 className="text-lg font-bold text-white mb-4 uppercase tracking-wider border-b border-neutral-800 pb-2 flex items-center gap-2">
            <Volume2 size={18} /> Громкость музыки
          </h2>
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6">
            <input
              type="range"
              min="0"
              max="100"
              value={settings.musicVolume}
              onChange={handleVolumeChange}
              className="w-full h-2 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-red-600"
            />
            <div className="flex justify-between text-xs text-neutral-500 mt-4">
              <span>0%</span>
              <span className="text-white font-bold">
                {settings.musicVolume}%
              </span>
              <span>100%</span>
            </div>
          </div>
        </section>

        {/* Reset Data */}
        <section className="pt-8 space-y-4">
          <button
            onClick={() => {
              if (window.confirm("Очистить галерею? Это освободит место в памяти устройства.")) {
                usePlayerStore.setState({ gallery: [] });
                alert("Галерея очищена.");
              }
            }}
            className="w-full py-3 bg-neutral-900 hover:bg-neutral-800 text-neutral-400 border border-neutral-800 rounded-xl font-bold transition-colors text-sm"
          >
            ОЧИСТИТЬ ГАЛЕРЕЮ
          </button>

          <button
            onClick={() => {
              if (
                window.confirm(
                  "Вы уверены, что хотите удалить персонажа и начать заново?",
                )
              ) {
                localStorage.removeItem("babai-storage");
                window.location.href = "/";
              }
            }}
            className="w-full py-4 bg-neutral-900 hover:bg-red-900/20 text-red-500 border border-red-900/30 rounded-xl font-bold transition-colors"
          >
            СБРОСИТЬ ПРОГРЕСС
          </button>
        </section>

        <div className="flex justify-center pt-8 pb-4 opacity-50">
          <img 
            src="https://i.ibb.co/BVgY7XrT/babai.png" 
            alt="Bab-AI" 
            className="w-24 grayscale"
          />
        </div>
      </div>
    </motion.div>
  );
}
