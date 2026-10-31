import { describe, test, expect } from 'vitest';
import { tFor } from '../../server/utils/i18n.server';

/**
 * Server-side i18n rendering test (implementation brief §9).
 *
 * Push notifications are rendered server-side per recipient language from
 * the SAME YAML catalog the client uses. This exercises `tFor` for both
 * locales with the param shapes the notification refactor sends.
 *
 * Date params are interpolated as raw ISO strings here BY DESIGN: the
 * server never pre-formats dates, the client formats per locale
 * (`app/utils/apiError.ts` / locked decision §3.9).
 */
describe('server i18n rendering', () => {
	test('renders push keys for both locales', () => {
		expect(tFor('da')('push.admin.newUser')).toBe('Ny bruger!');
		expect(tFor('en')('push.admin.newUser')).toBe('New user!');

		expect(tFor('da')('push.admin.newUserCreatedBody', { userId: 42 })).toBe(
			'#42 er blevet oprettet, og venter på verificering.',
		);
		expect(tFor('en')('push.admin.newUserCreatedBody', { userId: 42 })).toBe(
			'#42 has been created and is awaiting verification.',
		);

		expect(tFor('da')('push.user.accountVerifiedBody')).toBe(
			'Bestyrelsen har verificeret din bruger, du kan nu booke fælleslokalet!',
		);
		expect(tFor('en')('push.user.accountVerifiedBody')).toBe(
			'The board has verified your account, and you can now book the communal room!',
		);
	});

	test('renders the ban-until error key with an ISO date param', () => {
		const date = '2026-03-01T10:00:00.000Z';

		expect(tFor('da')('errors.booking.bannedUntil', { date })).toBe(
			'Din bruger er midlertidigt udelukket fra at oprette booking indtil 2026-03-01T10:00:00.000Z.',
		);
		expect(tFor('en')('errors.booking.bannedUntil', { date })).toBe(
			'Your user is temporarily blocked from creating bookings until 2026-03-01T10:00:00.000Z.',
		);
	});

	test('renders the limit error keys with count params', () => {
		expect(tFor('da')('errors.booking.maxWeeklyReached', { count: 3 })).toBe(
			'Du kan maksimalt have 3 bookinger hver 7. dag.',
		);
		expect(tFor('en')('errors.booking.maxWeeklyReached', { count: 3 })).toBe(
			'You can have at most 3 bookings every 7 days.',
		);

		expect(tFor('da')('errors.booking.noConsecutiveAllowed')).toBe(
			'Du kan ikke have sammenhængende bookinger.',
		);
		expect(tFor('en')('errors.booking.noConsecutiveAllowed')).toBe(
			'You cannot have consecutive bookings.',
		);
	});
});
