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
			label: 'Hibiscusvej 2-30',
			labelClass: ' hidden sm:text-2xl sm:block',
			icon: 'Logo',
			iconClass: 'sm:h-6 sm:w-6',
			to: '/',
		},
	],
	[
		{
			label: 'Fælleslokale',
			labelClass: 'hidden sm:block',
			icon: 'i-material-symbols-add-home-work-rounded',
			to: '/communal',
		},
		{
			label: 'Lån & Leje',
			labelClass: 'hidden sm:block',
			icon: 'i-material-symbols-tools-power-drill',
			to: '/borrow',
		},
	],
];

const config = useRuntimeConfig();

if (!config.public.maintenanceModeEnabled) {
	links[1].push({
		badge: {
			icon: 'i-material-symbols-key-outline-rounded',
			label: 'Login',
			size: 'md',
			color: 'primary',
		},
		to: '/auth/login',
	});
}
</script>
