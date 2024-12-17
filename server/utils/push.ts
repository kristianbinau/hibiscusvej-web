import {
	buildPushPayload,
	type PushMessage,
	type PushSubscription,
} from '@block65/webcrypto-web-push';

export type {
	PushMessage as WebPushMessage,
	PushSubscription as WebPushSubscription,
};

export const sendPushNotificationToUserIds = async (
	userIds: number[],
	message: PushMessage,
) => {
	try {
		const subscriptions = await useDrizzle()
			.select()
			.from(tables.userSubscriptions)
			.where(inArray(tables.userSubscriptions.userId, userIds))
			.all();

		for (const subscription of subscriptions) {
			const pushSubscription =
				subscription.subscriptionObject as PushSubscription;

			await sendPushNotification(pushSubscription, message);
		}
	} catch (error) {
		// Do nothing
	}
};

export const sendPushNotification = async (
	subscription: PushSubscription,
	message: PushMessage,
) => {
	try {
		const payload = await buildPushPayload(message, subscription, getVapid());

		const res = await fetch(subscription.endpoint, payload);

		// https://pushpad.xyz/blog/web-push-errors-explained-with-http-status-codes
		if (res.status === 410) {
			await deleteSubscription(subscription);
		}

		if (res.status < 200 || res.status >= 300) {
			return false;
		}

		return true;
	} catch (error) {
		return false;
	}
};

const deleteSubscription = async (subscription: PushSubscription) => {
	await useDrizzle()
		.delete(tables.userSubscriptions)
		.where(eq(tables.userSubscriptions.subscriptionObject, subscription));
};

const getVapid = () => {
	const runtimeConfig = useRuntimeConfig();

	return {
		subject: runtimeConfig.public.vapidSubject,
		publicKey: runtimeConfig.public.vapidPublicKey,
		privateKey: runtimeConfig.vapidPrivateKey,
	};
};
