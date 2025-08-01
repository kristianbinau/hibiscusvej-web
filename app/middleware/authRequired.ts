export default defineNuxtRouteMiddleware(async (_to, _from) => {
	if ((await isAuthenticated()) === false) {
		return navigateTo('/auth/login');
	}
});
