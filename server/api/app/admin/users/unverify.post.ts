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

	await assertCanActOnTargets(authAdmin, userIds);

	try {
		await useDrizzle()
			.update(tables.users)
			.set({
				verifiedAt: null,
				verifiedByUserId: null,
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

	return true;
});
