<template>
	<header class="md:container md:px-0 sm:px-3 px-1 w-full mx-auto">
		<LayoutNavigation :links="links" />
	</header>

	<main class="md:container w-full md:px-0 sm:px-3 px-1 mb-12 mx-auto">
		<slot />
	</main>

	<Guide />

	<footer
		class="md:container w-full md:px-0 sm:px-3 px-1 mt-auto mb-10 mx-auto"
	>
		<LazyLayoutLinks hydrate-never />
	</footer>
</template>

<script setup lang="ts">
import type { NavigationMenuItem } from '#ui/types';

const { authUser } = await useUser();

const links = ref<NavigationMenuItem[][]>([
	[
		{
			label: 'Hibiscusvej 2-30',
			icon: 'Logo',
			to: '/',
		},
	],
	[
		{
			label: 'Book lokale',
			icon: 'i-material-symbols-add-home-work-rounded',
			to: '/u/communal/book',
		},
		{
			label: 'Mine bookinger',
			icon: 'i-material-symbols-home-work-rounded',
			to: '/u/communal/me',
			class: 'hidden',
		},
		{
			label: 'Mine anmodninger',
			icon: 'i-material-symbols-home-work-outline-rounded',
			to: '/u/communal/me-requests',
			class: 'hidden',
		},
	],
	[
		{
			icon: 'i-material-symbols-settings-account-box-rounded',
			label: 'Indstillinger',
			to: '/u/settings',
		},
		{
			icon: 'i-material-symbols-key-off-outline-rounded',
			label: 'Logout',
			onSelect: () => logout(),
		},
	],
]);

if (authUser.value && authUser.value.user.admin) {
	const link: NavigationMenuItem = {
		icon: 'i-material-symbols-admin-panel-settings-rounded',
		label: 'Admin',
		to: '/u/admin',
	};

	// @ts-ignore
	links.value[2].unshift(link);
}

const { data: myBookings, pending: fetchingBookings } = await useFetch(
	'/api/app/bookings/me',
	{
		key: 'my-bookings',
	},
);

watch(
	[fetchingBookings, myBookings],
	([loading, bookings]) => {
		const link = '/u/communal/me';

		// @ts-ignore
		const meBookingLink = links.value[1]?.find((l) => l.to === link);
		if (!meBookingLink) return;

		// Depending on if we have any requests, add or remove "hidden" class
		if (!loading && bookings && bookings.length > 0) {
			meBookingLink.class = '';
		} else {
			meBookingLink.class = 'hidden';
		}
	},
	{ immediate: true },
);

const { data: myBookingRequests, pending: fetchingBookingRequests } =
	await useFetch('/api/app/bookings/requests/me', {
		key: 'my-booking-requests',
	});

watch(
	[fetchingBookingRequests, myBookingRequests],
	([loading, requests]) => {
		const link = '/u/communal/me-requests';

		// @ts-ignore
		const meRequestsLink = links.value[1]?.find((l) => l.to === link);
		if (!meRequestsLink) return;

		// Depending on if we have any requests, add or remove "hidden" class
		if (!loading && requests && requests.length > 0) {
			meRequestsLink.class = '';
		} else {
			meRequestsLink.class = 'hidden';
		}
	},
	{ immediate: true },
);

async function logout() {
	try {
		const res = await $fetch('/api/app/auth/logout', {
			method: 'POST',
		});

		if (res) {
			await navigateTo('/');
		}
	} catch (error: any) {
		await navigateTo('/');
	}
}
</script>
