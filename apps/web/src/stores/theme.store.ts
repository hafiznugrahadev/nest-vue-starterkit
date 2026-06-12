import { defineStore } from 'pinia';

type Theme = 'light' | 'dark';

// The anti-FOUC script in index.html already toggled the class before paint;
// the store just reads the result so charts etc. start with the right theme.
function initialTheme(): Theme {
  if (typeof document === 'undefined') return 'light';
  return document.documentElement.classList.contains('dark') ? 'dark' : 'light';
}

function applyTheme(theme: Theme) {
  document.documentElement.classList.toggle('dark', theme === 'dark');
  try {
    localStorage.setItem('theme', theme);
  } catch {
    /* ignore */
  }
}

export const useThemeStore = defineStore('theme', {
  state: () => ({ theme: initialTheme() }),
  actions: {
    toggle() {
      this.set(this.theme === 'dark' ? 'light' : 'dark');
    },
    set(theme: Theme) {
      this.theme = theme;
      applyTheme(theme);
    },
  },
});
