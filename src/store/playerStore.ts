import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Gender = "Бабай" | "Бабайка";
export type Style =
  | "Фотореализм"
  | "Хоррор"
  | "Стимпанк"
  | "Киберпанк"
  | "Аниме"
  | "Постсоветский"
  | "Русская сказка"
  | "2D мультфильм"
  | "Фентези деревня";
export type ButtonSize = "small" | "medium" | "large";
export type FontFamily = 
  | "Inter" 
  | "Roboto"
  | "Montserrat"
  | "Playfair Display" 
  | "JetBrains Mono" 
  | "Press Start 2P" 
  | "Russo One"
  | "Rubik Beastly"
  | "Rubik Burned"
  | "Rubik Glitch"
  | "Neucha"
  | "Ruslan Display";
export type Theme = "normal" | "cyberpunk";

export interface Character {
  name: string;
  gender: Gender;
  style: Style;
  wishes: string[];
  avatarUrl: string;
  telekinesisLevel: number;
  lore?: string;
}

export interface Friend {
  name: string;
  isAiEnabled: boolean;
}

export interface GroupChat {
  id: string;
  name: string;
  members: string[];
}

export interface Quest {
  id: string;
  type: 'daily' | 'global';
  title: string;
  description: string;
  reward: { type: 'fear' | 'energy' | 'watermelons'; amount: number };
  completed: boolean;
  progress: number;
  target: number;
}

export interface PlayerState {
  character: Character | null;
  fear: number;
  energy: number;
  watermelons: number;
  bossLevel: number;
  lastEnergyUpdate: number;
  inventory: string[];
  gallery: string[];
  achievements: string[];
  friends: Friend[];
  groupChats: GroupChat[];
  quests: Quest[];
  settings: {
    buttonSize: ButtonSize;
    fontFamily: FontFamily;
    fontSize: number;
    theme: Theme;
    musicVolume: number;
    ttsEnabled: boolean;
  };
  globalBackgroundUrl: string | null;
  setCharacter: (char: Character) => void;
  updateCharacter: (updates: Partial<Character>) => void;
  addFear: (amount: number) => void;
  spendFear: (amount: number) => boolean;
  useEnergy: (amount: number) => boolean;
  addEnergy: (amount: number) => void;
  addWatermelons: (amount: number) => void;
  spendWatermelons: (amount: number) => boolean;
  updateEnergy: () => void;
  updateSettings: (settings: Partial<PlayerState["settings"]>) => void;
  setGlobalBackgroundUrl: (url: string) => void;
  buyItem: (item: string, cost: number, currency?: 'fear' | 'watermelons') => boolean;
  addToGallery: (url: string) => void;
  upgradeTelekinesis: (cost: number) => boolean;
  upgradeBossLevel: (cost: number) => boolean;
  addAchievement: (id: string) => void;
  addFriend: (name: string) => void;
  toggleFriendAi: (name: string) => void;
  createGroupChat: (name: string, members: string[]) => void;
  completeQuest: (id: string) => void;
  updateQuestProgress: (id: string, amount: number) => void;
}

export const ENERGY_REGEN_RATE = 5 * 60 * 1000; // 5 minutes in ms

export const DEFAULT_IMAGES = [
  "https://images.unsplash.com/photo-1505635552518-3448ff116af3?q=80&w=1080&auto=format&fit=crop",
  "https://i.ibb.co/BVgY7XrT/babai.png",
  "https://images.unsplash.com/photo-1519074002996-a69e7ac46a42?q=80&w=1080&auto=format&fit=crop",
  "https://picsum.photos/seed/boss/400/400",
  "https://picsum.photos/seed/babai/400/400"
];

export const usePlayerStore = create<PlayerState>()(
  persist(
    (set, get) => ({
      character: null,
      fear: 0,
      energy: 50, // Starting energy
      watermelons: 0,
      bossLevel: 1,
      lastEnergyUpdate: Date.now(),
      inventory: [],
      gallery: DEFAULT_IMAGES,
      achievements: [],
      friends: [{ name: "ДанИИл", isAiEnabled: true }],
      groupChats: [],
      quests: [
        { id: 'q1', type: 'daily', title: 'Первый испуг', description: 'Выгони 5 жильцов', reward: { type: 'fear', amount: 50 }, completed: false, progress: 0, target: 5 },
        { id: 'q2', type: 'daily', title: 'Сборщик дани', description: 'Собери 3 арбуза', reward: { type: 'watermelons', amount: 3 }, completed: false, progress: 0, target: 3 },
        { id: 'q3', type: 'global', title: 'Арбузный магнат', description: 'Победи босса', reward: { type: 'watermelons', amount: 15 }, completed: false, progress: 0, target: 1 },
        { id: 'q4', type: 'global', title: 'Мастер телекинеза', description: 'Прокачай телекинез до 5 уровня', reward: { type: 'energy', amount: 100 }, completed: false, progress: 0, target: 5 }
      ],
      settings: {
        buttonSize: "medium",
        fontFamily: "Inter",
        fontSize: 16,
        theme: "normal",
        musicVolume: 50,
        ttsEnabled: false,
      },
      globalBackgroundUrl: null,
      setCharacter: (char) => {
        const { addToGallery } = get();
        set({ character: char });
        if (char.avatarUrl) {
          addToGallery(char.avatarUrl);
        }
      },
      updateCharacter: (updates) => {
        const { character } = get();
        if (character) set({ character: { ...character, ...updates } });
      },
      addFear: (amount) => set((state) => ({ fear: state.fear + amount })),
      spendFear: (amount) => {
        const { fear } = get();
        if (fear >= amount) {
          set({ fear: fear - amount });
          return true;
        }
        return false;
      },
      useEnergy: (amount) => {
        const { energy } = get();
        if (energy >= amount) {
          set({ energy: energy - amount });
          return true;
        }
        return false;
      },
      addEnergy: (amount) => set((state) => ({ energy: state.energy + amount })),
      addWatermelons: (amount) => set((state) => ({ watermelons: state.watermelons + amount })),
      spendWatermelons: (amount) => {
        const { watermelons } = get();
        if (watermelons >= amount) {
          set({ watermelons: watermelons - amount });
          return true;
        }
        return false;
      },
      updateEnergy: () => {
        const { energy, lastEnergyUpdate } = get();
        const now = Date.now();
        const diff = now - lastEnergyUpdate;
        const energyToAdd = Math.floor(diff / ENERGY_REGEN_RATE);

        if (energyToAdd > 0) {
          set({
            energy: energy + energyToAdd,
            lastEnergyUpdate: now - (diff % ENERGY_REGEN_RATE),
          });
        }
      },
      updateSettings: (newSettings) =>
        set((state) => ({ settings: { ...state.settings, ...newSettings } })),
      setGlobalBackgroundUrl: (url) => set({ globalBackgroundUrl: url }),
      buyItem: (item, cost, currency = 'fear') => {
        const { fear, watermelons, inventory } = get();
        if (inventory.includes(item)) return false;

        if (currency === 'fear' && fear >= cost) {
          set({ fear: fear - cost, inventory: [...inventory, item] });
          return true;
        } else if (currency === 'watermelons' && watermelons >= cost) {
          set({ watermelons: watermelons - cost, inventory: [...inventory, item] });
          return true;
        }
        return false;
      },
      addToGallery: (url) => {
        const { gallery } = get();
        if (!gallery.includes(url)) {
          // Limit gallery to 6 images. Base64 strings are huge (~300-500KB each).
          // 3 was too low, 15 was too high. 6 is a middle ground.
          const newGallery = [url, ...gallery].slice(0, 6);
          try {
            set({ gallery: newGallery });
          } catch (e) {
            console.error("Failed to save to localStorage, clearing gallery to save space.");
            set({ gallery: [url] }); // Try saving only the newest one
          }
        }
      },
      upgradeTelekinesis: (cost) => {
        const { fear, character } = get();
        if (character && fear >= cost) {
          set({
            fear: fear - cost,
            character: {
              ...character,
              telekinesisLevel: character.telekinesisLevel + 1,
            },
          });
          return true;
        }
        return false;
      },
      upgradeBossLevel: (cost) => {
        const { watermelons, bossLevel } = get();
        if (watermelons >= cost) {
          set({
            watermelons: watermelons - cost,
            bossLevel: bossLevel + 1,
          });
          return true;
        }
        return false;
      },
      addAchievement: (id) => {
        const { achievements } = get();
        if (!achievements.includes(id)) {
          set({ achievements: [...achievements, id] });
        }
      },
      addFriend: (name) => {
        const { friends } = get();
        if (!friends.find(f => f.name === name)) {
          set({ friends: [...friends, { name, isAiEnabled: false }] });
        }
      },
      toggleFriendAi: (name) => {
        const { friends } = get();
        set({
          friends: friends.map(f => f.name === name ? { ...f, isAiEnabled: !f.isAiEnabled } : f)
        });
      },
      createGroupChat: (name, members) => {
        const { groupChats } = get();
        set({ groupChats: [...groupChats, { id: Date.now().toString(), name, members }] });
      },
      completeQuest: (id) => {
        const { quests, addFear, addEnergy, addWatermelons, addAchievement } = get();
        const quest = quests.find(q => q.id === id);
        if (quest && !quest.completed && quest.progress >= quest.target) {
          set({ quests: quests.map(q => q.id === id ? { ...q, completed: true } : q) });
          if (quest.reward.type === 'fear') addFear(quest.reward.amount);
          if (quest.reward.type === 'energy') addEnergy(quest.reward.amount);
          if (quest.reward.type === 'watermelons') addWatermelons(quest.reward.amount);
          addAchievement(`quest_${id}`);
        }
      },
      updateQuestProgress: (id, amount) => {
        const { quests } = get();
        set({
          quests: quests.map(q => {
            if (q.id === id && !q.completed) {
              const newProgress = Math.min(q.progress + amount, q.target);
              return { ...q, progress: newProgress };
            }
            return q;
          })
        });
      }
    }),
    {
      name: "babai-storage",
      onRehydrateStorage: () => (state) => {
        if (state) {
          // Ensure we don't carry over too many images from previous versions
          if (state.gallery.length > 6) {
            state.gallery = state.gallery.slice(0, 6);
          }
        }
      },
    },
  ),
);
