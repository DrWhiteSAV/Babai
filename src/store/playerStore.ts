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
}

export interface PlayerState {
  character: Character | null;
  fear: number;
  energy: number;
  lastEnergyUpdate: number;
  inventory: string[];
  settings: {
    buttonSize: ButtonSize;
    fontSize: FontSize;
    musicVolume: number;
  };
  setCharacter: (char: Character) => void;
  addFear: (amount: number) => void;
  spendFear: (amount: number) => boolean;
  useEnergy: (amount: number) => boolean;
  updateEnergy: () => void;
  updateSettings: (settings: Partial<PlayerState["settings"]>) => void;
  buyItem: (item: string, cost: number) => boolean;
  upgradeTelekinesis: (cost: number) => boolean;
}

const MAX_ENERGY = 100; // Assuming a max for now, though prompt says "no limit", but usually there's a soft cap or it just keeps growing. Let's just let it grow or cap it at 100 for offline regen.
const ENERGY_REGEN_RATE = 5 * 60 * 1000; // 5 minutes in ms

export const usePlayerStore = create<PlayerState>()(
  persist(
    (set, get) => ({
      character: null,
      fear: 0,
      energy: 50, // Starting energy
      lastEnergyUpdate: Date.now(),
      inventory: [],
      settings: {
        buttonSize: "medium",
        fontSize: "medium",
        musicVolume: 50,
      },
      setCharacter: (char) => set({ character: char }),
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
      buyItem: (item, cost) => {
        const { fear, inventory } = get();
        if (fear >= cost && !inventory.includes(item)) {
          set({ fear: fear - cost, inventory: [...inventory, item] });
          return true;
        }
        return false;
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
    }),
    {
      name: "babai-storage",
    },
  ),
);
