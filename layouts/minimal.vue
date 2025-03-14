<template>
	<header class="md:container md:px-0 sm:px-3 px-1 w-full mx-auto">
		<LayoutNavigation :links="links" />
	</header>

	<main class="md:container w-full md:px-0 sm:px-3 px-1 mb-12 mx-auto">
		<slot />
	</main>
</template>

<script setup lang="ts">
import type { NavigationMenuItem } from '#ui/types';

const links: NavigationMenuItem[] | NavigationMenuItem[][] = [
	[
		{
			label: 'Hibiscusvej 2-30',
			icon: 'Logo',
			to: '/',
		},
	],
	[
		{
			badge: {
				// @ts-ignore
				icon: 'i-material-symbols-arrow-back-rounded',
				label: 'Tilbage',
				variant: 'subtle',
				size: 'md',
				color: 'primary',
			},
			to: '/',
		},
	],
];
</script>
