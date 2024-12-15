import { z } from 'zod';

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
		throw createError({
			statusCode: 500,
			statusMessage: 'Internal Server Error',
		});
	}

	return true;
});
