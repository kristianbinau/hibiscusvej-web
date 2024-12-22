export default eventHandler(async (event) => {
	const authUser = await useAuthUser(event);

	const persons = await useDrizzle()
		.select()
		.from(tables.userPersons)
		.where(eq(tables.userPersons.userId, authUser.user.id))
		.all();

	return {
		persons: persons,
	};
});
