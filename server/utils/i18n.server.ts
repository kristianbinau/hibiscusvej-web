import { createI18n } from 'vue-i18n';
import type { Composer, DefineLocaleMessage } from 'vue-i18n';
import { and, eq } from 'drizzle-orm';
import { parse } from 'yaml';
import daRaw from '~~/i18n/locales/da.yaml?raw';
import enRaw from '~~/i18n/locales/en.yaml?raw';
import {
	DEFAULT_LOCALE,
	SUPPORTED_LOCALES,
	USER_SETTINGS_LANGUAGE_KEY,
} from '#shared/constants';
import type { LocaleCode } from '#shared/constants';

/**
 * Server-side vue-i18n for rendering locale-specific strings from the SAME
 * YAML catalog the client uses (locked decision §3.3).
 *
 * Server-side localization exists ONLY for push notifications: push payloads
 * are rendered per recipient language (`server/utils/notification.ts`).
 * HTTP error responses stay language-neutral
 * (`server/utils/i18n-errors.ts`).
 *
 * Nitro cannot import YAML natively, so the catalogs are imported raw
 * (`?raw`) and parsed with the `yaml` package at module init.
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

export type Translator = ReturnType<typeof tFor>;

/**
 * Normalize a stored `userSettings` value to a supported locale. Unknown or
 * missing values fall back to Danish.
 */
export const normalizeLocale = (
	value: string | null | undefined,
): LocaleCode => (value === 'en' || value === 'da' ? value : DEFAULT_LOCALE);

/**
 * Resolve a user's stored language preference (the `userSettings` KV row,
 * key `language`). Throws on database failure — callers decide how to
 * degrade.
 */
export const resolveUserLocale = async (
	userId: number,
): Promise<LocaleCode> => {
	const setting = await useDrizzle()
		.select({ value: tables.userSettings.value })
		.from(tables.userSettings)
		.where(
			and(
				eq(tables.userSettings.userId, userId),
				eq(tables.userSettings.key, USER_SETTINGS_LANGUAGE_KEY),
			),
		)
		.get();

	return normalizeLocale(setting?.value);
};

/**
 * Translate for a specific user, rendering with the language stored in their
 * `userSettings` (default Danish). Push notifications fire from event
 * handlers where the request locale belongs to the SENDER, never the
 * recipient — so the recipient's preference is read from the database.
 *
 * ```ts
 * (await tForUser(userId))('push.user.accountVerified')
 * ```
 */
export const tForUser = async (userId: number): Promise<Translator> =>
	tFor(await resolveUserLocale(userId));
