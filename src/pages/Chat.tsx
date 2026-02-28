import { useState, useRef, useEffect, ChangeEvent } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { usePlayerStore } from "../store/playerStore";
import { motion } from "motion/react";
import { ArrowLeft, MessageSquare, Send, ImagePlus, X } from "lucide-react";
import { generateDanilChat } from "../services/ai";

interface Message {
  sender: string;
  text: string;
  imageUrl?: string;
}

export default function Chat() {
  const navigate = useNavigate();
  const location = useLocation();
  const { character, friends, groupChats } = usePlayerStore();
  const friendName = location.state?.friendName;
  const groupId = location.state?.groupId;
  const friend = friends.find(f => f.name === friendName);
  const group = groupChats.find(g => g.id === groupId);

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isAiTyping, setIsAiTyping] = useState(false);
  const [showProfilePopup, setShowProfilePopup] = useState<string | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!character || (!friendName && !groupId)) {
      navigate("/friends");
    }
  }, [character, friendName, groupId, navigate]);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const handleImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSend = async () => {
    if ((!input.trim() && !selectedImage) || (!friend && !group)) return;

    const userMessage = input.trim();
    const imageToSend = selectedImage;
    
    setMessages((prev) => [...prev, { sender: "user", text: userMessage, imageUrl: imageToSend || undefined }]);
    setInput("");
    setSelectedImage(null);

    if (friend?.isAiEnabled) {
      setIsAiTyping(true);
      
      try {
        const responseText = await generateDanilChat(userMessage, character?.style || "Обычная", imageToSend || undefined);
        setMessages((prev) => [
          ...prev,
          { sender: friend.name, text: responseText },
        ]);
      } catch (e) {
        setMessages((prev) => [
          ...prev,
          { sender: friend.name, text: "Связь прервалась. Попробуй позже." },
        ]);
      } finally {
        setIsAiTyping(false);
      }
    } else if (group) {
      // Group chat logic - simulate random friend responding if any are AI
      const aiMembers = group.members.filter(m => friends.find(f => f.name === m)?.isAiEnabled);
      if (aiMembers.length > 0) {
        setIsAiTyping(true);
        const randomAi = aiMembers[Math.floor(Math.random() * aiMembers.length)];
        setTimeout(() => {
           setMessages((prev) => [
            ...prev,
            { sender: randomAi, text: `(ИИ) Я согласен с тобой, ${character?.name}!` },
          ]);
          setIsAiTyping(false);
        }, 1500);
      }
    }
  };

  const getAvatarUrl = (sender: string) => {
    if (sender === "user") return character?.avatarUrl || "https://picsum.photos/seed/user/100/100";
    if (sender === "ДанИИл") return "https://picsum.photos/seed/danil/100/100";
    return `https://picsum.photos/seed/${sender}/100/100`;
  };

  if (!friend && !group) return null;

  const chatTitle = friend ? friend.name : group?.name;

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
          onClick={() => navigate("/friends")}
          className="p-2 hover:bg-neutral-800 rounded-full transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-xl font-bold uppercase tracking-widest flex items-center gap-2">
          <MessageSquare size={20} /> Чат: {chatTitle}
        </h1>
        <div className="w-10" />
      </header>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 relative z-10">
        {messages.length === 0 && (
          <p className="text-center text-neutral-500 py-8">Начните общение в чате {chatTitle}!</p>
        )}
        {messages.map((msg, i) => {
          const isUser = msg.sender === "user";
          return (
            <div
              key={i}
              className={`flex flex-col ${isUser ? "items-end" : "items-start"}`}
            >
              <div 
                className="flex items-center gap-2 mb-1 cursor-pointer"
                onClick={() => setShowProfilePopup(isUser ? "user" : msg.sender)}
              >
                {!isUser && (
                  <img src={getAvatarUrl(msg.sender)} alt="avatar" className="w-6 h-6 rounded-full object-cover border border-neutral-700" />
                )}
                <span className="text-xs text-neutral-500">{isUser ? character?.name : msg.sender}</span>
                {isUser && (
                  <img src={getAvatarUrl(msg.sender)} alt="avatar" className="w-6 h-6 rounded-full object-cover border border-neutral-700" />
                )}
              </div>
              <div
                className={`max-w-[80%] p-3 rounded-2xl ${isUser ? "bg-red-900 text-white rounded-tr-sm" : "bg-neutral-800 text-neutral-200 rounded-tl-sm"}`}
              >
                {msg.imageUrl && (
                  <img src={msg.imageUrl} alt="attachment" className="w-full max-w-[200px] rounded-lg mb-2 object-contain" />
                )}
                {msg.text && <p className="text-sm">{msg.text}</p>}
              </div>
            </div>
          );
        })}
        {isAiTyping && (
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

      <div className="p-4 bg-neutral-900 border-t border-neutral-800 relative z-20">
        {selectedImage && (
          <div className="mb-2 relative inline-block">
            <img src={selectedImage} alt="preview" className="h-20 rounded-lg border border-neutral-700" />
            <button 
              onClick={() => setSelectedImage(null)}
              className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full p-1 hover:bg-red-500"
            >
              <X size={14} />
            </button>
          </div>
        )}
        <div className="flex gap-2 items-end">
          <input 
            type="file" 
            accept="image/*" 
            className="hidden" 
            ref={fileInputRef}
            onChange={handleImageUpload}
          />
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="p-3 bg-neutral-800 hover:bg-neutral-700 rounded-xl transition-colors flex items-center justify-center"
          >
            <ImagePlus size={20} className="text-neutral-400" />
          </button>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Сообщение..."
            className="flex-1 bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-red-900 transition-colors"
          />
          <button
            onClick={handleSend}
            disabled={(!input.trim() && !selectedImage) || isAiTyping}
            className="p-3 bg-red-700 hover:bg-red-600 rounded-xl disabled:opacity-50 transition-colors flex items-center justify-center"
          >
            <Send size={20} className="text-white" />
          </button>
        </div>
      </div>

      {/* Profile Popup */}
      {showProfilePopup && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4" onClick={() => setShowProfilePopup(null)}>
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 max-w-sm w-full"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-xl font-bold text-white uppercase tracking-wider">Профиль</h2>
              <button onClick={() => setShowProfilePopup(null)} className="text-neutral-500 hover:text-white">
                <X size={24} />
              </button>
            </div>
            
            {showProfilePopup === "user" ? (
              <div className="space-y-4">
                <img src={character?.avatarUrl} alt="avatar" className="w-full aspect-square object-cover rounded-xl border-2 border-red-900/50" />
                <div>
                  <h3 className="text-2xl font-black text-red-500 uppercase">{character?.name}</h3>
                  <p className="text-neutral-400">{character?.gender} • {character?.style}</p>
                </div>
                <div className="bg-neutral-950 p-3 rounded-xl border border-neutral-800">
                  <p className="text-sm text-neutral-300 line-clamp-4">{character?.lore || "История умалчивает..."}</p>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-neutral-400">Уровень телекинеза:</span>
                  <span className="text-red-400 font-bold">{character?.telekinesisLevel}</span>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <img src={getAvatarUrl(showProfilePopup)} alt="avatar" className="w-full aspect-square object-cover rounded-xl border-2 border-neutral-700" />
                <div>
                  <h3 className="text-2xl font-black text-white uppercase">{showProfilePopup}</h3>
                  <p className="text-neutral-400">{friends.find(f => f.name === showProfilePopup)?.isAiEnabled ? "ИИ-Заместитель" : "Живой игрок"}</p>
                </div>
                <div className="bg-neutral-950 p-3 rounded-xl border border-neutral-800">
                  <p className="text-sm text-neutral-300">
                    {showProfilePopup === "ДанИИл" 
                      ? "Главный ИИ-начальник. Строг, но справедлив. Требует регулярных отчетов о выселении." 
                      : "Один из бабаев, работающих в соседнем районе."}
                  </p>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </motion.div>
  );
}
