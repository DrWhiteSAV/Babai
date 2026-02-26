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
export type FontSize = "small" | "medium" | "large";

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
  title: string;
  description: string;
  reward: { type: 'fear' | 'energy' | 'watermelons'; amount: number };
  completed: boolean;
}

export interface PlayerState {
  character: Character | null;
  fear: number;
  energy: number;
  watermelons: number;
  lastEnergyUpdate: number;
  inventory: string[];
  gallery: string[];
  achievements: string[];
  friends: Friend[];
  groupChats: GroupChat[];
  quests: Quest[];
  settings: {
    buttonSize: ButtonSize;
    fontSize: FontSize;
    musicVolume: number;
  };
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
  buyItem: (item: string, cost: number, currency?: 'fear' | 'watermelons') => boolean;
  addToGallery: (url: string) => void;
  upgradeTelekinesis: (cost: number) => boolean;
  addAchievement: (id: string) => void;
  addFriend: (name: string) => void;
  toggleFriendAi: (name: string) => void;
  createGroupChat: (name: string, members: string[]) => void;
  completeQuest: (id: string) => void;
}

const ENERGY_REGEN_RATE = 5 * 60 * 1000; // 5 minutes in ms

export const usePlayerStore = create<PlayerState>()(
  persist(
    (set, get) => ({
      character: null,
      fear: 0,
      energy: 50, // Starting energy
      watermelons: 0,
      lastEnergyUpdate: Date.now(),
      inventory: [],
      gallery: [],
      achievements: [],
      friends: [{ name: "ДанИИл", isAiEnabled: true }],
      groupChats: [],
      quests: [
        { id: 'q1', title: 'Первый испуг', description: 'Выгони 5 жильцов', reward: { type: 'fear', amount: 10 }, completed: false },
        { id: 'q2', title: 'Арбузный магнат', description: 'Победи босса', reward: { type: 'watermelons', amount: 5 }, completed: false }
      ],
      settings: {
        buttonSize: "medium",
        fontSize: "medium",
        musicVolume: 50,
      },
      setCharacter: (char) => set({ character: char }),
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
          set({ gallery: [...gallery, url] });
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
        const { quests, addFear, addEnergy, addWatermelons } = get();
        const quest = quests.find(q => q.id === id);
        if (quest && !quest.completed) {
          set({ quests: quests.map(q => q.id === id ? { ...q, completed: true } : q) });
          if (quest.reward.type === 'fear') addFear(quest.reward.amount);
          if (quest.reward.type === 'energy') addEnergy(quest.reward.amount);
          if (quest.reward.type === 'watermelons') addWatermelons(quest.reward.amount);
        }
      }
    }),
    {
      name: "babai-storage",
    },
  ),
);
