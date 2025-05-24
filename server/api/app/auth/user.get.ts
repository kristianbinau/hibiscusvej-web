export default defineEventHandler(async (event) => {
	return await useAuthUser(event);
});
