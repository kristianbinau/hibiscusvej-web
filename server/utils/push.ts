import {
	buildPushPayload,
	type PushMessage,
	type PushSubscription,
} from '@block65/webcrypto-web-push';

const LOG_MODULE = 'Utils/Push';

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
		void logError(
			LOG_MODULE,
			'Failed to send push notification to userIds',
			error,
		);
	}
};

export const sendPushNotification = async (
	subscription: PushSubscription,
	message: PushMessage,
) => {
	try {
		const payload = (await buildPushPayload(
			message,
			subscription,
			getVapid(),
		)) as RequestInit;

		const res = await fetch(subscription.endpoint, payload);

		// https://pushpad.xyz/blog/web-push-errors-explained-with-http-status-codes
		if (res.status === 410) {
			await deleteSubscription(subscription);
		}

		// TODO: Better handling of rest of errors

		if (res.status < 200 || res.status >= 300) {
			return false;
		}

		return true;
	} catch (error) {
		void logError(LOG_MODULE, 'Failed to send push notification', error);
		return false;
	}
};

const deleteSubscription = async (subscription: PushSubscription) => {
	await useDrizzle()
		.delete(tables.userSubscriptions)
		.where(eq(tables.userSubscriptions.subscriptionObject, subscription));

	// TODO: Also delete the subscription from the browser
};

const getVapid = () => {
	const runtimeConfig = useRuntimeConfig();

	return {
		subject:
			process.env.NUXT_PUBLIC_VAPID_SUBJECT ||
			runtimeConfig.public.vapidSubject,
		publicKey:
			process.env.NUXT_PUBLIC_VAPID_PUBLIC_KEY ||
			runtimeConfig.public.vapidPublicKey,
		privateKey:
			process.env.NUXT_VAPID_PRIVATE_KEY || runtimeConfig.vapidPrivateKey,
	};
};
