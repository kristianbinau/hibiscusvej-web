import { z } from 'zod/v4';
import { logAdminAction } from '~~/server/utils/log';

const LOG_MODULE = 'Api/Admin/Repremands/[id]/Patch';

const routeSchema = z.object({
	id: z.coerce.number(),
});

const bodySchema = z.object({
	type: z.enum(['ban', 'warning']).optional(),
	reason: z.string().optional(),
	expiresAt: z.string().date().optional(),
});

export default defineEventHandler(async (event) => {
	const authAdmin = await useAuthAdmin(event);
	const params = await getValidatedRouterParams(event, (data) =>
		routeSchema.parse(data),
	);
	const body = await readValidatedBody(event, (data) => bodySchema.parse(data));

	const id = params.id;

	const userRepremand = await useDrizzle()
		.select()
		.from(tables.userRepremands)
		.where(eq(tables.userRepremands.id, id))
		.get();

	if (!userRepremand) {
		throw createError({
			statusCode: 404,
			statusMessage: 'Not Found',
		});
	}

	await assertCanActOnTarget(authAdmin, userRepremand.userId);

	try {
		const now = new Date();

		await useDrizzle()
			.update(tables.userRepremands)
			.set({
				type: body.type,
				reason: body.reason,
				expiresAt: body.expiresAt ? new Date(body.expiresAt) : undefined,
				updatedAt: now,
			})
			.where(and(eq(tables.userRepremands.id, id)));
	} catch (error) {
		void logError(LOG_MODULE, `Failed Update of UserRepremandId: ${id}`, error);
		throw createError({
			statusCode: 500,
			statusMessage: 'Internal Server Error',
		});
	}

	try {
		await logAdminAction({
			logModule: LOG_MODULE,
			adminAction: 'UpdateRepremand',
			adminActionParam: String(id),
			adminUserId: authAdmin.user.id,
		});
	} catch (error) {
		void logError(LOG_MODULE, 'Failed Audit Log', error);
	}

	return true;
});
