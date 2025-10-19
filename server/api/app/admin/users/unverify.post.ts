import { z } from 'zod/v4';
import { logAdminAction } from '~~/server/utils/log';

const LOG_MODULE = 'Api/Admin/Users/UnVerify';

const bodySchema = z.object({
	userIds: z.array(z.number()),
});

const ADMIN_ACTION = 'UnVerifyUsers';

export default defineEventHandler(async (event) => {
	const authAdmin = await useAuthAdmin(event);
	const body = await readValidatedBody(event, (data) => bodySchema.parse(data));

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
	} catch (error) {
		void logError(LOG_MODULE, 'Failed Update', error);
		throw createError({
			statusCode: 500,
			statusMessage: 'Internal Server Error',
		});
	}

	await logAdminAction({
		logModule: LOG_MODULE,
		adminAction: ADMIN_ACTION,
		adminActionParam: `${userIds.join(', ')}`,
		adminUserId: authAdmin.user.id,
	});

	return true;
});
