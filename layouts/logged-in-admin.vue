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

const links: NavigationMenuItem[][] = [
	[
		{
			label: 'Hibiscusvej 2-30: Admin',
			icon: 'Logo',
			to: '/',
		},
	],
	[
		{
			label: 'Users',
			icon: 'i-material-symbols-add-home-work-rounded',
			to: '/u/admin/users',
		},
		{
			label: 'Bookings',
			icon: 'i-material-symbols-home-work-rounded',
			to: '/u/admin/bookings',
		},
		{
			badge: {
				// @ts-ignore
				icon: 'i-material-symbols-backspace-rounded',
				variant: 'subtle',
				label: 'Tilbage',
				size: 'md',
				color: 'primary',
			},
			onSelect: () => navigateTo('/u'),
		},
	],
];
</script>
