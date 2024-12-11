export default defineEventHandler(async (event) => {
	await useAuthAdmin(event);

	const users = await useDrizzle().select().from(tables.users).all();

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
		.all();

	const userSessions = await useDrizzle()
		.select({
			id: tables.userSessions.id,
			userLoginId: tables.userSessions.userLoginId,
			expiredAt: tables.userSessions.expiredAt,
			createdAt: tables.userSessions.createdAt,
			updatedAt: tables.userSessions.updatedAt,
		})
		.from(tables.userSessions)
		.all();

	const userPersons = await useDrizzle()
		.select()
		.from(tables.userPersons)
		.all();

	return {
		users: users,
		userLogins: userLogins,
		userSessions: userSessions,
		userPersons: userPersons,
	};
});
