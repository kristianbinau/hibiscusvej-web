import { USER_SETTINGS_LANGUAGE_KEY } from '#shared/constants';

const LOG_MODULE = 'Api/Users/Me/Language/Get';

export default defineEventHandler(async (event) => {
	const authUser = await useAuthUser(event);

	try {
		const setting = await useDrizzle()
			.select()
			.from(tables.userSettings)
			.where(
				and(
					eq(tables.userSettings.userId, authUser.user.id),
					eq(tables.userSettings.key, USER_SETTINGS_LANGUAGE_KEY),
				),
			)
			.get();

		const language =
			setting?.value === 'en' || setting?.value === 'da' ? setting.value : 'da';

		return {
			language: language,
		};
	} catch (error) {
		void logError(LOG_MODULE, 'Failed Select', error);
		throw createError({
			statusCode: 500,
			statusMessage: 'Internal Server Error',
		});
	}
});
