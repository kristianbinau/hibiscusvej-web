<template>
	<div class="flex flex-col min-h-dvh">
		<NuxtRouteAnnouncer />
		<NuxtLoadingIndicator />

		<UApp :locale="uiLocale">
			<NuxtLayout>
				<NuxtPage />
			</NuxtLayout>
		</UApp>
	</div>

	<ClientOnly>
		<ServiceWorker />
	</ClientOnly>
</template>

<script setup lang="ts">
import { da as daUiLocale, en as enUiLocale } from '@nuxt/ui/locale';
import { LOCALE_COOKIE } from '#shared/constants';
import type { LocaleCode } from '#shared/constants';

const { locale, t, setLocale } = useI18n();
const i18nHead = useLocaleHead();
const toast = useToast();

// `@nuxt/ui` v4 has no auto-following of the i18n locale — map it manually.
const uiLocale = computed(() =>
	locale.value === 'en' ? enUiLocale : daUiLocale,
);

// The locale cookie mirrors the visitor's preference; the locale middleware
// keeps it in sync on the server.
const preferenceCookie = useCookie<LocaleCode | undefined>(LOCALE_COOKIE);

useHead({
	titleTemplate: (titleChunk) => {
		return titleChunk ? `${titleChunk} - Hibiscusvej 2-30` : 'Hibiscusvej 2-30';
	},
});

useHead(() => ({
	meta: [
		{
			name: 'apple-mobile-web-app-title',
			content: 'Hibiscusvej 2-30',
		},
		{
			name: 'description',
			content: t('meta.description'),
		},
		...i18nHead.value.meta,
	],
	htmlAttrs: {
		lang: i18nHead.value.htmlAttrs.lang ?? 'da',
		dir: i18nHead.value.htmlAttrs.dir,
	},
	link: [
		{
			rel: 'icon',
			type: 'image/png',
			href: '/favicon-96x96.png',
			sizes: '96x96',
		},
		{
			rel: 'icon',
			type: 'image/svg+xml',
			href: '/favicon.svg',
		},
		{
			rel: 'shortcut icon',
			href: '/favicon.ico',
		},
		{
			rel: 'apple-touch-icon',
			sizes: '180x180',
			href: '/apple-touch-icon.png',
		},
		{
			rel: 'apple-touch-icon',
			sizes: '180x180',
			href: '/apple-touch-icon.png',
		},
		{
			rel: 'manifest',
			href: '/site.webmanifest',
		},
		...i18nHead.value.link,
	],
}));

/**
 * Non-blocking hint for visitors reading Danish whose browser language is
 * not Danish. The toast text follows the BROWSER language (not the site
 * locale), so an English browser gets English text. Accepting writes the
 * cookie first (the middleware would otherwise bounce the navigation back),
 * then stores the preference server-side for logged-in users, then switches.
 */
onMounted(() => {
	const browserLanguage = (navigator.language || '').toLowerCase();
	if (!browserLanguage || browserLanguage.startsWith('da')) {
		return;
	}
	if (locale.value !== 'da') {
		return;
	}
	if (window.localStorage.getItem('langHintDismissed')) {
		return;
	}
	// Visitors who already prefer English are not nagged about pages that
	// lack English content.
	if (preferenceCookie.value === 'en') {
		return;
	}

	// Text is selected by the visitor's browser language (see catalog note).
	const browserTextLang = browserLanguage.startsWith('da') ? 'da' : 'en';
	const message =
		browserTextLang === 'da'
			? t('langHint.message.da')
			: t('langHint.message.en');
	const acceptLabel =
		browserTextLang === 'da'
			? t('langHint.accept.da')
			: t('langHint.accept.en');
	const dismissLabel =
		browserTextLang === 'da'
			? t('langHint.dismiss.da')
			: t('langHint.dismiss.en');

	toast.add({
		icon: 'i-material-symbols-language',
		title: message,
		actions: [
			{
				label: acceptLabel,
				onClick: async () => {
					window.localStorage.setItem('langHintDismissed', '1');
					preferenceCookie.value = 'en';
					try {
						await $fetch('/api/app/users/me/language', {
							method: 'PUT',
							body: { language: 'en' },
						});
					} catch {
						// Anonymous visitors have no preference to store.
					}
					await setLocale('en');
				},
			},
			{
				label: dismissLabel,
				onClick: () => {
					window.localStorage.setItem('langHintDismissed', '1');
				},
			},
		],
	});
});
</script>
