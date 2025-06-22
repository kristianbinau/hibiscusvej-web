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
		<LazyLayoutLinks hydrate-never />
	</footer>
</template>

<script setup lang="ts">
const links = [
	[
		{
			label: 'Hibiscusvej 2-30',
			icon: 'Logo',
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
			label: 'Parkering',
			icon: 'i-material-symbols-car-tag',
			to: '/parking',
		},
		{
			label: 'Kontakt',
			icon: 'i-material-symbols-phone-enabled',
			to: '/contact',
		},
	],
];

const { isUnderMaintenance } = useMaintenance('/auth/login');
if (!isUnderMaintenance.value) {
	links.push([
		{
			// @ts-ignore
			icon: 'i-material-symbols-key-outline-rounded',
			label: 'Login',
			to: '/auth/login',
		},
	]);
}
</script>
