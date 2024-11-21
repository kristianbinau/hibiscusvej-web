export default defineNuxtRouteMiddleware(async (to, from) => {
	if ((await isAuthenticated()) === false) {
		return navigateTo('/auth/login');
	}
});
