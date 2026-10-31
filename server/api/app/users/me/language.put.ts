import { z } from 'zod/v4';
import { USER_SETTINGS_LANGUAGE_KEY } from '#shared/constants';

const LOG_MODULE = 'Api/Users/Me/Language/Put';

const bodySchema = z.object({
	language: z.enum(['da', 'en']),
});

export default defineEventHandler(async (event) => {
	const authUser = await useAuthUser(event);
	const body = await readValidatedBody(event, (data) => bodySchema.parse(data));

	try {
		await useDrizzle()
			.insert(tables.userSettings)
			.values({
				userId: authUser.user.id,
				key: USER_SETTINGS_LANGUAGE_KEY,
				value: body.language,
			})
			.onConflictDoUpdate({
				target: [tables.userSettings.key, tables.userSettings.userId],
				set: {
					value: body.language,
				},
			});
	} catch (error) {
		void logError(LOG_MODULE, 'Failed Upsert', error);
		throw createError({
			statusCode: 500,
			statusMessage: 'Internal Server Error',
		});
	}

	return {
		language: body.language,
	};
});
