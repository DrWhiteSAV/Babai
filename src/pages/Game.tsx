import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { usePlayerStore } from "../store/playerStore";
import {
  generateScenario,
  generateDanilChat,
  generateBackgroundImage,
  generateSpookyVoice,
} from "../services/ai";
import { playScreamer, playSuccess, playClick } from "../services/sfx";
import { motion, AnimatePresence } from "motion/react";
import {
  Loader2,
  ArrowRight,
  Skull,
  Zap,
  MessageSquare,
  X,
} from "lucide-react";

type Difficulty = "Сложная" | "Невозможная" | "Бесконечная";

interface Scenario {
  text: string;
  options: string[];
  correctAnswer: number;
}

export default function Game() {
  const navigate = useNavigate();
  const { character, fear, energy, useEnergy, addFear, settings, gallery, addToGallery } =
    usePlayerStore();

  const [difficulty, setDifficulty] = useState<Difficulty | null>(null);
  const [stage, setStage] = useState(1);
  const [maxStages, setMaxStages] = useState(15);
  const [scenario, setScenario] = useState<Scenario | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [bgImage, setBgImage] = useState<string>("");
  const [score, setScore] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);
  const [showScreamer, setShowScreamer] = useState(false);
  const [showSuccessAvatar, setShowSuccessAvatar] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Danil Chat State
  const [isDanilChat, setIsDanilChat] = useState(false);
  const [chatMessages, setChatMessages] = useState<
    { sender: "user" | "danil"; text: string }[]
  >([]);
  const [chatInput, setChatInput] = useState("");
  const [isDanilTyping, setIsDanilTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!character) navigate("/");
    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, [character, navigate]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = settings.musicVolume / 100;
    }
  }, [settings.musicVolume]);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [chatMessages]);

  const startGame = async (diff: Difficulty) => {
    const cost = diff === "Сложная" ? 1 : diff === "Невозможная" ? 5 : 25;
    if (!useEnergy(cost)) {
      alert("Недостаточно энергии!");
      return;
    }

    setDifficulty(diff);
    setMaxStages(
      diff === "Сложная" ? 15 : diff === "Невозможная" ? 45 : Infinity,
    );
    setStage(1);
    setScore(0);
    setIsGameOver(false);
    await loadNextStage(1);
  };

  const loadNextStage = async (currentStage: number) => {
    setIsLoading(true);

    // Generate background image on stage 1 or every 5th stage
    if (currentStage === 1 || currentStage % 5 === 0) {
      if (character) {
        // Always try to generate new if possible, but use gallery as fallback
        generateBackgroundImage(currentStage, character.style).then((newBg) => {
          if (newBg) {
            setBgImage(newBg);
            addToGallery(newBg);
          } else if (gallery.length > 0) {
            const randomBg = gallery[Math.floor(Math.random() * gallery.length)];
            setBgImage(randomBg);
          }
        });
      }
    }

    // Check if it's Danil time (every 5th stage)
    if (currentStage > 1 && currentStage % 5 === 0) {
      setIsDanilChat(true);
      setChatMessages([
        {
          sender: "danil",
          text: `Ну что, ${character?.name}, как успехи на ${currentStage} этаже?`,
        },
      ]);
      setIsLoading(false);
      return;
    }

    if (character) {
      const newScenario = await generateScenario(
        currentStage,
        difficulty || "Сложная",
        character.style,
      );
      setScenario(newScenario);

      // Generate spooky voice for the scenario
      generateSpookyVoice(newScenario.text).then((audioData) => {
        // Check if we are still on this stage and not loading
        if (audioData && audioRef.current && !isLoading) {
          audioRef.current.src = audioData;
          audioRef.current
            .play()
            .catch((e) => console.log("Audio play blocked", e));
        } else if (!audioData && !isLoading) {
          // Fallback to browser TTS if API fails
          if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel(); // Stop any previous speech
            const utterance = new SpeechSynthesisUtterance(newScenario.text);
            utterance.lang = 'ru-RU';
            utterance.pitch = 0.5;
            utterance.rate = 0.9;
            window.speechSynthesis.speak(utterance);
          }
        }
      });
    }
    setIsLoading(false);
  };

  const handleOptionSelect = async (index: number) => {
    if (!scenario) return;

    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = "";
    }

    if (index === scenario.correctAnswer) {
      addFear(1);
      setScore((s) => s + 1);
      playSuccess(settings.musicVolume);
      setShowSuccessAvatar(true);
      await new Promise((r) => setTimeout(r, 1000));
      setShowSuccessAvatar(false);
    } else {
      setShowScreamer(true);
      playScreamer(settings.musicVolume);
      await new Promise((r) => setTimeout(r, 800));
      setShowScreamer(false);
    }

    const nextStage = stage + 1;
    if (nextStage > maxStages) {
      setIsGameOver(true);
    } else {
      setStage(nextStage);
      loadNextStage(nextStage);
    }
  };

  const handleSendChat = async () => {
    if (!chatInput.trim() || !character) return;

    const userMsg = chatInput;
    setChatMessages((prev) => [...prev, { sender: "user", text: userMsg }]);
    setChatInput("");
    setIsDanilTyping(true);

    const danilReply = await generateDanilChat(userMsg, character.style);
    setChatMessages((prev) => [...prev, { sender: "danil", text: danilReply }]);
    setIsDanilTyping(false);

    // After Danil replies, give a button to continue
  };

  const continueAfterChat = () => {
    setIsDanilChat(false);
    const nextStage = stage + 1;
    setStage(nextStage);
    loadNextStage(nextStage);
  };

  if (isGameOver) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 bg-neutral-950 text-white text-center">
        <img 
          src="https://i.ibb.co/BVgY7XrT/babai.png" 
          alt="Bab-AI" 
          className="w-48 mb-6 drop-shadow-[0_0_20px_rgba(220,38,38,0.5)]"
        />
        <h2 className="text-4xl font-black text-red-600 mb-4 uppercase tracking-tighter" style={{ fontFamily: "'Playfair Display', serif" }}>
          ИГРА ОКОНЧЕНА
        </h2>
        <p className="text-xl mb-2">Вы прошли {maxStages} этапов.</p>
        <p className="text-lg text-neutral-400 mb-8">
          Успешно выгнано жильцов: <span className="text-red-500 font-bold">{score}</span>
        </p>
        <button
          onClick={() => {
            playClick(settings.musicVolume);
            navigate("/hub");
          }}
          className="px-8 py-4 bg-red-700 hover:bg-red-600 rounded-xl font-bold text-lg transition-colors"
        >
          ВЕРНУТЬСЯ В ХАБ
        </button>
      </div>
    );
  }

  if (!difficulty) {
    return (
      <div className="flex-1 flex flex-col p-6 bg-neutral-950 text-white">
        <header className="flex justify-between items-center mb-8">
          <button
            onClick={() => navigate("/hub")}
            className="p-2 bg-neutral-900 rounded-full"
          >
            <X size={20} />
          </button>
          <div className="flex gap-4 font-mono font-bold">
            <span className="text-yellow-500 flex items-center gap-1">
              <Zap size={16} /> {energy}
            </span>
            <span className="text-red-500 flex items-center gap-1">
              <Skull size={16} /> {fear}
            </span>
          </div>
        </header>

        <h2
          className="text-3xl font-black text-red-600 uppercase tracking-tighter mb-6"
          style={{ fontFamily: "'Playfair Display', serif" }}
        >
          Выбор сложности
        </h2>

        <div className="space-y-4">
          <button
            onClick={() => startGame("Сложная")}
            className="w-full p-6 bg-neutral-900 border border-neutral-800 rounded-2xl text-left hover:border-red-900 transition-colors group lightning-btn"
          >
            <h3 className="text-xl font-bold text-white group-hover:text-red-500 transition-colors">
              Сложная
            </h3>
            <p className="text-neutral-400 text-sm mt-1">
              15 этапов. Стоимость: 1{" "}
              <Zap size={12} className="inline text-yellow-500" />
            </p>
          </button>
          <button
            onClick={() => startGame("Невозможная")}
            className="w-full p-6 bg-neutral-900 border border-neutral-800 rounded-2xl text-left hover:border-red-900 transition-colors group lightning-btn"
          >
            <h3 className="text-xl font-bold text-white group-hover:text-red-500 transition-colors">
              Невозможная
            </h3>
            <p className="text-neutral-400 text-sm mt-1">
              45 этапов. Стоимость: 5{" "}
              <Zap size={12} className="inline text-yellow-500" />
            </p>
          </button>
          <button
            onClick={() => startGame("Бесконечная")}
            className="w-full p-6 bg-neutral-900 border border-neutral-800 rounded-2xl text-left hover:border-red-900 transition-colors group lightning-btn"
          >
            <h3 className="text-xl font-bold text-white group-hover:text-red-500 transition-colors">
              Бесконечная
            </h3>
            <p className="text-neutral-400 text-sm mt-1">
              Без конца. Стоимость: 25{" "}
              <Zap size={12} className="inline text-yellow-500" />
            </p>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-neutral-950 text-white relative">
      <AnimatePresence>
        {showScreamer && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 flex items-center justify-center bg-red-900"
          >
            <Skull size={250} className="text-black animate-ping" />
          </motion.div>
        )}
        {showSuccessAvatar && character && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 1.2 }}
            className="absolute inset-0 z-50 flex items-center justify-center pointer-events-none"
          >
            <img 
              src={character.avatarUrl} 
              alt="Success" 
              className="w-64 h-64 rounded-full object-cover border-4 border-green-500 shadow-[0_0_30px_rgba(34,197,94,0.8)]" 
            />
          </motion.div>
        )}
      </AnimatePresence>

      <audio ref={audioRef} className="hidden" />
      {/* Background Image */}
      {bgImage && (
        <div
          className="absolute inset-0 bg-cover bg-center opacity-50 pointer-events-none transition-opacity duration-1000"
          style={{ backgroundImage: `url(${bgImage})` }}
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/60 to-transparent pointer-events-none" />

      <div className="fog-container">
        <div className="fog-layer"></div>
        <div className="fog-layer-2"></div>
      </div>

      {/* Header */}
      <header className="relative z-10 flex justify-between items-center p-4 bg-neutral-950/50 backdrop-blur-sm border-b border-neutral-800">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/hub")}
            className="p-2 bg-neutral-900/80 rounded-full hover:bg-neutral-800 transition-colors"
          >
            <X size={18} />
          </button>
          <div>
            <div className="text-xs text-neutral-400 uppercase tracking-widest font-bold">
              Этап {stage}
            </div>
            <div className="text-sm font-bold text-red-500">{difficulty}</div>
          </div>
        </div>
        <div className="flex gap-3 font-mono font-bold text-sm">
          <span className="text-red-500 flex items-center gap-1">
            <Skull size={14} /> {fear}
          </span>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="relative z-10 flex-1 flex flex-col p-6 overflow-y-auto">
        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex-1 flex flex-col items-center justify-center text-neutral-500"
            >
              <motion.img 
                animate={{ scale: [1, 1.05, 1], opacity: [0.8, 1, 0.8] }}
                transition={{ repeat: Infinity, duration: 2 }}
                src="https://i.ibb.co/BVgY7XrT/babai.png"
                alt="Loading"
                className="w-48 mb-6 drop-shadow-[0_0_15px_rgba(220,38,38,0.5)]"
              />
              <p className="font-mono text-sm uppercase tracking-widest text-red-500 animate-pulse font-bold">
                Генерация кошмара...
              </p>
            </motion.div>
          ) : isDanilChat ? (
            <motion.div
              key="chat"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex-1 flex flex-col"
            >
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-neutral-800">
                <div className="w-10 h-10 rounded-full bg-red-900 flex items-center justify-center font-bold text-xl">
                  Д
                </div>
                <div>
                  <h3 className="font-bold text-lg">ДанИИл</h3>
                  <p className="text-xs text-green-500 font-mono">В сети</p>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto space-y-4 pb-4">
                {chatMessages.map((msg, i) => (
                  <div
                    key={i}
                    className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[80%] p-3 rounded-2xl ${msg.sender === "user" ? "bg-red-900 text-white rounded-tr-sm" : "bg-neutral-800 text-neutral-200 rounded-tl-sm"}`}
                    >
                      <p className="text-sm">{msg.text}</p>
                    </div>
                  </div>
                ))}
                {isDanilTyping && (
                  <div className="flex justify-start">
                    <div className="max-w-[80%] p-3 rounded-2xl bg-neutral-800 text-neutral-400 rounded-tl-sm flex gap-1">
                      <span className="animate-bounce">.</span>
                      <span className="animate-bounce delay-100">.</span>
                      <span className="animate-bounce delay-200">.</span>
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>

              {chatMessages.length > 0 &&
              chatMessages[chatMessages.length - 1].sender === "danil" &&
              chatMessages.length > 1 ? (
                <button
                  onClick={continueAfterChat}
                  className="w-full py-4 bg-red-700 hover:bg-red-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 mt-4"
                >
                  Продолжить путь <ArrowRight size={18} />
                </button>
              ) : (
                <div className="flex gap-2 mt-4">
                  <input
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSendChat()}
                    placeholder="Написать ДанИИлу..."
                    className="flex-1 bg-neutral-900 border border-neutral-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-red-900 transition-colors"
                  />
                  <button
                    onClick={handleSendChat}
                    disabled={!chatInput.trim() || isDanilTyping}
                    className="p-3 bg-red-700 hover:bg-red-600 rounded-xl disabled:opacity-50 transition-colors flex items-center justify-center"
                  >
                    <MessageSquare size={20} />
                  </button>
                </div>
              )}
            </motion.div>
          ) : scenario ? (
            <motion.div
              key="scenario"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex-1 flex flex-col"
            >
              <div className="flex-1 flex items-center justify-center py-8">
                <p
                  className="text-lg md:text-xl leading-relaxed font-medium text-center"
                  style={{ fontFamily: "'Playfair Display', serif" }}
                >
                  {scenario.text}
                </p>
              </div>

              <div className="space-y-3 mt-auto">
                {scenario.options.map((opt, i) => (
                  <button
                    key={i}
                    onClick={() => handleOptionSelect(i)}
                    className="w-full p-4 bg-neutral-900/80 backdrop-blur-md border border-neutral-800 hover:border-red-900 rounded-2xl text-left transition-all active:scale-95 text-sm md:text-base font-medium lightning-btn"
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
    </div>
  );
}
