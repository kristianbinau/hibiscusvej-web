export default defineNuxtRouteMiddleware(async (_to, _from) => {
	if ((await isAdmin()) === false) {
		return navigateTo('/u');
	}
});
