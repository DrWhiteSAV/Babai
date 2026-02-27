import { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { usePlayerStore } from "../store/playerStore";
import { motion } from "motion/react";
import { ArrowLeft, MessageSquare, Send } from "lucide-react";

export default function Chat() {
  const navigate = useNavigate();
  const location = useLocation();
  const { character, friends } = usePlayerStore();
  const friendName = location.state?.friendName;
  const friend = friends.find(f => f.name === friendName);

  const [messages, setMessages] = useState<{ sender: string; text: string }[]>([]);
  const [input, setInput] = useState("");
  const [isAiTyping, setIsAiTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!character || !friendName) {
      navigate("/friends");
    }
  }, [character, friendName, navigate]);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || !friend) return;

    const userMessage = input.trim();
    setMessages((prev) => [...prev, { sender: "user", text: userMessage }]);
    setInput("");

    if (friend.isAiEnabled) {
      setIsAiTyping(true);
      // Simulate AI response based on friend's style (mocked here for simplicity, could call Gemini)
      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          { sender: "friend", text: `(ИИ-заместитель) Я сейчас занят выселением жильцов! Но твое сообщение получил: "${userMessage}".` },
        ]);
        setIsAiTyping(false);
      }, 2000);
    } else {
      // Real multiplayer chat would go through a server here
      // For now, just show the message
    }
  };

  if (!friend) return null;

  return (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
      className="flex-1 flex flex-col bg-neutral-950 text-neutral-200 relative overflow-hidden"
    >
      <div className="absolute inset-0 bg-[url('https://picsum.photos/seed/chatbg/1080/1920?blur=3')] bg-cover bg-center opacity-20 pointer-events-none mix-blend-overlay" />
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
          <MessageSquare size={20} /> Чат: {friend.name}
        </h1>
        <div className="w-10" />
      </header>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 relative z-10">
        {messages.length === 0 && (
          <p className="text-center text-neutral-500 py-8">Начните общение с {friend.name}!</p>
        )}
        {messages.map((msg, i) => (
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
        <div className="flex gap-2">
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
            disabled={!input.trim() || isAiTyping}
            className="p-3 bg-red-700 hover:bg-red-600 rounded-xl disabled:opacity-50 transition-colors flex items-center justify-center"
          >
            <Send size={20} className="text-white" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
