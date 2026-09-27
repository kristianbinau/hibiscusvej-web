export default defineNuxtRouteMiddleware(async (_to, _from) => {
	if ((await isSystemAdmin()) === false) {
		return navigateTo('/u/admin');
	}
});
