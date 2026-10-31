export default defineNuxtRouteMiddleware(async (_to, _from) => {
	if ((await isAdmin()) === false) {
		// Send the visitor to the app home in the active locale.
		const localePath = useLocalePath();
		return navigateTo(localePath('/u'));
	}
});
