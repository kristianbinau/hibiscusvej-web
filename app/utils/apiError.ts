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
 * Keys come from the stable contract in `server/utils/i18n-errors.ts`
 * (ERROR_KEYS); the booking endpoints are migrated to it by Phase 3, until
 * which the Danish `message` fallback keeps rendering exactly as before.
 *
 * `book.vue`'s statusMessage string-matching (which opens the booking
 * request modal) is deliberately kept on the raw `error.data.statusMessage`
 * values — that is an invariant of the error contract.
 */

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
		return t(key, serverErrorParams(error));
	}

	return serverErrorMessage(error);
};
