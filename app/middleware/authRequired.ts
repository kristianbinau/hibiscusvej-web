export default defineNuxtRouteMiddleware(async (_to, _from) => {
	if ((await isAuthenticated()) === false) {
		// Send the visitor to the login page in the active locale.
		const localePath = useLocalePath();
		return navigateTo(localePath('/auth/login'));
	}
});
