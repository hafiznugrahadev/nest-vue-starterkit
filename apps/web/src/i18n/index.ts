import { createI18n } from 'vue-i18n';

import en from './locales/en.json';
import id from './locales/id.json';

export const LOCALE_COOKIE = 'i18n_locale';
const SUPPORTED = ['en', 'id'] as const;
export type Locale = (typeof SUPPORTED)[number];

function detectLocale(): Locale {
  const match = document.cookie.match(new RegExp(`(?:^|; )${LOCALE_COOKIE}=([^;]*)`));
  const fromCookie = match?.[1];
  if (fromCookie && (SUPPORTED as readonly string[]).includes(fromCookie))
    return fromCookie as Locale;
  return navigator.language?.toLowerCase().startsWith('id') ? 'id' : 'en';
}

export function persistLocale(locale: Locale) {
  const maxAge = 60 * 60 * 24 * 365;
  document.cookie = `${LOCALE_COOKIE}=${locale}; path=/; max-age=${maxAge}`;
}

export const i18n = createI18n({
  legacy: false,
  locale: detectLocale(),
  fallbackLocale: 'en',
  messages: { en, id },
});
