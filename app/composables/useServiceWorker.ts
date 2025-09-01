import { UnsupportedBrowserModal } from '#components';

// @ts-nocheck
export const useServiceWorker = () => {
	const route = useRoute();
	const overlay = useOverlay();

	const modal = overlay.create(UnsupportedBrowserModal);

	const serviceWorkerSupported = ref<boolean>(true);

	watch(
		[route, serviceWorkerSupported],
		() => {
			// If we are on an auth route and service workers are not supported, show the modal
			if (route.path.includes('/auth/') && !serviceWorkerSupported.value) {
				void modal.open();
				return;
			}

			modal.close();
		},
		{ immediate: true },
	);

	/**
	 * @see https://stackoverflow.com/a/67612740
	 */
	async function registerServiceWorker(
		tryOnce = false,
	): Promise<void | ServiceWorker> {
		if (!('serviceWorker' in navigator)) {
			serviceWorkerSupported.value = false;
			console.error('ServiceWorker not supported');
			return;
		}

		// @ts-ignore
		const url = new URL(`/service-worker.js`, location).toString();
		//console.info('Registering worker');
		const registration = await navigator.serviceWorker.register(url, {
			scope: '/',
		});

		const registeredWorker =
			registration.active || registration.waiting || registration.installing;
		//console.info('Registered worker:', registeredWorker);
		if (registeredWorker?.scriptURL != url) {
			console.info(
				'[ServiceWorker] Old URL:',
				registeredWorker?.scriptURL || 'none',
				'updating to:',
				url,
			);
			await registration.update();
			//console.info('Updated worker');
		}

		//console.info('Waiting for ready worker');
		let serviceReg = await navigator.serviceWorker.ready;
		//console.info('Ready registration:', serviceReg);

		if (!navigator.serviceWorker.controller) {
			//console.info('Worker isn’t controlling, re-register');
			try {
				const reg = await navigator.serviceWorker.getRegistration('/');
				if (reg) {
					//console.info('Unregistering worker');
					await reg.unregister();
				}

				//console.info('Successfully unregistered, trying registration again');
				return registerServiceWorker();
			} catch (err) {
				console.error(
					`ServiceWorker failed to re-register after hard-refresh, reloading the page!`,
					err,
				);
				location.reload();
				return;
			}
		}

		let serviceWorker =
			serviceReg.active || serviceReg.waiting || serviceReg.installing;
		if (!serviceWorker) {
			//console.info('No worker on registration, getting registration again');
			const navigatorRegistration =
				await navigator.serviceWorker.getRegistration('/');
			if (navigatorRegistration) {
				serviceReg = navigatorRegistration;
			}
			serviceWorker =
				serviceReg.active || serviceReg.waiting || serviceReg.installing;
		}

		if (!serviceWorker) {
			//console.info('No worker on registration, waiting 50ms');
			await sleep(50); // adjustable or skippable, have a play around
		}

		serviceWorker =
			serviceReg.active || serviceReg.waiting || serviceReg.installing;
		if (!serviceWorker) {
			serviceWorkerSupported.value = false;
			console.error('ServiceWorker still not found, after waiting on .ready');
			return;
		}

		if (serviceWorker.state == 'redundant') {
			//console.info('Worker is redundant, trying again');
			return registerServiceWorker();
		}

		if (serviceWorker.state != 'activated') {
			//console.info('Worker IS controlling, but not active yet, waiting on event. state=', serviceWorker.state);
			try {
				// timeout is adjustable, but you do want one in case the statechange
				// doesn't fire / with the wrong state because it gets queued,
				// see ServiceWorker.onstatechange MDN docs.
				await timeout(
					100,
					new Promise<void>((resolve) => {
						serviceWorker.addEventListener('statechange', (e) => {
							if ((e.target as ServiceWorker).state == 'activated') resolve();
						});
					}),
				);
			} catch (err) {
				if (err instanceof TimeoutError) {
					// @ts-ignore
					if (serviceWorker.state != 'activated') {
						if (tryOnce) {
							//console.info('Worker is still not active. state=', serviceWorker.state);
							serviceWorkerSupported.value = false;
							console.error('ServiceWorker failed to activate');
							return;
						} else {
							//console.info('Worker is still not active, retrying once');
							return registerServiceWorker(true);
						}
					}
				} else {
					// should be unreachable
					serviceWorkerSupported.value = false;
					console.error('ServiceWorker failed unexpectedly');
					return;
				}
			}
		}

		//console.info('Worker is controlling and active, we’re good folks!');
		return serviceWorker;
	}

	class TimeoutError extends Error {}

	/**
	 * Run promise but reject after some timeout.
	 */
	function timeout<T>(ms: number, promise: Promise<T>): Promise<T> {
		return new Promise((resolve, reject) => {
			const timer = setTimeout(() => {
				reject(new TimeoutError());
			}, ms);

			promise.then(
				(result) => {
					clearTimeout(timer);
					resolve(result);
				},
				(error) => {
					clearTimeout(timer);
					reject(error);
				},
			);
		});
	}

	/**
	 * Sleep for X milliseconds.
	 */
	function sleep(ms: number): Promise<void> {
		return new Promise((resolve) => setTimeout(resolve, ms));
	}

	void registerServiceWorker();

	return { serviceWorkerSupported };
};
