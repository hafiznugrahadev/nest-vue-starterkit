import { createRouter, createWebHistory } from 'vue-router';
import type { UserRole } from '@starterkit/shared-types';
import { pinia } from '~/stores/pinia';
import { useAuthStore } from '~/stores/auth.store';

declare module 'vue-router' {
  interface RouteMeta {
    requiresAuth?: boolean;
    guestOnly?: boolean;
    roles?: UserRole[];
  }
}

const REGISTRATION_ENABLED = import.meta.env['VITE_REGISTRATION_ENABLED'] === 'true';

export const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', name: 'landing', component: () => import('~/views/LandingView.vue') },
    {
      path: '/',
      component: () => import('~/layouts/AuthLayout.vue'),
      meta: { guestOnly: true },
      children: [
        { path: 'login', name: 'login', component: () => import('~/views/LoginView.vue') },
        {
          path: 'register',
          name: 'register',
          component: () => import('~/views/RegisterView.vue'),
          beforeEnter: () => (REGISTRATION_ENABLED ? true : { name: 'login' }),
        },
        {
          path: 'forgot-password',
          name: 'forgot-password',
          component: () => import('~/views/ForgotPasswordView.vue'),
        },
        {
          path: 'reset-password',
          name: 'reset-password',
          component: () => import('~/views/ResetPasswordView.vue'),
        },
      ],
    },
    {
      path: '/',
      component: () => import('~/layouts/DashboardLayout.vue'),
      meta: { requiresAuth: true },
      children: [
        {
          path: 'dashboard',
          name: 'dashboard',
          component: () => import('~/views/DashboardView.vue'),
        },
        {
          path: 'users',
          name: 'users',
          component: () => import('~/views/UsersView.vue'),
          meta: { roles: ['ADMIN', 'SUPER_ADMIN'] as UserRole[] },
        },
        { path: 'profile', name: 'profile', component: () => import('~/views/ProfileView.vue') },
        {
          path: 'logs',
          name: 'logs',
          component: () => import('~/views/LogsView.vue'),
          meta: { roles: ['SUPER_ADMIN'] as UserRole[] },
        },
        {
          path: 'demo/fields',
          name: 'demo-fields',
          component: () => import('~/views/DemoFieldsView.vue'),
        },
      ],
    },
    { path: '/:pathMatch(.*)*', redirect: '/' },
  ],
});

router.beforeEach((to) => {
  const auth = useAuthStore(pinia);

  if (to.meta.requiresAuth && !auth.isAuthenticated) {
    return { name: 'login', query: { redirect: to.fullPath } };
  }
  if (to.meta.guestOnly && auth.isAuthenticated) {
    return { name: 'dashboard' };
  }
  if (to.meta.roles && !to.meta.roles.some((r) => auth.user?.roles?.includes(r))) {
    return { name: 'dashboard' };
  }
  return true;
});
