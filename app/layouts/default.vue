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
const { t } = useI18n();
const localePath = useLocalePath();

const links = computed(() => [
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
			label: t('nav.communal'),
			icon: 'i-material-symbols-add-home-work-rounded',
			to: localePath('/communal'),
		},
		{
			label: t('nav.borrow'),
			icon: 'i-material-symbols-tools-power-drill',
			to: localePath('/borrow'),
		},
		{
			label: t('nav.parking'),
			icon: 'i-material-symbols-car-tag',
			to: localePath('/parking'),
		},
		{
			label: t('nav.contact'),
			icon: 'i-material-symbols-phone-enabled',
			to: localePath('/contact'),
		},
	],
	[
		{
			// @ts-ignore
			icon: 'i-material-symbols-key-outline-rounded',
			label: t('nav.login'),
			to: localePath('/auth/login'),
		},
	],
]);
</script>
