import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface ThemeState {
  isDark: boolean;
  followSystem: boolean;
  toggle: () => void;
  setFollowSystem: (follow: boolean) => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      isDark: false,
      followSystem: false,
      toggle: () =>
        set((state) => ({ isDark: !state.isDark, followSystem: false })),
      setFollowSystem: (follow: boolean) => {
        if (follow) {
          const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
          set({ followSystem: true, isDark: prefersDark });
        } else {
          set({ followSystem: false, isDark: false }); // exit system → reset to light
        }
      },
    }),
    { name: 'trackr-theme' }
  )
);
