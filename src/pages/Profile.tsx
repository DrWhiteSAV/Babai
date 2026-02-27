import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { usePlayerStore, DEFAULT_IMAGES } from "../store/playerStore";
import { motion } from "motion/react";
import { User, ArrowLeft, Copy, Share2, Trophy, Camera, BookOpen, Loader2, Image as ImageIcon, Volume2, VolumeX } from "lucide-react";
import * as htmlToImage from 'html-to-image';
import { generateLore } from "../services/geminiService";

export default function Profile() {
  const navigate = useNavigate();
  const { character, fear, energy, watermelons, inventory, updateCharacter, gallery, addToGallery, settings, updateSettings } = usePlayerStore();
  const profileRef = useRef<HTMLDivElement>(null);
  const [isGeneratingLore, setIsGeneratingLore] = useState(false);

  useEffect(() => {
    if (character && !character.lore && !isGeneratingLore) {
      generateCharacterLore();
    }
  }, [character]);

  // Ensure avatar is in gallery
  useEffect(() => {
    if (character?.avatarUrl && !gallery.includes(character.avatarUrl)) {
      addToGallery(character.avatarUrl);
    }
  }, [character?.avatarUrl]);

  if (!character) {
    navigate("/");
    return null;
  }

  const generateCharacterLore = async () => {
    setIsGeneratingLore(true);
    const lore = await generateLore(character.name, character.gender, character.style);
    updateCharacter({ lore });
    setIsGeneratingLore(false);
  };

  const handleCopyRef = () => {
    navigator.clipboard.writeText(`https://bab-ai.ru/invite/${character.name.replace(/\s+/g, "").toLowerCase()}`);
    alert("Ссылка скопирована!");
  };

  const takeScreenshot = async () => {
    if (profileRef.current) {
      try {
        const dataUrl = await htmlToImage.toPng(profileRef.current, {
          backgroundColor: '#0a0a0a',
          pixelRatio: 2,
        });
        const link = document.createElement('a');
        link.href = dataUrl;
        link.download = `babai_${character.name}.png`;
        link.click();
      } catch (e) {
        console.error("Screenshot failed", e);
        alert("Не удалось сделать скриншот");
      }
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
      className="flex-1 flex flex-col bg-neutral-950 text-neutral-200 relative overflow-hidden"
    >
      <div className="absolute inset-0 bg-[url('https://picsum.photos/seed/profilebg/1080/1920?blur=3')] bg-cover bg-center opacity-20 pointer-events-none mix-blend-overlay" />
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
        <div className="flex gap-2">
          <button
            onClick={() => updateSettings({ ttsEnabled: !settings.ttsEnabled })}
            className={`p-2 rounded-full transition-colors ${settings.ttsEnabled ? 'text-green-500 hover:bg-neutral-800' : 'text-neutral-500 hover:bg-neutral-800'}`}
            title={settings.ttsEnabled ? "Озвучка включена" : "Озвучка выключена"}
          >
            {settings.ttsEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
          </button>
          <button
            onClick={() => navigate("/gallery")}
            className="p-2 hover:bg-neutral-800 rounded-full transition-colors text-neutral-400"
            title="Галерея"
          >
            <ImageIcon size={20} />
          </button>
          <button
            onClick={takeScreenshot}
            className="p-2 hover:bg-neutral-800 rounded-full transition-colors text-red-500"
            title="Сделать скриншот"
          >
            <Camera size={20} />
          </button>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-6 space-y-8" ref={profileRef}>
        {/* Avatar & Info */}
        <section className="flex flex-col items-center text-center">
          <div className="w-32 h-32 rounded-full border-4 border-red-900/50 overflow-hidden shadow-[0_0_30px_rgba(220,38,38,0.2)] bg-neutral-900 mb-4 relative">
            <img
              src={character.avatarUrl}
              alt={character.name}
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
              crossOrigin="anonymous"
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
        <section className="grid grid-cols-3 gap-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4 flex flex-col items-center justify-center">
            <span className="text-3xl font-black text-white">{fear}</span>
            <span className="text-[10px] text-neutral-500 uppercase tracking-widest mt-1">
              Страх
            </span>
          </div>
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4 flex flex-col items-center justify-center">
            <span className="text-3xl font-black text-white">{energy}</span>
            <span className="text-[10px] text-neutral-500 uppercase tracking-widest mt-1">
              Энергия
            </span>
          </div>
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4 flex flex-col items-center justify-center">
            <span className="text-3xl font-black text-white">{watermelons}</span>
            <span className="text-[10px] text-neutral-500 uppercase tracking-widest mt-1">
              Арбузы
            </span>
          </div>
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4 flex flex-col items-center justify-center col-span-3">
            <span className="text-3xl font-black text-white">
              {character.telekinesisLevel}
            </span>
            <span className="text-xs text-neutral-500 uppercase tracking-widest mt-1">
              Уровень Телекинеза
            </span>
          </div>
        </section>

        {/* Gallery Preview */}
        <section className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5">
          <h3 className="text-lg font-bold text-white mb-4 uppercase tracking-wider border-b border-neutral-800 pb-2 flex items-center justify-between">
            <span className="flex items-center gap-2"><ImageIcon size={18} /> Галерея</span>
            <button 
              onClick={() => navigate("/gallery")}
              className="text-xs text-red-500 font-bold hover:underline"
            >
              СМОТРЕТЬ ВСЕ
            </button>
          </h3>
          <div className="grid grid-cols-4 gap-2">
            {gallery.slice(0, 4).map((img, i) => (
              <div 
                key={i} 
                className="aspect-square rounded-lg overflow-hidden border border-neutral-800 cursor-pointer"
                onClick={() => navigate("/gallery")}
              >
                <img src={img} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" crossOrigin="anonymous" />
              </div>
            ))}
            {gallery.length < 4 && Array.from({ length: 4 - gallery.length }).map((_, i) => (
              <div key={i} className="aspect-square rounded-lg bg-neutral-950 border border-neutral-800 border-dashed flex items-center justify-center text-neutral-800">
                <ImageIcon size={16} />
              </div>
            ))}
          </div>
        </section>

        {/* Lore */}
        <section className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5">
          <h3 className="text-lg font-bold text-white mb-4 uppercase tracking-wider border-b border-neutral-800 pb-2 flex items-center justify-between">
            <span className="flex items-center gap-2"><BookOpen size={18} /> История духа</span>
            {isGeneratingLore && <Loader2 size={16} className="animate-spin text-red-500" />}
          </h3>
          <div className="text-sm text-neutral-400 leading-relaxed font-serif italic space-y-3">
            {character.lore ? (
              character.lore.split('\n').map((paragraph, i) => (
                paragraph.trim() && <p key={i}>{paragraph}</p>
              ))
            ) : isGeneratingLore ? (
              <p className="animate-pulse">Дух вспоминает свое прошлое...</p>
            ) : (
              <p>История утеряна во мраке веков.</p>
            )}
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
