import { defineStore } from 'pinia';

export const usePaletteStore = defineStore('palette', {
  state: () => ({ open: false }),
  actions: {
    openPalette() {
      this.open = true;
    },
    closePalette() {
      this.open = false;
    },
    toggle() {
      this.open = !this.open;
    },
  },
});
