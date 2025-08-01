export default defineNuxtRouteMiddleware(async (_to, _from) => {
	if ((await isAuthenticated()) === true) {
		return navigateTo('/u');
	}
});
