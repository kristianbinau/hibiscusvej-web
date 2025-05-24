export default defineEventHandler(async (event) => {
	const authUser = await useAuthUser(event);

	const logins = await useDrizzle()
		.select({
			id: tables.userLogins.id,
			userId: tables.userLogins.userId,
			email: tables.userLogins.email,
			singleUse: tables.userLogins.singleUse,
			createdAt: tables.userLogins.createdAt,
			updatedAt: tables.userLogins.updatedAt,
		})
		.from(tables.userLogins)
		.where(and(eq(tables.userLogins.userId, authUser.user.id)))
		.all();

	return {
		logins: logins,
	};
});
