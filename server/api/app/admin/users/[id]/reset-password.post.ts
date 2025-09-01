import { z } from 'zod/v4';

const LOG_MODULE = 'Api/Admin/Users/[id]/ResetPassword';

const routeSchema = z.object({
	id: z.coerce.number(),
});

const bodySchema = z.object({
	loginId: z.number(),
	currentSessionPassword: z.string(),
});

const ADMIN_ACTION = 'ResetPassword';

export default defineEventHandler(async (event) => {
	const params = await getValidatedRouterParams(event, (data) =>
		routeSchema.parse(data),
	);
	const body = await readValidatedBody(event, (data) => bodySchema.parse(data));
	const authAdmin = await useAuthValidatedAdmin(
		event,
		body.currentSessionPassword,
	);

	const now = new Date();
	const userId = params.id;
	const loginId = body.loginId;

	let userLogin = await useDrizzle()
		.select()
		.from(tables.userLogins)
		.where(eq(tables.userLogins.id, loginId))
		.get();

	if (!userLogin) {
		throw createError({
			statusCode: 404,
			statusMessage: 'Not Found',
		});
	}

	try {
		const tempPassword = randomPassword();
		const hashedTempPassword = await hashPassword(
			await clientHashPassword(tempPassword),
		);

		userLogin = await useDrizzle()
			.update(tables.userLogins)
			.set({
				password: hashedTempPassword,
				singleUse: true,
				updatedAt: now,
			})
			.where(eq(tables.userLogins.id, loginId))
			.returning()
			.get();

		if (!userLogin) {
			throw new Error('UserLogin deleted between select and update');
		}

		try {
			await useDrizzle()
				.insert(tables.adminLogs)
				.values({
					userId: authAdmin.user.id,
					action: `${ADMIN_ACTION}: ${userId}`,
					createdAt: now,
				});
		} catch (error) {
			void logError(LOG_MODULE, 'Failed AdminLog', error);
			throw createError({
				statusCode: 500,
				statusMessage: 'Internal Server Error',
			});
		}

		return {
			loginId: loginId,
			newPassword: tempPassword,
		};
	} catch (error) {
		void logError(LOG_MODULE, 'Failed Update', error);
		throw createError({
			statusCode: 500,
			statusMessage: 'Internal Server Error',
		});
	}
});
