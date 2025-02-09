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
import type { HorizontalNavigationLink } from '#ui/types';

const links: HorizontalNavigationLink[][] = [
	[
		{
			label: 'Hibiscusvej 2-30: Admin',
			labelClass: 'hidden sm:text-2xl sm:block',
			icon: 'Logo',
			iconClass: 'sm:h-6 sm:w-6',
			to: '/',
		},
	],
	[
		{
			label: 'Users',
			labelClass: 'hidden sm:block',
			icon: 'i-material-symbols-add-home-work-rounded',
			to: '/u/admin/users',
		},
		{
			label: 'Bookings',
			labelClass: 'hidden sm:block',
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
			click: () => navigateTo('/u'),
		},
	],
];
</script>
