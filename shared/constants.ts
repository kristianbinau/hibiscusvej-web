/**
 * Shared constants available to both the Vue app and the Nitro server.
 */

/**
 * `handledText` value the server writes when a booking request is auto-closed
 * because another user created a booking for the same slot. Client code
 * exact-matches this to render a localized string instead of the raw Danish
 * text. Admin screens keep showing the raw persisted text.
 */
export const AUTO_CLOSE_HANDLED_TEXT =
	'Automatisk lukket ved oprettelse af booking af anden bruger';

/**
 * Cookie that mirrors the visitor's language preference (`da` | `en`).
 *
 * The database (`userSettings`, key `language`) is authoritative for logged-in
 * users; the cookie is the cache that lets the locale middleware resolve the
 * preference without a per-request database hit.
 *
 * The cookie must be written BEFORE redirecting, otherwise the locale
 * middleware bounces the navigation back.
 */
export const LOCALE_COOKIE = 'i18n_locale';

/**
 * `userSettings` KV key under which the language preference is stored.
 */
export const USER_SETTINGS_LANGUAGE_KEY = 'language';

/**
 * Supported locale codes (`@nuxtjs/i18n` `locales[].code`).
 */
export const SUPPORTED_LOCALES = ['da', 'en'] as const;

export type LocaleCode = (typeof SUPPORTED_LOCALES)[number];

export const DEFAULT_LOCALE: LocaleCode = 'da';
