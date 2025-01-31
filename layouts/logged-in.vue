<template>
	<header class="md:container md:px-0 sm:px-3 px-1 w-full mx-auto">
		<LayoutNavigation :links="links" />
	</header>

	<main class="md:container w-full md:px-0 sm:px-3 px-1 mb-12 mx-auto">
		<slot />
	</main>

	<footer
		class="md:container w-full md:px-0 sm:px-3 px-1 mt-auto mb-10 mx-auto"
	>
		<LayoutLinks />
	</footer>
</template>

<script setup lang="ts">
import type { HorizontalNavigationLink } from '#ui/types';

const { authUser } = await useUser();

const links: HorizontalNavigationLink[][] = [
	[
		{
			label: 'Hibiscusvej 2-30',
			labelClass: 'hidden sm:text-2xl sm:block',
			icon: 'Logo',
			iconClass: 'sm:h-6 sm:w-6',
			to: '/',
		},
	],
	[
		{
			label: 'Book lokale',
			labelClass: 'hidden sm:block',
			icon: 'i-material-symbols-add-home-work-rounded',
			to: '/u/communal/book',
		},
		{
			label: 'Mine bookinger',
			labelClass: 'hidden sm:block',
			icon: 'i-material-symbols-home-work-rounded',
			to: '/u/communal/me',
		},
		{
			badge: {
				icon: 'i-material-symbols-settings-account-box-rounded',
				variant: 'subtle',
				size: 'md',
				color: 'primary',
			},
			click: () => navigateTo('/u/settings'),
		},
		{
			badge: {
				icon: 'i-material-symbols-key-off-outline-rounded',
				variant: 'subtle',
				label: 'Logout',
				size: 'md',
				color: 'primary',
			},
			click: () => logout(),
		},
	],
];

if (authUser.value && authUser.value.user.admin) {
	const link: HorizontalNavigationLink = {
		badge: {
			icon: 'i-material-symbols-admin-panel-settings-rounded',
			variant: 'subtle',
			size: 'md',
			color: 'primary',
		},
		click: () => navigateTo('/u/admin'),
	};

	// Add before settings
	links[1].splice(-2, 0, link);
}

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
