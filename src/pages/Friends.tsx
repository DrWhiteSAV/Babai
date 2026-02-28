import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { usePlayerStore } from "../store/playerStore";
import { motion } from "motion/react";
import { ArrowLeft, Users, UserPlus, Zap, MessageSquare, Link, Copy, Plus, X } from "lucide-react";

export default function Friends() {
  const navigate = useNavigate();
  const { character, friends, groupChats, addFriend, toggleFriendAi, addEnergy, addFear, createGroupChat } = usePlayerStore();
  const [newFriendName, setNewFriendName] = useState("");
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");
  const [selectedFriends, setSelectedFriends] = useState<string[]>([]);

  if (!character) {
    navigate("/");
    return null;
  }

  const handleAddFriend = () => {
    if (newFriendName.trim() && newFriendName !== character.name) {
      addFriend(newFriendName.trim());
      setNewFriendName("");
    }
  };

  const handleCopyRef = () => {
    navigator.clipboard.writeText(`https://bab-ai.ru/invite/${character.name}`);
    alert("Реферальная ссылка скопирована! За каждого друга вы получите 100 энергии и 100 страха.");
    // Simulate someone joining via ref link
    setTimeout(() => {
      addEnergy(100);
      addFear(100);
      alert("По вашей ссылке зарегистрировался новый Бабай! Начислено 100 энергии и 100 страха.");
    }, 5000);
  };

  const shareEnergy = (friendName: string) => {
    const { energy, useEnergy } = usePlayerStore.getState();
    if (energy >= 10) {
      useEnergy(10);
      alert(`Вы поделились 10 энергии с ${friendName}!`);
    } else {
      alert("Недостаточно энергии для отправки.");
    }
  };

  const handleCreateGroup = () => {
    if (newGroupName.trim() && selectedFriends.length > 0) {
      createGroupChat(newGroupName.trim(), selectedFriends);
      setNewGroupName("");
      setSelectedFriends([]);
      setShowGroupModal(false);
    }
  };

  const toggleFriendSelection = (name: string) => {
    setSelectedFriends(prev => 
      prev.includes(name) ? prev.filter(f => f !== name) : [...prev, name]
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
      className="flex-1 flex flex-col bg-neutral-950 text-neutral-200 relative overflow-hidden"
    >
      <div className="absolute inset-0 bg-[url('https://picsum.photos/seed/friendsbg/1080/1920?blur=3')] bg-cover bg-center opacity-20 pointer-events-none mix-blend-overlay" />
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
          <Users size={20} /> Друзья
        </h1>
        <div className="w-10" />
      </header>

      <div className="flex-1 overflow-y-auto p-6 space-y-8 relative z-10">
        <section className="bg-neutral-900/80 backdrop-blur-md p-6 rounded-2xl border border-neutral-800">
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-white">
            <Link size={18} className="text-red-500" /> Реферальная программа
          </h2>
          <p className="text-sm text-neutral-400 mb-4">
            Приглашайте друзей по ссылке и получайте бонусы: 100 <Zap size={12} className="inline text-yellow-500" /> и 100 <span className="text-red-500">Страха</span>.
          </p>
          <button
            onClick={handleCopyRef}
            className="w-full py-3 bg-neutral-800 hover:bg-neutral-700 text-white rounded-xl font-bold transition-colors flex items-center justify-center gap-2 border border-neutral-700"
          >
            <Copy size={16} /> Скопировать ссылку
          </button>
        </section>

        <section className="bg-neutral-900/80 backdrop-blur-md p-6 rounded-2xl border border-neutral-800">
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-white">
            <UserPlus size={18} className="text-red-500" /> Добавить друга
          </h2>
          <div className="flex gap-2">
            <input
              type="text"
              value={newFriendName}
              onChange={(e) => setNewFriendName(e.target.value)}
              placeholder="Имя Бабая..."
              className="flex-1 bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-red-900 transition-colors"
            />
            <button
              onClick={handleAddFriend}
              disabled={!newFriendName.trim()}
              className="px-4 bg-red-700 hover:bg-red-600 rounded-xl disabled:opacity-50 transition-colors flex items-center justify-center"
            >
              <UserPlus size={20} className="text-white" />
            </button>
          </div>
        </section>

        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-white">Групповые чаты ({groupChats.length})</h2>
            <button 
              onClick={() => setShowGroupModal(true)}
              className="p-2 bg-red-900/30 text-red-500 hover:bg-red-900/50 rounded-xl transition-colors flex items-center gap-1 text-sm font-bold"
            >
              <Plus size={16} /> Создать
            </button>
          </div>
          {groupChats.length === 0 ? (
            <p className="text-center text-neutral-500 py-4">Нет групповых чатов.</p>
          ) : (
            <div className="space-y-3">
              {groupChats.map((chat) => (
                <div key={chat.id} className="bg-neutral-900/80 backdrop-blur-md p-4 rounded-xl border border-neutral-800 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-white block">{chat.name}</span>
                    <span className="text-xs text-neutral-500">{chat.members.length} участников</span>
                  </div>
                  <button 
                    onClick={() => navigate("/chat", { state: { groupId: chat.id } })}
                    className="p-2 bg-neutral-800 hover:bg-neutral-700 rounded-lg text-blue-400 transition-colors"
                    title="Чат"
                  >
                    <MessageSquare size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>

        <section>
          <h2 className="text-lg font-bold mb-4 text-white">Список друзей ({friends.length})</h2>
          {friends.length === 0 ? (
            <p className="text-center text-neutral-500 py-8">У вас пока нет друзей. Пригласите кого-нибудь!</p>
          ) : (
            <div className="space-y-3">
              {friends.map((friend) => (
                <div key={friend.name} className="bg-neutral-900/80 backdrop-blur-md p-4 rounded-xl border border-neutral-800 flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white">{friend.name}</span>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => shareEnergy(friend.name)}
                        className="p-2 bg-neutral-800 hover:bg-neutral-700 rounded-lg text-yellow-500 transition-colors"
                        title="Поделиться энергией"
                      >
                        <Zap size={16} />
                      </button>
                      <button 
                        onClick={() => navigate("/chat", { state: { friendName: friend.name } })}
                        className="p-2 bg-neutral-800 hover:bg-neutral-700 rounded-lg text-blue-400 transition-colors"
                        title="Чат"
                      >
                        <MessageSquare size={16} />
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-sm border-t border-neutral-800 pt-2">
                    <span className="text-neutral-400">ИИ-заместитель в чате:</span>
                    <button
                      onClick={() => toggleFriendAi(friend.name)}
                      className={`px-3 py-1 rounded-full text-xs font-bold transition-colors ${friend.isAiEnabled ? 'bg-green-900/50 text-green-400 border border-green-800' : 'bg-neutral-800 text-neutral-500 border border-neutral-700'}`}
                    >
                      {friend.isAiEnabled ? "ВКЛ" : "ВЫКЛ"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      {/* Create Group Modal */}
      {showGroupModal && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 max-w-sm w-full"
          >
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-xl font-bold text-white uppercase tracking-wider">Новая группа</h2>
              <button onClick={() => setShowGroupModal(false)} className="text-neutral-500 hover:text-white">
                <X size={24} />
              </button>
            </div>
            
            <input
              type="text"
              value={newGroupName}
              onChange={(e) => setNewGroupName(e.target.value)}
              placeholder="Название группы..."
              className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-red-900 transition-colors mb-4 text-white"
            />

            <h3 className="text-sm font-bold text-neutral-400 mb-2">Выберите участников:</h3>
            <div className="max-h-48 overflow-y-auto space-y-2 mb-4 pr-2">
              {friends.map(friend => (
                <label key={friend.name} className="flex items-center gap-3 p-2 bg-neutral-800/50 rounded-xl cursor-pointer hover:bg-neutral-800">
                  <input 
                    type="checkbox" 
                    checked={selectedFriends.includes(friend.name)}
                    onChange={() => toggleFriendSelection(friend.name)}
                    className="accent-red-600 w-4 h-4"
                  />
                  <span className="text-white">{friend.name}</span>
                </label>
              ))}
            </div>

            <button
              onClick={handleCreateGroup}
              disabled={!newGroupName.trim() || selectedFriends.length === 0}
              className="w-full py-3 bg-red-700 hover:bg-red-600 text-white rounded-xl font-bold transition-colors disabled:opacity-50"
            >
              Создать
            </button>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
}
