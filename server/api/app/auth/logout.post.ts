import { z } from 'zod/v4';

const querySchema = z.object({
	everywhere: z.coerce.boolean().optional(),
});

export default eventHandler(async (event) => {
	const authUser = await useAuthUser(event);
	const query = await getValidatedQuery(event, querySchema.parse);

	const everywhere = query.everywhere ?? false;

	// Delete refreshToken from UserSession table
	if (everywhere) {
		const logins = await useDrizzle()
			.select()
			.from(tables.userLogins)
			.where(eq(tables.userLogins.userId, authUser.user.id))
			.all();

		const loginIds = logins.map((login) => login.id);

		await useDrizzle()
			.delete(tables.userSessions)
			.where(inArray(tables.userSessions.userLoginId, loginIds));
	} else {
		await useDrizzle()
			.delete(tables.userSessions)
			.where(eq(tables.userSessions.tokenFamily, authUser.session.family));
	}

	// Delete refreshToken cookie
	deleteCookie(event, REFRESH_COOKIE_NAME);

	return true;
});
