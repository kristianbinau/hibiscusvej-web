import type { ErrorKey, ErrorParams } from '~~/server/utils/i18n-errors';

/**
 * Client-side mapping of localized server errors (locked decision §3.2).
 *
 * The server keeps error responses language-neutral: the HTTP body carries
 * the English `statusMessage`, the Danish human `message`, and — once an
 * endpoint is migrated to `createLocalizedError` — a stable key + params
 * pair nested under its `data`.
 *
 * `ofetch` exposes the whole nitro error body as `error.data`, so:
 * - the key is read as `error.data.data.key` (note the double `data`)
 * - `error.data.message` (Danish) is the fallback for unmapped errors
 *
 * Params carry ISO strings / plain numbers, never pre-formatted dates
 * (locked decision §3.9): ISO datetime params are formatted per the active
 * locale here, before interpolation.
 *
 * Keys come from the stable contract in `server/utils/i18n-errors.ts`
 * (ERROR_KEYS); the booking endpoints are migrated to it by Phase 3, until
 * which the Danish `message` fallback keeps rendering exactly as before.
 *
 * `book.vue`'s statusMessage string-matching (which opens the booking
 * request modal) is deliberately kept on the raw `error.data.statusMessage`
 * values — that is an invariant of the error contract.
 */

import { useNuxtApp } from '#app';

interface NitroErrorShape {
	data?: {
		data?: {
			key?: unknown;
			params?: unknown;
		};
		message?: unknown;
	};
}

const asNitroError = (error: unknown): NitroErrorShape | undefined =>
	typeof error === 'object' && error !== null
		? (error as NitroErrorShape)
		: undefined;

/** The stable localization key the server issued, if any. */
export const serverErrorKey = (error: unknown): ErrorKey | undefined => {
	const key = asNitroError(error)?.data?.data?.key;
	return typeof key === 'string' ? (key as ErrorKey) : undefined;
};

/** Interpolation params accompanying the server-issued key, if any. */
export const serverErrorParams = (error: unknown): ErrorParams => {
	const params = asNitroError(error)?.data?.data?.params;
	return params && typeof params === 'object' ? (params as ErrorParams) : {};
};

/** The Danish fallback message (`error.data.message`), if present. */
export const serverErrorMessage = (error: unknown): string | undefined => {
	const message = asNitroError(error)?.data?.message;
	return typeof message === 'string' && message ? message : undefined;
};

/**
 * BCP 47 tags for the supported locales — mirrors `useLocaleDate`, which
 * cannot be consumed here: this util runs outside component setup (event
 * handlers), where composables must not be called.
 */
const BCP47_BY_LOCALE: Record<string, string> = {
	da: 'da-DK',
	en: 'en',
};

/**
 * Matches the ISO-8601 date-time strings the server sends as date params
 * (e.g. the `date` param of `errors.booking.bannedUntil`).
 */
const ISO_DATETIME_PATTERN = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/;

/**
 * Date rendering mirrors what the server did before keys were introduced
 * (a Danish-formatted `toLocaleDateString('da-DK', ...)` date), now per the
 * active locale.
 */
const DATE_PARAM_FORMAT_OPTIONS: Intl.DateTimeFormatOptions = {
	day: '2-digit',
	month: 'long',
	year: '2-digit',
};

/**
 * Format ISO datetime params per the active locale, leaving other params
 * untouched. The locale comes from the global i18n composer
 * (`nuxtApp.$i18n`) because `useI18n()` requires component setup context;
 * when no locale is available the raw values are kept.
 */
const localizeErrorParams = (params: ErrorParams): Record<string, unknown> => {
	const entries = Object.entries(params);

	let localeTag: string | undefined;
	try {
		const locale = useNuxtApp().$i18n.locale?.value;
		localeTag = locale ? (BCP47_BY_LOCALE[locale] ?? locale) : undefined;
	} catch {
		// Outside a Nuxt context — keep the raw values.
	}

	if (!localeTag || entries.length === 0) {
		return { ...params };
	}

	const formatter = new Intl.DateTimeFormat(
		localeTag,
		DATE_PARAM_FORMAT_OPTIONS,
	);

	return Object.fromEntries(
		entries.map(([name, value]) => [
			name,
			typeof value === 'string' && ISO_DATETIME_PATTERN.test(value)
				? formatter.format(new Date(value))
				: value,
		]),
	);
};

/**
 * Localize a server error for display: the catalog text for the error key
 * when the server issued one, otherwise the Danish `message` fallback
 * (exactly what the code read before keys were introduced). Returns
 * `undefined` when the error carries neither a key nor a message.
 */
export const localizeServerError = (
	t: (...args: any[]) => string,
	error: unknown,
): string | undefined => {
	const key = serverErrorKey(error);
	if (key) {
		return t(key, localizeErrorParams(serverErrorParams(error)));
	}

	return serverErrorMessage(error);
};
