import { z } from 'zod/v4';
import { logAdminAction } from '~~/server/utils/log';

const LOG_MODULE = 'Api/SystemAdmin/Users/[id]/Role';

const routeSchema = z.object({
	id: z.coerce.number(),
});

const bodySchema = z.object({
	admin: z.boolean(),
	currentSessionPassword: z.string(),
});

export default defineEventHandler(async (event) => {
	const params = await getValidatedRouterParams(event, (data) =>
		routeSchema.parse(data),
	);
	const body = await readValidatedBody(event, (data) => bodySchema.parse(data));
	const authSystemAdmin = await useAuthValidatedSystemAdmin(
		event,
		body.currentSessionPassword,
	);

	const userId = params.id;

	if (userId === authSystemAdmin.user.id) {
		throw createError({
			statusCode: 403,
			statusMessage: 'Forbidden',
		});
	}

	const targetUser = await useDrizzle()
		.select()
		.from(tables.users)
		.where(eq(tables.users.id, userId))
		.get();

	if (!targetUser) {
		throw createError({
			statusCode: 404,
			statusMessage: 'Not Found',
		});
	}

	if (targetUser.systemAdmin && !body.admin) {
		throw createError({
			statusCode: 403,
			statusMessage: 'Forbidden',
		});
	}

	const now = new Date();

	try {
		if (!body.admin) {
			const loginIds = (
				await useDrizzle()
					.select({ id: tables.userLogins.id })
					.from(tables.userLogins)
					.where(eq(tables.userLogins.userId, userId))
					.all()
			).map((l) => l.id);

			await useDrizzle()
				.delete(tables.userSessions)
				.where(inArray(tables.userSessions.userLoginId, loginIds));
		}

		await useDrizzle()
			.update(tables.users)
			.set({
				admin: body.admin,
				updatedAt: now,
			})
			.where(eq(tables.users.id, userId));
	} catch (error) {
		void logError(LOG_MODULE, `Failed Role Update of UserId: ${userId}`, error);
		throw createError({
			statusCode: 500,
			statusMessage: 'Internal Server Error',
		});
	}

	try {
		await logAdminAction({
			logModule: LOG_MODULE,
			adminAction: body.admin ? 'PromoteAdmin' : 'DemoteAdmin',
			adminActionParam: String(userId),
			adminUserId: authSystemAdmin.user.id,
		});
	} catch (error) {
		void logError(LOG_MODULE, 'Failed Audit Log', error);
	}

	return true;
});
