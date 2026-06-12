import { createApp } from 'vue';
import App from './App.vue';
import { pinia } from './stores/pinia';
import { i18n } from './i18n';
import { router } from './router';
import { useAuthStore } from './stores/auth.store';
import './styles/main.css';

const app = createApp(App);
app.use(pinia);
app.use(i18n);

// Exchange the httpOnly refresh cookie for a session BEFORE the router resolves
// the first navigation, so guards see the real auth state on hard reload.
const auth = useAuthStore(pinia);
await auth.bootstrap();

app.use(router);
await router.isReady();
app.mount('#app');
