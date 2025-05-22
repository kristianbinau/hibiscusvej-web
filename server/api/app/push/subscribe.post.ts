import { z } from 'zod/v4';

const LOG_MODULE = 'Api/Push/Subscribe';

const pushSubscriptionJSON = z.custom<PushSubscriptionJSON>((val) => {
	return (
		typeof val.endpoint === 'string' &&
		typeof val.keys === 'object' &&
		typeof val.keys.auth === 'string' &&
		typeof val.keys.p256dh === 'string'
	);
});

const bodySchema = z.object({
	subscription: pushSubscriptionJSON,
});

export default defineEventHandler(async (event) => {
	const authUser = await useAuthUser(event);
	const body = await readValidatedBody(event, bodySchema.parse);

	const pushSubscription = body.subscription;

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

	// If the subscription already exists, return true
	if (subscription) {
		setResponseStatus(event, 200);
		return true;
	}

	try {
		await useDrizzle()
			.insert(tables.userSubscriptions)
			.values({
				userId: authUser.user.id,
				subscriptionObject: pushSubscription,
				createdAt: new Date(),
			})
			.returning()
			.get();
	} catch (error) {
		logError(LOG_MODULE, 'Failed Insert', error);
		throw createError({
			statusCode: 500,
			statusMessage: 'Internal Server Error',
		});
	}

	setResponseStatus(event, 201);
	return true;
});
