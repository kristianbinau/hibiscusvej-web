/**
 * WEB-PUSH NOTIFICATIONS
 *
 * Notification texts travel as catalog keys (`push.admin.*` / `push.user.*`)
 * plus interpolation params — never pre-rendered strings. Each recipient's
 * language preference (`userSettings`, key `language`) decides the rendering
 * (locked decision §3.3): user pushes render for the recipient, and admin
 * fan-outs group recipients by language and send one push per group.
 * A missing preference falls back to Danish.
 *
 * Push payload `link` values stay unprefixed — the locale middleware
 * resolves them per recipient.
 */
import { DEFAULT_LOCALE, USER_SETTINGS_LANGUAGE_KEY } from '#shared/constants';
import type { LocaleCode } from '#shared/constants';
import {
	normalizeLocale,
	resolveUserLocale,
	tFor,
} from '~~/server/utils/i18n.server';

/**
 * A localized push text: a catalog key plus interpolation params.
 *
 * `params` may be a function of the recipient's locale for fragments that
 * must be rendered per language (e.g. a date-fns `formatDuration` text,
 * which has no locale-neutral representation).
 */
export interface PushLocalizedMessage {
	key: string;
	params?:
		| Record<string, unknown>
		| ((locale: LocaleCode) => Record<string, unknown>);
}

/**
 * Which payload field carries the notification link. The service worker's
 * click handler navigates via `openLink`; `link` only focus-matches open
 * windows. Existing payloads keep their historical field.
 */
type PushLinkField = 'link' | 'openLink';

interface PushParams {
	logModule: string;
	topic: string;
	title: PushLocalizedMessage;
	body: PushLocalizedMessage;
	link: string;
	linkField?: PushLinkField;
}

interface AdminPushParams extends PushParams {
	/**
	 * The new-user push (register) selects ALL admin users, system admins
	 * included — its historical recipient set. Every other admin push
	 * excludes system admins.
	 */
	includeSystemAdmins?: boolean;
}

interface UserPushParams extends PushParams {
	userId: number;
	/**
	 * The recipient's language when the call site already knows it;
	 * otherwise it is read from the recipient's `userSettings`.
	 */
	language?: LocaleCode;
}

const resolveParams = (
	params: PushLocalizedMessage['params'],
	locale: LocaleCode,
): Record<string, unknown> =>
	typeof params === 'function' ? params(locale) : (params ?? {});

const renderPushMessage = (
	topic: string,
	title: string,
	body: string,
	link: string,
	linkField: PushLinkField,
): WebPushMessage => {
	const options = {
		body: body,
		tag: topic,
		...(linkField === 'openLink' ? { openLink: link } : { link: link }),
		silent: true,
	};

	return {
		data: JSON.stringify({
			title: title,
			options: options,
		}),
		options: {
			topic: topic,
			ttl: 86400,
			urgency: 'normal' as const,
		},
	} as WebPushMessage;
};

/**
 * Group the recipients by stored language preference (one batched
 * `userSettings` query); a missing preference falls back to Danish.
 */
const groupUserIdsByLocale = async (
	userIds: number[],
): Promise<Map<LocaleCode, number[]>> => {
	const groups = new Map<LocaleCode, number[]>();
	if (userIds.length === 0) {
		return groups;
	}

	const settings = await useDrizzle()
		.select({
			userId: tables.userSettings.userId,
			value: tables.userSettings.value,
		})
		.from(tables.userSettings)
		.where(
			and(
				inArray(tables.userSettings.userId, userIds),
				eq(tables.userSettings.key, USER_SETTINGS_LANGUAGE_KEY),
			),
		)
		.all();

	const localeByUserId = new Map(
		settings.map((setting) => [setting.userId, normalizeLocale(setting.value)]),
	);

	for (const userId of userIds) {
		const locale = localeByUserId.get(userId) ?? DEFAULT_LOCALE;
		const group = groups.get(locale);
		if (group) {
			group.push(userId);
		} else {
			groups.set(locale, [userId]);
		}
	}

	return groups;
};

/**
 * Render the payload per language group and send one push per group.
 */
const sendLocalizedPushToUserIds = async (
	logModule: string,
	userIds: number[],
	topic: string,
	title: PushLocalizedMessage,
	body: PushLocalizedMessage,
	link: string,
	linkField: PushLinkField,
) => {
	const groups = await groupUserIdsByLocale(userIds);

	for (const [locale, groupUserIds] of groups) {
		const t = tFor(locale);
		const pushMessage = renderPushMessage(
			topic,
			t(title.key, resolveParams(title.params, locale)),
			t(body.key, resolveParams(body.params, locale)),
			link,
			linkField,
		);

		await sendPushNotificationToUserIds(groupUserIds, pushMessage);
	}
};

const loadAdminUserIds = async (
	includeSystemAdmins: boolean,
): Promise<number[]> => {
	const admins = await useDrizzle()
		.select()
		.from(tables.users)
		.where(
			includeSystemAdmins
				? eq(tables.users.admin, true)
				: and(
						eq(tables.users.admin, true),
						eq(tables.users.systemAdmin, false),
					),
		)
		.all();

	return admins.map((admin) => admin.id);
};

/**
 * Send a localized admin-voice push: all admins (grouped by language,
 * one push per group).
 */
export const sendAdminNotification = async (params: AdminPushParams) => {
	const {
		logModule,
		topic,
		title,
		body,
		link,
		linkField = 'link',
		includeSystemAdmins = false,
	} = params;

	try {
		const adminUserIds = await loadAdminUserIds(includeSystemAdmins);

		await sendLocalizedPushToUserIds(
			logModule,
			adminUserIds,
			topic,
			title,
			body,
			link,
			linkField,
		);
	} catch (error) {
		void logError(logModule, 'Failed Notify Admins', error);
	}
};

/**
 * Send a localized user-voice push to a single recipient.
 */
export const sendUserNotification = async (params: UserPushParams) => {
	const {
		logModule,
		userId,
		topic,
		title,
		body,
		link,
		linkField = 'link',
		language,
	} = params;

	try {
		const locale = language
			? normalizeLocale(language)
			: await resolveUserLocale(userId);
		const t = tFor(locale);
		const pushMessage = renderPushMessage(
			topic,
			t(title.key, resolveParams(title.params, locale)),
			t(body.key, resolveParams(body.params, locale)),
			link,
			linkField,
		);

		await sendPushNotificationToUserIds([userId], pushMessage);
	} catch (error) {
		void logError(logModule, 'Failed Notify Users', error);
	}
};

/**
 * ADMIN NOTIFICATION - BOOKING REQUEST
 *
 * Send notification to all admins about a booking request
 */
export const sendBookingRequestNotificationForAdmin = async (params: {
	logModule: string;
	userId: number;
	bookingRequestId: number;
	title: PushLocalizedMessage;
	body: PushLocalizedMessage;
}) => {
	const { logModule, userId, bookingRequestId, title, body } = params;

	await sendAdminNotification({
		logModule,
		topic: `admin_book_req-${userId}-${bookingRequestId}`,
		title,
		body,
		link: '/u/admin/booking-requests',
	});
};

/**
 * USER NOTIFICATION - BOOKING REQUEST
 *
 * Send notification to a user about their booking request
 */
export const sendBookingRequestNotificationForUser = async (params: {
	logModule: string;
	userId: number;
	bookingRequestId: number;
	title: PushLocalizedMessage;
	body: PushLocalizedMessage;
}) => {
	const { logModule, userId, bookingRequestId, title, body } = params;

	await sendUserNotification({
		logModule,
		userId,
		topic: `user_book_req-${userId}-${bookingRequestId}`,
		title,
		body,
		link: '/u/communal/me-requests',
	});
};

/**
 * USER NOTIFICATION - ACCOUNT VERIFIED
 */
export const sendVerifiedNotificationForUser = async (params: {
	logModule: string;
	userId: number;
	title: PushLocalizedMessage;
	body: PushLocalizedMessage;
}) => {
	const { logModule, userId, title, body } = params;

	await sendUserNotification({
		logModule,
		userId,
		topic: `user_veri-${userId}`,
		title,
		body,
		link: '/u',
	});
};
