export const usePush = () => {
	const runtimeConfig = useRuntimeConfig();
	const toast = useToast();

	const vapidPublicKey = runtimeConfig.public.vapidPublicKey;

	const isSupported = ref(false);
	const hasPermission = ref(false);

	onMounted(() => {
		isSupported.value = 'serviceWorker' in navigator && 'PushManager' in window;
		hasPermission.value = Notification.permission === 'granted';
	});

	async function askPermission() {
		if (!isSupported.value) {
			return false;
		}

		const permission = await Notification.requestPermission();

		if (permission !== 'granted') {
			hasPermission.value = Notification.permission === 'granted';
			return false;
		}

		hasPermission.value = Notification.permission === 'granted';
		return true;
	}

	async function getServiceWorkerRegistration() {
		if (!isSupported.value) {
			return null;
		}

		const registration = await navigator.serviceWorker.ready;
		return registration;
	}

	async function subscribeUserToPush() {
		if (!isSupported.value || !hasPermission.value) {
			return false;
		}

		try {
			const registration = await getServiceWorkerRegistration();
			if (!registration) {
				return false;
			}

			const subscription = await registration.pushManager.subscribe({
				userVisibleOnly: true,
				applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
			});

			const res = await sendSubscriptionToServer(subscription);

			if (!res) {
				return false;
			}

			return true;
		} catch (error) {
			toast.add({
				title: 'Der opstod en fejl under oprettelse af notifikationer',
				actions: [
					{
						label: 'Genindlæs siden',
						click: () => {
							location.reload();
						},
					},
				],
			});
			return false;
		}
	}

	function urlBase64ToUint8Array(base64String: string) {
		var padding = '='.repeat((4 - (base64String.length % 4)) % 4);
		var base64 = (base64String + padding)
			.replace(/\-/g, '+')
			.replace(/_/g, '/');

		var rawData = window.atob(base64);
		var outputArray = new Uint8Array(rawData.length);

		for (var i = 0; i < rawData.length; ++i) {
			outputArray[i] = rawData.charCodeAt(i);
		}
		return outputArray;
	}

	async function sendSubscriptionToServer(subscription: PushSubscription) {
		try {
			const res = await $fetch('/api/push/subscribe', {
				method: 'POST',
				body: {
					subscription: subscription.toJSON(),
				},
			});

			if (!res) {
				toast.add({
					title: 'Oprettelse af notifikationer blev afvist',
				});
				return false;
			}

			toast.add({
				title: 'Notifikationer er nu aktiveret',
			});
			return true;
		} catch (error) {
			toast.add({
				title: 'Der opstod en fejl under oprettelse af notifikationer',
			});
			return false;
		}
	}

	return { isSupported, hasPermission, askPermission, subscribeUserToPush };
};
