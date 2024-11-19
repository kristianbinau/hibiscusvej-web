export default eventHandler(async (event) => {
	const authUser = await useAuthUser(event);

	// Delete refreshToken from UserSession table
	await useDrizzle()
		.delete(tables.userSessions)
		.where(eq(tables.userSessions.tokenFamily, authUser.session.family))
		.get();

	// Delete refreshToken cookie
	deleteCookie(event, 'REFRESH-TOKEN');

	return true;
});
