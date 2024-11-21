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
const links = [
	[
		{
			label: 'Hibiscusvej',
			labelClass: 'sm:text-2xl',
			icon: 'i-material-symbols-home-rounded',
			to: '/',
		},
	],
	[
		{
			label: 'Fælleslokale',
			icon: 'i-material-symbols-add-home-work-rounded',
			to: '/communal',
		},
		{
			label: 'Lån & Leje',
			icon: 'i-material-symbols-tools-power-drill',
			to: '/borrow',
		},
		{
			badge: {
				icon: 'i-material-symbols-key-outline-rounded',
				variant: 'subtle',
				label: 'Login',
				size: 'md',
				color: 'primary',
			},
			to: '/auth/login',
		},
	],
];
</script>
