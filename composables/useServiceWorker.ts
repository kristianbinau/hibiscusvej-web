// @ts-nocheck
export const useServiceWorker = () => {
	/**
	 * @param tryOnce
	 * @returns {Promise<void|ServiceWorker|*>}
	 *
	 * @see https://stackoverflow.com/a/67612740
	 */
	async function registerServiceWorker(tryOnce = false) {
		if (!('serviceWorker' in navigator)) {
			const route = useRoute();

			watch(
				route,
				() => {
					if (route.path.includes('/auth/')) {
						const toast = useToast();
						toast.remove('doesnt-support-login');
						setTimeout(() => {
							toast.add({
								id: 'doesnt-support-login',
								icon: 'i-material-symbols-warning-outline-rounded',
								title: 'Advarsel!',
								description:
									'Denne browser understøtter ikke login. Hvis du har åbnet siden igennem Facebook, så prøv at åbne siden igennem en anden browser.',
								color: 'error',
								duration: 0,
							});
						}, 500);
					}
				},
				{ immediate: true },
			);

			throw new Error('serviceWorker not supported');
		}

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
				//console.info('Unregistering worker');
				await reg.unregister();
				//console.info('Successfully unregistered, trying registration again');
				return registerServiceWorker();
			} catch (err) {
				console.error(
					`ServiceWorker failed to re-register after hard-refresh, reloading the page!`,
					err,
				);
				return location.reload();
			}
		}

		let serviceWorker =
			serviceReg.active || serviceReg.waiting || serviceReg.installing;
		if (!serviceWorker) {
			//console.info('No worker on registration, getting registration again');
			serviceReg = await navigator.serviceWorker.getRegistration('/');
			serviceWorker =
				serviceReg.active || serviceReg.waiting || serviceReg.installing;
		}

		if (!serviceWorker) {
			//console.info('No worker on registration, waiting 50ms');
			await sleep(50); // adjustable or skippable, have a play around
		}

		serviceWorker =
			serviceReg.active || serviceReg.waiting || serviceReg.installing;
		if (!serviceWorker)
			throw new Error('after waiting on .ready, still no worker');

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
					new Promise((resolve) => {
						serviceWorker.addEventListener('statechange', (e) => {
							if (e.target.state == 'activated') resolve();
						});
					}),
				);
			} catch (err) {
				if (err instanceof TimeoutError) {
					if (serviceWorker.state != 'activated') {
						if (tryOnce) {
							//console.info('Worker is still not active. state=', serviceWorker.state);
							throw new Error('failed to activate service worker');
						} else {
							//console.info('Worker is still not active, retrying once');
							return registerServiceWorker(true);
						}
					}
				} else {
					// should be unreachable
					throw err;
				}
			}
		}

		//console.info('Worker is controlling and active, we’re good folks!');
		return serviceWorker;
	}

	class TimeoutError extends Error {}

	/**
	 * Run promise but reject after some timeout.
	 *
	 * @template T
	 * @param {number} ms Milliseconds until timing out
	 * @param {Promise<T>} promise Promise to run until timeout (note that it will keep running after timeout)
	 * @returns {Promise<T, Error>}
	 */
	function timeout(ms, promise) {
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

	registerServiceWorker();
};
