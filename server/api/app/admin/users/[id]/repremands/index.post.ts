import { z } from 'zod/v4';

const LOG_MODULE = 'Api/Admin/Users/[id]/Repremands/Post';

const routeSchema = z.object({
	id: z.coerce.number(),
});

const bodySchema = z.object({
	type: z.enum(['ban', 'warning']),
	reason: z.string(),
	expiresAt: z.string().date(),
});

export default defineEventHandler(async (event) => {
	await useAuthAdmin(event);
	const params = await getValidatedRouterParams(event, (data) =>
		routeSchema.parse(data),
	);
	const body = await readValidatedBody(event, (data) => bodySchema.parse(data));

	const userId = params.id;
	const type = body.type;
	const reason = body.reason;
	const expiresAt = new Date(body.expiresAt);
	const now = new Date();

	let repremand;
	try {
		repremand = await useDrizzle()
			.insert(tables.userRepremands)
			.values({
				userId: userId,
				type: type,
				reason: reason,
				expiresAt: expiresAt,
				createdAt: now,
				updatedAt: now,
			})
			.returning()
			.get();
	} catch (error) {
		void logError(LOG_MODULE, 'Failed Insert', error);
		throw createError({
			statusCode: 500,
			statusMessage: 'Internal Server Error',
		});
	}

	return {
		repremand: repremand,
	};
});
