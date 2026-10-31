import { LOCALE_COOKIE, SUPPORTED_LOCALES } from '#shared/constants';
import type { LocaleCode } from '#shared/constants';

/**
 * Switch the site language (locked decision §3.6).
 *
 * Order matters: the locale cookie must be written BEFORE `setLocale`
 * navigates — the locale middleware redirects any navigation whose URL
 * locale differs from the cookie preference, so writing the cookie last
 * would bounce the navigation straight back.
 *
 * The preference is persisted server-side for logged-in users; errors are
 * swallowed because anonymous visitors simply have no preference to store.
 */
export const useLanguageSwitch = () => {
	const { locale, setLocale } = useI18n();

	// Same options as the locale middleware uses when it writes the cookie.
	const preferenceCookie = useCookie<LocaleCode | undefined>(LOCALE_COOKIE, {
		path: '/',
		maxAge: 60 * 60 * 24 * 365,
		sameSite: 'lax',
	});

	const switching = ref(false);

	const isSupportedLocale = (value: string): value is LocaleCode =>
		(SUPPORTED_LOCALES as readonly string[]).includes(value);

	async function switchLanguage(target: LocaleCode) {
		if (
			switching.value ||
			!isSupportedLocale(target) ||
			target === locale.value
		) {
			return;
		}

		switching.value = true;
		try {
			// 0. An explicit choice is a language decision too — dismiss the
			//    browser-language hint toast in both directions (a visitor with
			//    an English browser deliberately choosing Danish must not be
			//    re-nagged on every load).
			if (import.meta.client) {
				window.localStorage.setItem('langHintDismissed', '1');
			}

			// 1. Write the cookie FIRST (see the note above).
			preferenceCookie.value = target;

			// 2. Persist the preference server-side. Anonymous visitors (and
			//    offline states) fall back to the cookie only.
			try {
				await $fetch('/api/app/users/me/language', {
					method: 'PUT',
					body: { language: target },
				});
			} catch {
				// Anonymous visitors have no preference to store.
			}

			// 3. Switch the runtime locale (navigates to the localized route).
			await setLocale(target);
		} finally {
			switching.value = false;
		}
	}

	return { switchLanguage, switching };
};
