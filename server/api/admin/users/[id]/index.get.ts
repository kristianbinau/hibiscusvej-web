import { z } from 'zod';

const schema = z.object({
	id: z.coerce.number(),
});

export default defineEventHandler(async (event) => {
	await useAuthAdmin(event);
	const params = await getValidatedRouterParams(event, schema.parse);

	const id = params.id;

	const user = await useDrizzle()
		.select()
		.from(tables.users)
		.where(and(isNull(tables.users.deletedAt), eq(tables.users.id, id)))
		.get();

	if (!user) {
		throw createError({
			statusCode: 404,
			statusMessage: 'Not Found',
		});
	}

	const userLogins = await useDrizzle()
		.select({
			id: tables.userLogins.id,
			userId: tables.userLogins.userId,
			email: tables.userLogins.email,
			singleUse: tables.userLogins.singleUse,
			createdAt: tables.userLogins.createdAt,
			updatedAt: tables.userLogins.updatedAt,
		})
		.from(tables.userLogins)
		.where(eq(tables.userLogins.userId, id))
		.all();

	const userLoginIds = userLogins.map((userLogin) => userLogin.id);

	const userSessions = await useDrizzle()
		.select({
			id: tables.userSessions.id,
			userLoginId: tables.userSessions.userLoginId,
			expiredAt: tables.userSessions.expiredAt,
			createdAt: tables.userSessions.createdAt,
			updatedAt: tables.userSessions.updatedAt,
		})
		.from(tables.userSessions)
		.where(inArray(tables.userSessions.userLoginId, userLoginIds))
		.all();

	const userPersons = await useDrizzle()
		.select()
		.from(tables.userPersons)
		.where(eq(tables.userPersons.userId, id))
		.all();

	return {
		...user,
		logins: userLogins,
		sessions: userSessions,
		persons: userPersons,
	};
});
