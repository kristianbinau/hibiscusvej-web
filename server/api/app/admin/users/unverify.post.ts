import { z } from 'zod/v4';

const LOG_MODULE = 'Api/Admin/Users/UnVerify';

const bodySchema = z.object({
	userIds: z.array(z.number()),
});

const ADMIN_ACTION = 'UnVerifyUsers';

export default defineEventHandler(async (event) => {
	const authAdmin = await useAuthAdmin(event);
	const body = await readValidatedBody(event, bodySchema.parse);

	const userIds = body.userIds;
	const now = new Date();

	try {
		await useDrizzle()
			.update(tables.users)
			.set({
				verifiedAt: null,
				verifiedByUserId: null,
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

	return true;
});
