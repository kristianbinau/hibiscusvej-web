import { z } from 'zod';

const LOG_MODULE = 'Api/Admin/Users/Verify';

const schema = z.object({
	userIds: z.array(z.number()),
});

const ADMIN_ACTION = 'VerifyUsers';

export default defineEventHandler(async (event) => {
	const authAdmin = await useAuthAdmin(event);
	const body = await readValidatedBody(event, schema.parse);

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
			title: 'Konto verificeret',
			body: 'Bestyrelsen har verificeret din bruger, du kan nu booke fælleslokalet!',
		}),
		options: {
			topic: 'verification_update',
			ttl: 86400,
			urgency: 'normal' as const,
		},
	} as WebPushMessage;

	await sendPushNotificationToUserIds(userIds, pushMessage);

	return true;
});
