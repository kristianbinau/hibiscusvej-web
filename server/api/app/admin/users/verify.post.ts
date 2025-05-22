import {
	differenceInHours,
	differenceInMinutes,
	formatDuration,
} from 'date-fns';
import { da } from 'date-fns/locale';

import { z } from 'zod/v4';

const LOG_MODULE = 'Api/Admin/Users/Verify';

const bodySchema = z.object({
	userIds: z.array(z.number()),
});

const ADMIN_ACTION = 'VerifyUsers';

export default defineEventHandler(async (event) => {
	const authAdmin = await useAuthAdmin(event);
	const body = await readValidatedBody(event, bodySchema.parse);

	const userIds = body.userIds;
	const now = new Date();

	try {
		await useDrizzle()
			.update(tables.users)
			.set({
				verifiedAt: now,
				verifiedByUserId: authAdmin.user.id,
				updatedAt: now,
			})
			.where(inArray(tables.users.id, userIds));

		await useDrizzle()
			.insert(tables.adminLogs)
			.values({
				userId: authAdmin.user.id,
				action: `${ADMIN_ACTION}: ${userIds.join(', ')}`,
				createdAt: now,
			});
	} catch (error) {
		logError(LOG_MODULE, 'Failed Update', error);
		throw createError({
			statusCode: 500,
			statusMessage: 'Internal Server Error',
		});
	}

	/**
	 * Notify Users
	 */
	const pushMessage = {
		data: JSON.stringify({
			title: 'Konto verificeret!',
			options: {
				body: 'Bestyrelsen har verificeret din bruger, du kan nu booke fælleslokalet!',
				tag: 'verification_update',
				silent: true,
			},
		}),
		options: {
			topic: 'verification_update',
			ttl: 86400,
			urgency: 'normal' as const,
		},
	} as WebPushMessage;

	await sendPushNotificationToUserIds(userIds, pushMessage);

	/**
	 * Notify Admins
	 */
	try {
		const admins = await useDrizzle()
			.select()
			.from(tables.users)
			.where(eq(tables.users.admin, true))
			.all();
		const adminUserIds = admins.map((admin) => admin.id);

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

			const sinceText = formatDuration(
				{
					hours: hoursSinceCreation,
					minutes: minutesSinceCreation,
				},
				{ locale: da },
			);

			const newUser = hoursSinceCreation < 48;

			const topic = newUser
				? `admin_notify_new_user-${userId}`
				: `admin_notify_user_verification-${userId}`;
			const title = newUser ? 'Ny bruger!' : 'Bruger verificeret!';
			const body = newUser
				? `${verifiedByUserPerson.name} har verificeret #${userId}, der blev oprettet for ${sinceText} siden.`
				: `${verifiedByUserPerson.name} har verificeret #${userId}.`;

			const pushMessage = {
				data: JSON.stringify({
					title: title,
					options: {
						body: body,
						tag: topic,
						openLink: `/u/admin/users?userId=${userId}`,
						silent: true,
					},
				}),
				options: {
					topic: topic,
					ttl: 86400,
					urgency: 'normal' as const,
				},
			} as WebPushMessage;

			await sendPushNotificationToUserIds(adminUserIds, pushMessage);
		}
	} catch (error) {
		logError(LOG_MODULE, 'Failed Notify Admins', error);
	}

	return true;
});
