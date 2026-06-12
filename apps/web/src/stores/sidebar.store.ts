import { defineStore } from 'pinia';

export const useSidebarStore = defineStore('sidebar', {
  state: () => ({
    expanded: true,
    mobileOpen: false,
    expandedGroups: [] as string[],
  }),
  actions: {
    toggleExpanded() {
      this.expanded = !this.expanded;
    },
    toggleMobile() {
      this.mobileOpen = !this.mobileOpen;
    },
    closeMobile() {
      this.mobileOpen = false;
    },
    toggleGroup(label: string) {
      this.expandedGroups = this.expandedGroups.includes(label)
        ? this.expandedGroups.filter((g) => g !== label)
        : [...this.expandedGroups, label];
    },
  },
});
