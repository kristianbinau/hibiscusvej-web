import {
	DEFAULT_LOCALE,
	LOCALE_COOKIE,
	SUPPORTED_LOCALES,
} from '#shared/constants';
import type { LocaleCode } from '#shared/constants';

/**
 * Custom locale resolution ladder (locked decision §3.5):
 *
 * 1. Cookie preference (`LOCALE_COOKIE`) — authoritative on any navigation.
 * 2. Logged-in `userSettings.language` — one-time DB self-heal when an
 *    `Authorization` header is present on the SSR document request: the
 *    preference is written into the cookie and the visitor is redirected if
 *    it differs from the URL locale. No per-request DB hit (JWT auth).
 * 3. Browser language (`Accept-Language`) — initial entry only (SSR). The
 *    cookie is written BEFORE redirecting so the preference sticks.
 *
 * Redirects are always 302. Admin/system-admin routes are never redirected.
 * `detectBrowserLanguage` is OFF in the module; this middleware is the only
 * locale redirector.
 */

/** Route prefixes that are not localized and must never be redirected. */
const UNLOCALIZED_PREFIXES = ['/u/admin', '/u/system-admin'];

const isLocaleCode = (value: unknown): value is LocaleCode =>
	SUPPORTED_LOCALES.includes(value as LocaleCode);

const isAdminPath = (path: string) =>
	UNLOCALIZED_PREFIXES.some(
		(prefix) => path === prefix || path.startsWith(`${prefix}/`),
	);

/** App routes exist in every locale (Vue pages localized by the module). */
const isAppRoute = (path: string) =>
	path === '/' || path.startsWith('/auth') || path.startsWith('/u');

/**
 * Split a URL path into its URL locale and the locale-less path.
 * `strategy: 'prefix_except_default'` → only `en` is prefixed.
 */
const splitLocalePath = (
	path: string,
): {
	urlLocale: LocaleCode;
	barePath: string;
} => {
	if (path === '/en' || path.startsWith('/en/')) {
		return { urlLocale: 'en', barePath: path.slice(3) || '/' };
	}
	return { urlLocale: DEFAULT_LOCALE, barePath: path };
};

const localizedPath = (barePath: string, locale: LocaleCode) =>
	locale === 'en' ? `/en${barePath === '/' ? '' : barePath}` : barePath;

/**
 * Map an `Accept-Language` header to a supported locale:
 * non-`da*` ⇒ `en`, `da-DK`/`da` ⇒ `da`. `undefined` when the header is absent.
 */
const localeFromAcceptLanguage = (
	header: string | undefined,
): LocaleCode | undefined => {
	if (!header) {
		return undefined;
	}

	let best: { lang: string; q: number } | undefined;
	for (const part of header.split(',')) {
		const [lang, ...params] = part.trim().split(';');
		let q = 1;
		for (const param of params) {
			const match = param.trim().match(/^q=([0-9.]+)$/);
			if (match) {
				q = Number.parseFloat(match[1] ?? '') || 0;
			}
		}
		if (!best || q > best.q) {
			best = { lang: (lang ?? '').trim().toLowerCase(), q };
		}
	}

	if (!best || best.q <= 0) {
		return undefined;
	}
	return best.lang === 'da' || best.lang.startsWith('da-') ? 'da' : 'en';
};

/**
 * Whether the target locale can serve this path without bouncing back:
 * - app routes exist in every locale;
 * - `/en/...` content paths must have English content, otherwise the
 *   catch-all would 302 straight back to the Danish path and loop;
 * - Danish content paths are the source of truth (missing content 404s in
 *   the catch-all either way).
 */
const isReachable = async (locale: LocaleCode, barePath: string) => {
	if (isAppRoute(barePath)) {
		return true;
	}

	if (locale === 'en') {
		try {
			const page = await queryCollection('pages_en').path(barePath).first();
			return page != null;
		} catch {
			return false;
		}
	}

	return true;
};

export default defineNuxtRouteMiddleware(async (to) => {
	const { urlLocale, barePath } = splitLocalePath(to.path);

	// Admin/system-admin pages are excluded from localization.
	if (isAdminPath(barePath)) {
		return;
	}

	const redirect = (locale: LocaleCode) =>
		navigateTo(
			{ path: localizedPath(barePath, locale), query: to.query, hash: to.hash },
			{ redirectCode: 302 },
		);

	// Tier 1 — cookie preference (authoritative on any navigation).
	const cookie = useCookie<LocaleCode | undefined>(LOCALE_COOKIE, {
		path: '/',
		maxAge: 60 * 60 * 24 * 365,
		sameSite: 'lax',
	});

	if (isLocaleCode(cookie.value)) {
		if (
			cookie.value !== urlLocale &&
			(await isReachable(cookie.value, barePath))
		) {
			return redirect(cookie.value);
		}
		return;
	}

	// Tier 2 — one-time DB self-heal for logged-in visitors. The service
	// worker injects `Authorization` onto document navigations; resolve the
	// stored preference through the language endpoint and mirror it into the
	// cookie. Failures (anonymous/invalid token) fall through to tier 3.
	if (import.meta.server) {
		const { authorization } = useRequestHeaders(['authorization']);
		if (authorization) {
			try {
				const { language } = await $fetch<{ language: LocaleCode }>(
					'/api/app/users/me/language',
					{ headers: { authorization } },
				);

				if (isLocaleCode(language)) {
					cookie.value = language;
					if (
						language !== urlLocale &&
						(await isReachable(language, barePath))
					) {
						return redirect(language);
					}
					return;
				}
			} catch {
				// Not (validly) authenticated — treat as anonymous.
			}
		}
	}

	// Tier 3 — browser language on initial entry (SSR document requests only;
	// client-side navigations are never the initial entry).
	if (import.meta.server) {
		const { 'accept-language': acceptLanguage } = useRequestHeaders([
			'accept-language',
		]);
		const browserLocale = localeFromAcceptLanguage(acceptLanguage);

		if (
			browserLocale &&
			browserLocale !== urlLocale &&
			(await isReachable(browserLocale, barePath))
		) {
			// Write the cookie BEFORE redirecting.
			cookie.value = browserLocale;
			return redirect(browserLocale);
		}
	}
});
