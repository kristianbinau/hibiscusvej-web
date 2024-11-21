export default defineNuxtRouteMiddleware(async (to, from) => {
	if ((await isAuthenticated()) === true) {
		return navigateTo('/u');
	}
});
