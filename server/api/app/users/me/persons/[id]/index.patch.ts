import { z } from 'zod/v4';

const LOG_MODULE = 'Api/Users/Me/Persons/[id]/Patch';

const routeSchema = z.object({
	id: z.coerce.number(),
});

const bodySchema = z.object({
	name: z.string().min(1).max(255).optional(),
	email: z.email().min(1).max(255).optional(),
	phone: z.string().min(1).max(255).optional(),
});

export default defineEventHandler(async (event) => {
	const authUser = await useAuthUser(event);
	const params = await getValidatedRouterParams(event, (data) =>
		routeSchema.parse(data),
	);
	const body = await readValidatedBody(event, (data) => bodySchema.parse(data));

	const id = params.id;

	const userPerson = await useDrizzle()
		.select()
		.from(tables.userPersons)
		.where(
			and(
				eq(tables.userPersons.userId, authUser.user.id),
				eq(tables.userPersons.id, id),
			),
		)
		.get();

	if (!userPerson) {
		throw createError({
			statusCode: 404,
			statusMessage: 'Not Found',
		});
	}

	try {
		const now = new Date();

		await useDrizzle()
			.update(tables.userPersons)
			.set({
				name: body.name,
				email: body.email,
				phone: body.phone,
				updatedAt: now,
			})
			.where(
				and(
					eq(tables.userPersons.userId, authUser.user.id),
					eq(tables.userPersons.id, id),
				),
			);
	} catch (error) {
		void logError(LOG_MODULE, `Failed Update of UserPersonId: ${id}`, error);
		throw createError({
			statusCode: 500,
			statusMessage: 'Internal Server Error',
		});
	}

	return true;
});
