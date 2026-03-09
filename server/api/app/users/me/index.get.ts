export default defineEventHandler(async (event) => {
	const authUser = await useAuthUser(event);

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

	const activeRepremands = await useDrizzle()
		.select()
		.from(tables.userRepremands)
		.where(
			and(
				eq(tables.userRepremands.userId, user.id),
				or(
					isNull(tables.userRepremands.expiresAt),
					gte(tables.userRepremands.expiresAt, new Date()),
				),
			),
		)
		.all();

	return {
		auth: authUser,
		user: user,
		activeRepremands: activeRepremands,
	};
});
