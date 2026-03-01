import { useNavigate, useLocation } from "react-router-dom";
import { usePlayerStore } from "../store/playerStore";
import { motion } from "motion/react";
import { ArrowLeft, Trophy, Medal, Star, Target, CheckCircle2 } from "lucide-react";

export default function Leaderboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const { character, quests, achievements, globalBackgroundUrl, pageBackgrounds } = usePlayerStore();
  const activeBgUrl = pageBackgrounds?.[location.pathname]?.url || globalBackgroundUrl;
  const activeDimming = pageBackgrounds?.[location.pathname]?.dimming ?? 80;

  // Mock leaderboard data
  const leaderboard = [
    { rank: 1, name: "Бабайка_99", score: 15000, avatar: "https://picsum.photos/seed/b1/100/100" },
    { rank: 2, name: "ТёмныйЛорд", score: 12400, avatar: "https://picsum.photos/seed/b2/100/100" },
    { rank: 3, name: "НочнойУжас", score: 10200, avatar: "https://picsum.photos/seed/b3/100/100" },
    { rank: 4, name: character?.name || "Вы", score: 8500, avatar: character?.avatarUrl || "https://picsum.photos/seed/user/100/100", isUser: true },
    { rank: 5, name: "Скример", score: 7100, avatar: "https://picsum.photos/seed/b4/100/100" },
  ];

  const dailyQuests = quests.filter(q => q.type === 'daily');
  const globalQuests = quests.filter(q => q.type === 'global');

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 1.05 }}
      className="flex-1 flex flex-col bg-neutral-950/80 text-neutral-200 relative overflow-hidden"
    >
      {activeBgUrl && (
        <div 
          className="absolute inset-0 bg-cover bg-center pointer-events-none mix-blend-overlay" 
          style={{ backgroundImage: `url(${activeBgUrl})`, opacity: 1 - (activeDimming / 100) }}
        />
      )}
      
      <header className="flex items-center justify-between p-4 bg-neutral-900 border-b border-neutral-800 sticky top-0 z-20">
        <button
          onClick={() => navigate("/hub")}
          className="p-2 hover:bg-neutral-800 rounded-full transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-xl font-bold uppercase tracking-widest flex items-center gap-2">
          <Trophy size={20} className="text-yellow-500" /> Рейтинг
        </h1>
        <div className="w-10" />
      </header>

      <div className="flex-1 overflow-y-auto p-4 space-y-8 relative z-10">
        
        {/* Leaderboard Section */}
        <section>
          <h2 className="text-lg font-bold text-white mb-4 uppercase tracking-wider flex items-center gap-2">
            <Medal size={20} className="text-yellow-500" /> Топ Бабаев
          </h2>
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden">
            {leaderboard.map((user) => (
              <div 
                key={user.rank} 
                className={`flex items-center gap-4 p-4 border-b border-neutral-800 last:border-0 ${user.isUser ? 'bg-red-900/20' : ''}`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                  user.rank === 1 ? 'bg-yellow-500 text-black' :
                  user.rank === 2 ? 'bg-neutral-300 text-black' :
                  user.rank === 3 ? 'bg-amber-700 text-white' : 'bg-neutral-800 text-neutral-400'
                }`}>
                  {user.rank}
                </div>
                <img src={user.avatar} alt={user.name} className="w-12 h-12 rounded-full border border-neutral-700 object-cover" />
                <div className="flex-1">
                  <h3 className={`font-bold ${user.isUser ? 'text-red-400' : 'text-white'}`}>{user.name}</h3>
                  <p className="text-sm text-neutral-500">{user.score} очков страха</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Quests Section */}
        <section>
          <h2 className="text-lg font-bold text-white mb-4 uppercase tracking-wider flex items-center gap-2">
            <Target size={20} className="text-red-500" /> Ежедневные задания
          </h2>
          <div className="space-y-3">
            {dailyQuests.map(quest => (
              <QuestCard key={quest.id} quest={quest} />
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-lg font-bold text-white mb-4 uppercase tracking-wider flex items-center gap-2">
            <Star size={20} className="text-blue-500" /> Глобальные задания
          </h2>
          <div className="space-y-3">
            {globalQuests.map(quest => (
              <QuestCard key={quest.id} quest={quest} />
            ))}
          </div>
        </section>

        {/* Achievements Section */}
        <section>
          <h2 className="text-lg font-bold text-white mb-4 uppercase tracking-wider flex items-center gap-2">
            <CheckCircle2 size={20} className="text-green-500" /> Достижения
          </h2>
          <div className="grid grid-cols-2 gap-3">
            {achievements.length === 0 ? (
              <p className="text-neutral-500 col-span-2 text-center py-4">Пока нет достижений</p>
            ) : (
              achievements.map(ach => (
                <div key={ach} className="bg-neutral-900 border border-neutral-800 rounded-xl p-3 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-green-900/30 text-green-500 flex items-center justify-center">
                    <Trophy size={20} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-white truncate">Ачивка {ach.replace('quest_', '')}</p>
                    <p className="text-xs text-neutral-500 truncate">Выполнено</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

      </div>
    </motion.div>
  );
}

function QuestCard({ quest }: { quest: any; key?: string | number }) {
  const { completeQuest } = usePlayerStore();
  
  const isReady = quest.progress >= quest.target;
  
  return (
    <div className={`bg-neutral-900 border rounded-2xl p-4 ${quest.completed ? 'border-green-900/50 opacity-50' : isReady ? 'border-red-500' : 'border-neutral-800'}`}>
      <div className="flex justify-between items-start mb-2">
        <div>
          <h3 className="font-bold text-white">{quest.title}</h3>
          <p className="text-sm text-neutral-400">{quest.description}</p>
        </div>
        <div className="text-right">
          <span className="text-xs font-bold px-2 py-1 rounded bg-neutral-800 text-neutral-300">
            +{quest.reward.amount} {quest.reward.type === 'fear' ? 'Страха' : quest.reward.type === 'energy' ? 'Энергии' : 'Арбузов'}
          </span>
        </div>
      </div>
      
      <div className="mt-4 flex items-center gap-4">
        <div className="flex-1 bg-neutral-950 h-2 rounded-full overflow-hidden">
          <div 
            className={`h-full ${quest.completed ? 'bg-green-500' : 'bg-red-600'}`}
            style={{ width: `${Math.min(100, (quest.progress / quest.target) * 100)}%` }}
          />
        </div>
        <span className="text-xs font-mono text-neutral-500 w-12 text-right">
          {quest.progress}/{quest.target}
        </span>
      </div>

      {!quest.completed && isReady && (
        <button 
          onClick={() => completeQuest(quest.id)}
          className="mt-4 w-full py-2 bg-red-700 hover:bg-red-600 text-white rounded-xl font-bold transition-colors"
        >
          Забрать награду
        </button>
      )}
    </div>
  );
}
