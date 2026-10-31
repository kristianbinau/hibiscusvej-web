import type { LocaleCode } from '#shared/constants';

/**
 * Stable error-key API contract (locked decision §3.2).
 *
 * Server errors stay language-neutral on the wire: they keep their existing
 * English `statusMessage` and Danish human `message` (byte-identical
 * invariants — `app/pages/u/communal/book.vue` string-matches the
 * statusMessages) and additionally carry `data.key` + `data.params`.
 *
 * The client maps the key to catalog text for the active locale and falls
 * back to the Danish `message` for unmapped errors.
 *
 * WIRE FORMAT (nitro error handler): the response body is
 * `{ error, url, statusCode, statusMessage, message, data: { key, params } }`.
 * The client (`$fetch`/ofetch) exposes the whole body as `error.data`, so the
 * key is read as `error.data.data.key` (Phase 2) — `error.data.message` is the
 * Danish fallback, `error.data.statusMessage` the English phrase.
 *
 * INVARIANTS:
 * - `statusMessage` and `message` values must stay byte-identical when a
 *   `createError` site is migrated to `createLocalizedError`.
 * - `createLocalizedError` must NEVER wrap validation paths: zod validation
 *   uses `data` for the raw ZodError (`readValidatedBody`), and English
 *   defaults for zod messages are a documented pre-existing quirk.
 * - Interpolation params carry ISO strings / plain numbers, never
 *   pre-formatted dates (the client formats per locale).
 */

export const ERROR_KEYS = {
	/** 403 — user exists but is not verified. */
	bookingNotVerified: 'errors.booking.notVerified',
	/** 403 — user is banned. `date` param: ISO datetime the ban lifts. */
	bookingBannedUntil: 'errors.booking.bannedUntil',
	/** 403 — user is banned permanently. */
	bookingBanned: 'errors.booking.banned',
	/** 400 — start time after end time. */
	bookingStartAfterEnd: 'errors.booking.startAfterEnd',
	/** 400 — start time in the past. */
	bookingStartInPast: 'errors.booking.startInPast',
	/** 409 — an existing booking overlaps the requested slot. */
	bookingSlotTaken: 'errors.booking.slotTaken',
	/** 409 — the user's own booking request overlaps the requested slot. */
	bookingOwnRequestOverlap: 'errors.booking.ownRequestOverlap',
	/** 409 — consecutive-booking limit. `count` param: allowed bookings. */
	bookingMaxConsecutiveReached: 'errors.booking.maxConsecutiveReached',
	/** 409 — consecutive bookings not allowed at all. */
	bookingNoConsecutiveAllowed: 'errors.booking.noConsecutiveAllowed',
	/** 409 — weekly booking limit. `count` param: allowed bookings. */
	bookingMaxWeeklyReached: 'errors.booking.maxWeeklyReached',
	/** 409 — monthly booking limit. `count` param: allowed bookings. */
	bookingMaxMonthlyReached: 'errors.booking.maxMonthlyReached',
} as const;

export type ErrorKey = (typeof ERROR_KEYS)[keyof typeof ERROR_KEYS];

/**
 * Interpolation params carried with an error key. Values are ISO strings
 * (dates) or numbers — never pre-formatted text.
 */
export type ErrorParams = Record<string, string | number>;

export interface LocalizedErrorOptions {
	statusCode: number;
	/**
	 * English HTTP status phrase. Byte-identical invariant — the client
	 * string-matches some of these (e.g. 'Max Consecutive Bookings Reached').
	 */
	statusMessage: string;
	/** Danish human-readable text. Byte-identical invariant; client fallback. */
	message: string;
}

/**
 * Create an h3 error carrying a stable error key for client-side
 * localization. Server-side rendering of these keys happens only for push
 * notifications (`server/utils/i18n.server.ts`); HTTP responses themselves
 * stay language-neutral.
 *
 * Signature per the implementation brief: `createLocalizedError(key, params?, opts)`.
 */
export const createLocalizedError = (
	key: ErrorKey,
	params: ErrorParams = {},
	opts: LocalizedErrorOptions,
) =>
	createError({
		statusCode: opts.statusCode,
		statusMessage: opts.statusMessage,
		message: opts.message,
		data: {
			key: key,
			params: params,
		},
	});

/**
 * The locale a server-side consumer (push rendering) renders for.
 */
export type ServerLocale = LocaleCode;
