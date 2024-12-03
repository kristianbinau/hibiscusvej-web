export default defineNuxtRouteMiddleware(async (to, from) => {
	if ((await isAdmin()) === false) {
		return navigateTo('/u');
	}
});
