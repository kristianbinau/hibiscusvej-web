<template>
	<UDropdownMenu
		:items="items"
		:content="{ align: 'end' }"
		:aria-label="t('nav.language')"
	>
		<UTooltip :text="ariaLabel">
			<UButton
				color="neutral"
				variant="ghost"
				:loading="switching"
				:disabled="switching"
				:aria-label="ariaLabel"
				class="h-10 px-2"
			>
				<UIcon name="i-material-symbols-language" class="size-5 shrink-0" />
				<!-- Short code on desktop, icon-only on mobile — mirroring how the
				     nav items collapse (`Navigation.vue`'s `hidden sm:block`). -->
				<span class="hidden sm:inline">{{ current.shortCode }}</span>
			</UButton>
		</UTooltip>
	</UDropdownMenu>
</template>

<script setup lang="ts">
import type { DropdownMenuItem } from '#ui/types';

const { t, locale } = useI18n();
const { switchLanguage, switching } = useLanguageSwitch();

/**
 * The menu always shows each language in its own language (native names are
 * literals, never translated), so visitors can find their language regardless
 * of the active locale. The check mark carried by `checked` is the
 * current-language indicator when the trigger is icon-only on mobile.
 */
const LOCALES = [
	{ code: 'da', nativeName: 'Dansk', shortCode: 'DA' },
	{ code: 'en', nativeName: 'English', shortCode: 'EN' },
] as const;

const current = computed(
	() => LOCALES.find((entry) => entry.code === locale.value) ?? LOCALES[0]!,
);

/**
 * Screen readers hear the interface in the locale they chose, so the
 * accessible name follows the active locale ("Sprog: Dansk" / "Language:
 * English") and contains the short code's language state for WCAG 2.5.3
 * (Label-in-Name).
 */
const ariaLabel = computed(() => t('nav.languageCurrent'));

const items = computed<DropdownMenuItem[]>(() =>
	LOCALES.map((entry) => ({
		label: entry.nativeName,
		type: 'checkbox' as const,
		checked: locale.value === entry.code,
		onSelect: () => switchLanguage(entry.code),
	})),
);
</script>
