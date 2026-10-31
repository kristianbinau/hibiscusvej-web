import {
	differenceInHours,
	differenceInMinutes,
	formatDuration,
} from 'date-fns';
import { da, enUS } from 'date-fns/locale';

import { z } from 'zod/v4';
import { logAdminAction } from '~~/server/utils/log';
import {
	sendAdminNotification,
	sendVerifiedNotificationForUser,
} from '~~/server/utils/notification';

const LOG_MODULE = 'Api/Admin/Users/Verify';

const bodySchema = z.object({
	userIds: z.array(z.number()),
});

const ADMIN_ACTION = 'VerifyUsers';

export default defineEventHandler(async (event) => {
	const authAdmin = await useAuthAdmin(event);
	const body = await readValidatedBody(event, (data) => bodySchema.parse(data));

	const userIds = body.userIds;
	const now = new Date();

	await assertCanActOnTargets(authAdmin, userIds);

	try {
		await useDrizzle()
			.update(tables.users)
			.set({
				verifiedAt: now,
				verifiedByUserId: authAdmin.user.id,
				updatedAt: now,
			})
			.where(
				and(
					inArray(tables.users.id, userIds),
					authAdmin.user.systemAdmin
						? sql`true`
						: eq(tables.users.systemAdmin, false),
				),
			);
	} catch (error) {
		void logError(LOG_MODULE, 'Failed Update', error);
		throw createError({
			statusCode: 500,
			statusMessage: 'Internal Server Error',
		});
	}

	try {
		await logAdminAction({
			logModule: LOG_MODULE,
			adminAction: ADMIN_ACTION,
			adminActionParam: `${userIds.join(', ')}`,
			adminUserId: authAdmin.user.id,
		});
	} catch (error) {
		void logError(LOG_MODULE, 'Failed Audit Log', error);
	}

	/**
	 * Notify Users
	 */

	for (const userId of userIds) {
		await sendVerifiedNotificationForUser({
			logModule: LOG_MODULE,
			userId: userId,
			title: { key: 'push.user.accountVerified' },
			body: { key: 'push.user.accountVerifiedBody' },
		});
	}

	/**
	 * Notify Admins
	 */
	try {
		const verifiedByUserPerson = await useDrizzle()
			.select()
			.from(tables.userPersons)
			.where(eq(tables.userPersons.userId, authAdmin.user.id))
			.orderBy(asc(tables.userPersons.id))
			.get();

		if (!verifiedByUserPerson) {
			throw new Error('verifiedByUserPerson not found');
		}

		for (const userId of userIds) {
			const verifiedUser = await useDrizzle()
				.select()
				.from(tables.users)
				.where(eq(tables.users.id, userId))
				.get();

			if (!verifiedUser) {
				throw new Error('verifiedUser not found');
			}

			const hoursSinceCreation = differenceInHours(now, verifiedUser.createdAt);
			const minutesSinceCreation =
				hoursSinceCreation === 0
					? differenceInMinutes(now, verifiedUser.createdAt)
					: 0;

			const newUser = hoursSinceCreation < 48;

			await sendAdminNotification({
				logModule: LOG_MODULE,
				topic: newUser
					? `admin_notify_new_user-${userId}`
					: `admin_notify_user_verification-${userId}`,
				link: `/u/admin/users?userId=${userId}`,
				linkField: 'openLink',
				title: {
					key: newUser ? 'push.admin.newUser' : 'push.admin.userVerified',
				},
				body: {
					key: newUser
						? 'push.admin.verifiedBodyRecent'
						: 'push.admin.verifiedBody',
					// The duration fragment is rendered per recipient language;
					// date-fns durations have no locale-neutral representation.
					params: (locale) => ({
						admin: verifiedByUserPerson.name,
						userId: userId,
						duration: formatDuration(
							{
								hours: hoursSinceCreation,
								minutes: minutesSinceCreation,
							},
							{ locale: locale === 'en' ? enUS : da },
						),
					}),
				},
			});
		}
	} catch (error) {
		void logError(LOG_MODULE, 'Failed Notify Admins', error);
	}

	return true;
});
