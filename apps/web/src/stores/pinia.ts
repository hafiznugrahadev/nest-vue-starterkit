import { createPinia } from 'pinia';

// Standalone instance so non-component modules (api-client) can read stores
// without depending on the app install order.
export const pinia = createPinia();
