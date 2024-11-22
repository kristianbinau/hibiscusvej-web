<template>
	<header class="md:container md:px-0 sm:px-3 px-1 w-full mx-auto">
		<LayoutNavigation :links="links" />
	</header>

	<main class="md:container w-full md:px-0 sm:px-3 px-1 mb-12 mx-auto">
		<slot />
	</main>
</template>

<script setup lang="ts">
const links = [
	[
		{
			label: 'Hibiscusvej',
			labelClass: 'sm:text-2xl',
			icon: 'Logo',
			to: '/',
		},
	],
	[
		{
			badge: {
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
