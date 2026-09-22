import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { createMMKV } from 'react-native-mmkv';
import type { FinickyConfig } from '@browse-router/shared';

const storage = createMMKV({ id: 'browse-router-rules' });

const mmkvStorage = {
  setItem: (name: string, value: string) => {
    storage.set(name, value);
  },
  getItem: (name: string): string | null => {
    const v = storage.getString(name);
    return v ?? null;
  },
  removeItem: (name: string) => {
    storage.remove(name);
  },
};

interface RulesState {
  configSource: string;
  config: FinickyConfig | null;
  lastError: string | null;
  setConfigSource: (source: string) => void;
  setConfig: (config: FinickyConfig | null, error: string | null) => void;
}

export const useRulesStore = create<RulesState>()(
  persist(
    (set) => ({
      configSource: '',
      config: null,
      lastError: null,
      setConfigSource: (source) => set({ configSource: source }),
      setConfig: (config, error) => set({ config, lastError: error }),
    }),
    {
      name: 'rules-state',
      storage: createJSONStorage(() => mmkvStorage),
    },
  ),
);

export const rulesStorage = storage;
