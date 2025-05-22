import { z } from 'zod/v4';

const LOG_MODULE = 'Api/Push/Unsubscribe';

const pushSubscriptionJSON = z.custom<PushSubscriptionJSON>((val) => {
	return (
		typeof val.endpoint === 'string' &&
		typeof val.keys === 'object' &&
		typeof val.keys.auth === 'string' &&
		typeof val.keys.p256dh === 'string'
	);
});

const querySchema = z.object({
	everywhere: z.coerce.boolean().optional(),
});

const bodySchema = z
	.object({
		subscription: pushSubscriptionJSON,
	})
	.optional();

export default defineEventHandler(async (event) => {
	const authUser = await useAuthUser(event);
	const query = await getValidatedQuery(event, querySchema.parse);
	const body = await readValidatedBody(event, bodySchema.parse);

	const everywhere = query.everywhere ?? false;
	const pushSubscription = body?.subscription ?? null;

	// If the user doesn't provide a subscription or everywhere flag, return bad request
	if (!pushSubscription && !everywhere) {
		throw createError({
			statusCode: 400,
			statusMessage: 'Bad Request',
		});
	}

	// If the user wants to unsubscribe from all subscriptions, delete all of them and return success
	if (everywhere) {
		try {
			await useDrizzle()
				.delete(tables.userSubscriptions)
				.where(eq(tables.userSubscriptions.userId, authUser.user.id));

			return true;
		} catch (error) {
			logError(LOG_MODULE, 'Failed Delete Everywhere', error);
			throw createError({
				statusCode: 500,
				statusMessage: 'Internal Server Error',
			});
		}
	}

	const subscription = await useDrizzle()
		.select()
		.from(tables.userSubscriptions)
		.where(
			and(
				eq(tables.userSubscriptions.userId, authUser.user.id),
				eq(tables.userSubscriptions.subscriptionObject, pushSubscription),
			),
		)
		.get();

	// If the subscription doesn't exist, return success
	if (!subscription) {
		return true;
	}

	try {
		await useDrizzle()
			.delete(tables.userSubscriptions)
			.where(
				and(
					eq(tables.userSubscriptions.userId, authUser.user.id),
					eq(tables.userSubscriptions.subscriptionObject, pushSubscription),
				),
			);

		return true;
	} catch (error) {
		logError(LOG_MODULE, 'Failed Delete', error);
		throw createError({
			statusCode: 500,
			statusMessage: 'Internal Server Error',
		});
	}
});
