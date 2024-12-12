export default eventHandler(async (event) => {
	const authUser = await useAuthUser(event);

	// Get the user's data
	const user = await useDrizzle()
		.select()
		.from(tables.users)
		.where(
			and(
				eq(tables.users.id, authUser.user.id),
				isNull(tables.users.deletedAt),
			),
		)
		.get();

	if (!user) {
		throw createError({
			statusCode: 401,
			statusMessage: 'Unauthorized',
		});
	}

	return {
		auth: authUser,
		user: user,
	};
});
