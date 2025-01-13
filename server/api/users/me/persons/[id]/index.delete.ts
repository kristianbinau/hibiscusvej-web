import { z } from 'zod';

const LOG_MODULE = 'Api/Users/Me/Persons/[id]/Delete';

const routeSchema = z.object({
	id: z.coerce.number(),
});

export default eventHandler(async (event) => {
	const authUser = await useAuthUser(event);
	const params = await getValidatedRouterParams(event, routeSchema.parse);

	const id = params.id;

	// If User only has 1 person, return 400 Bad Request - Cannot delete last person
	const count = await useDrizzle().$count(
		tables.userPersons,
		eq(tables.userPersons.userId, authUser.user.id),
	);

	if (count <= 1) {
		throw createError({
			statusCode: 400,
			statusMessage: 'Cannot delete last person',
		});
	}

	try {
		await useDrizzle()
			.delete(tables.userPersons)
			.where(
				and(
					eq(tables.userPersons.userId, authUser.user.id),
					eq(tables.userPersons.id, id),
				),
			);
	} catch (error) {
		logError(LOG_MODULE, `Failed Delete of UserPersonId: ${id}`, error);
		throw createError({
			statusCode: 500,
			statusMessage: 'Internal Server Error',
		});
	}

	return true;
});
