<template>
	<header class="md:container md:px-0 sm:px-3 px-1 w-full mx-auto">
		<div class="flex items-stretch gap-2">
			<LayoutNavigation :links="links" class="flex-1 min-w-0" />

			<!-- Language picker (locked decision §3.6). -->
			<div
				class="flex items-center border-b border-gray-200 dark:border-gray-800"
			>
				<LayoutLanguagePicker />
			</div>
		</div>
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

const { t } = useI18n();
const localePath = useLocalePath();

const { authUser } = await useUser();

// The "Mine bookinger"/"Mine anmodninger" nav items stay hidden until their
// data has loaded and actually contains rows (see the watchers below).
const hasMyBookings = ref(false);
const hasMyRequests = ref(false);

const links = computed<NavigationMenuItem[][]>(() => [
	[
		{
			// Site name — identical in every locale.
			label: 'Hibiscusvej 2-30',
			icon: 'Logo',
			to: localePath('/'),
		},
	],
	[
		{
			label: t('nav.bookRoom'),
			icon: 'i-material-symbols-add-home-work-rounded',
			to: localePath('/u/communal/book'),
		},
		{
			label: t('nav.myBookings'),
			icon: 'i-material-symbols-home-work-rounded',
			to: localePath('/u/communal/me'),
			class: hasMyBookings.value ? '' : 'hidden',
		},
		{
			label: t('nav.myRequests'),
			icon: 'i-material-symbols-home-work-outline-rounded',
			to: localePath('/u/communal/me-requests'),
			class: hasMyRequests.value ? '' : 'hidden',
		},
	],
	[
		// Admin routes are not localized — the link stays unprefixed.
		...(authUser.value && authUser.value.user.admin
			? [
					{
						icon: 'i-material-symbols-admin-panel-settings-rounded',
						label: t('nav.admin'),
						to: '/u/admin',
					} as NavigationMenuItem,
				]
			: []),
		{
			icon: 'i-material-symbols-settings-account-box-rounded',
			label: t('nav.settings'),
			to: localePath('/u/settings'),
		},
		{
			icon: 'i-material-symbols-key-off-outline-rounded',
			label: t('nav.logout'),
			onSelect: () => logout(),
		},
	],
]);

const { data: myBookings, pending: fetchingBookings } = await useFetch(
	'/api/app/bookings/me',
	{
		key: 'my-bookings',
	},
);

watch(
	[fetchingBookings, myBookings],
	([loading, bookings]) => {
		// Depending on if we have any bookings, show or hide the nav item
		hasMyBookings.value = !loading && !!bookings && bookings.length > 0;
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
		// Depending on if we have any requests, show or hide the nav item
		hasMyRequests.value = !loading && !!requests && requests.length > 0;
	},
	{ immediate: true },
);

async function logout() {
	try {
		const res = await $fetch('/api/app/auth/logout', {
			method: 'POST',
		});

		if (res) {
			await navigateTo(localePath('/'));
		}
	} catch (error: any) {
		await navigateTo(localePath('/'));
	}
}
</script>
