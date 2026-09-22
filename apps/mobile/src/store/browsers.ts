import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { createMMKV } from 'react-native-mmkv';
import { DEFAULT_BROWSERS, type Browser, type BrowserId } from '@browse-router/shared';

const storage = createMMKV({ id: 'browse-router-browsers' });

const mmkvStorage = {
  setItem: (name: string, value: string) => storage.set(name, value),
  getItem: (name: string): string | null => storage.getString(name) ?? null,
  removeItem: (name: string) => storage.remove(name),
};

interface HistoryEntry {
  url: string;
  rewritten: string;
  browser: BrowserId;
  matchedRule: number | null;
  timestamp: number;
}

interface BrowsersState {
  installedIds: BrowserId[];
  defaultBrowser: BrowserId;
  history: HistoryEntry[];
  setInstalledIds: (ids: BrowserId[]) => void;
  setDefaultBrowser: (id: BrowserId) => void;
  recordHistory: (entry: HistoryEntry) => void;
  clearHistory: () => void;
}

const MAX_HISTORY = 50;

export const useBrowsersStore = create<BrowsersState>()(
  persist(
    (set) => ({
      installedIds: DEFAULT_BROWSERS.map((b: Browser) => b.id),
      defaultBrowser: DEFAULT_BROWSERS[0]?.id ?? 'com.android.chrome',
      history: [],
      setInstalledIds: (ids) => set({ installedIds: ids }),
      setDefaultBrowser: (id) => set({ defaultBrowser: id }),
      recordHistory: (entry) =>
        set((state) => ({
          history: [entry, ...state.history].slice(0, MAX_HISTORY),
        })),
      clearHistory: () => set({ history: [] }),
    }),
    {
      name: 'browsers-state',
      storage: createJSONStorage(() => mmkvStorage),
    },
  ),
);

export const browsersStorage = storage;
