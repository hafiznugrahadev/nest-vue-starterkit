<script setup lang="ts">
import { DropdownMenuRoot, DropdownMenuTrigger } from 'reka-ui';
import { Check, Languages } from 'lucide-vue-next';
import { useI18n } from 'vue-i18n';
import { computed } from 'vue';
import DropdownMenuContent from '~/components/ui/DropdownMenuContent.vue';
import DropdownMenuItem from '~/components/ui/DropdownMenuItem.vue';
import { persistLocale, type Locale } from '~/i18n';

const LANGUAGES: { code: Locale; label: string; short: string }[] = [
  { code: 'en', label: 'English', short: 'EN' },
  { code: 'id', label: 'Indonesia', short: 'ID' },
];

const { locale } = useI18n();
const current = computed(
  () => LANGUAGES.find((l) => locale.value.startsWith(l.code)) ?? LANGUAGES[0]!,
);

function changeLanguage(code: Locale) {
  locale.value = code;
  persistLocale(code);
}
</script>

<template>
  <DropdownMenuRoot>
    <DropdownMenuTrigger as-child>
      <button
        type="button"
        data-testid="language-switcher"
        class="flex h-10 items-center gap-1.5 rounded-lg px-2.5 hover:bg-accent transition-colors text-sm font-medium"
      >
        <Languages class="h-4 w-4" />
        <span>{{ current.short }}</span>
      </button>
    </DropdownMenuTrigger>
    <DropdownMenuContent align="end">
      <DropdownMenuItem
        v-for="l in LANGUAGES"
        :key="l.code"
        class="flex items-center justify-between gap-4"
        @select="changeLanguage(l.code)"
      >
        <span>{{ l.label }}</span>
        <Check v-if="current.code === l.code" class="h-4 w-4 text-primary" />
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenuRoot>
</template>
