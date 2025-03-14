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
		<LayoutLinks />
	</footer>
</template>

<script setup lang="ts">
import type { NavigationMenuItem } from '#ui/types';

const { authUser } = await useUser();

const links: NavigationMenuItem[][] = [
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
		},
		{
			badge: {
				// @ts-ignore
				icon: 'i-material-symbols-settings-account-box-rounded',
				variant: 'subtle',
				size: 'md',
				color: 'primary',
			},
			onSelect: () => navigateTo('/u/settings'),
		},
		{
			badge: {
				// @ts-ignore
				icon: 'i-material-symbols-key-off-outline-rounded',
				variant: 'subtle',
				label: 'Logout',
				size: 'md',
				color: 'primary',
			},
			onSelect: () => logout(),
		},
	],
];

if (authUser.value && authUser.value.user.admin) {
	const link: NavigationMenuItem = {
		badge: {
			// @ts-ignore
			icon: 'i-material-symbols-admin-panel-settings-rounded',
			variant: 'subtle',
			size: 'md',
			color: 'primary',
		},
		onSelect: () => navigateTo('/u/admin'),
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
