export default eventHandler(async (event) => {
	return await useAuthUser(event);
});
