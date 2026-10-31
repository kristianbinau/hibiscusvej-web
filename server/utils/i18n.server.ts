import { createI18n } from 'vue-i18n';
import type { Composer, DefineLocaleMessage } from 'vue-i18n';
import { parse } from 'yaml';
import daRaw from '~~/i18n/locales/da.yaml?raw';
import enRaw from '~~/i18n/locales/en.yaml?raw';
import { DEFAULT_LOCALE, SUPPORTED_LOCALES } from '#shared/constants';
import type { LocaleCode } from '#shared/constants';

/**
 * Server-side vue-i18n for rendering locale-specific strings from the SAME
 * YAML catalog the client uses (locked decision §3.3).
 *
 * Server-side localization exists ONLY for push notifications: push payloads
 * are rendered per recipient (`tForUser`) in Phase 3. HTTP error responses
 * stay language-neutral (`server/utils/i18n-errors.ts`).
 *
 * Nitro cannot import YAML natively, so this skeleton proves the mechanism:
 * import the raw YAML (`?raw`) and parse it with the `yaml` package at
 * module init. Phase 3 finalizes this module (per-recipient lookup,
 * interpolation params, admin fan-out grouping).
 */

const parseMessages = (raw: string): DefineLocaleMessage =>
	parse(raw) as DefineLocaleMessage;

export const serverMessages = {
	da: parseMessages(daRaw),
	en: parseMessages(enRaw),
} satisfies Record<LocaleCode, DefineLocaleMessage>;

/**
 * One composer per locale — never a shared mutable locale, since requests
 * are concurrent.
 */
const composers = new Map<LocaleCode, Composer>();

const composerFor = (locale: LocaleCode): Composer => {
	const existing = composers.get(locale);
	if (existing) {
		return existing;
	}

	const i18n = createI18n({
		legacy: false,
		locale,
		fallbackLocale: DEFAULT_LOCALE,
		messages: serverMessages,
	});

	const composer = i18n.global;
	composers.set(locale, composer);
	return composer;
};

/**
 * Translate for a specific locale. Falls back to Danish for missing keys.
 *
 * ```ts
 * tFor('en')('errors.booking.maxWeeklyReached', { count: 2 })
 * ```
 */
export const tFor = (locale: LocaleCode) => {
	const composer = composerFor(
		SUPPORTED_LOCALES.includes(locale) ? locale : DEFAULT_LOCALE,
	);

	return (key: string, params?: Record<string, unknown>): string =>
		composer.t(key, params ?? {}) as string;
};
