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

const { t } = useI18n();
const localePath = useLocalePath();

const links = computed<NavigationMenuItem[] | NavigationMenuItem[][]>(() => [
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
			icon: 'i-material-symbols-arrow-back-rounded',
			label: t('nav.back'),
			to: localePath('/'),
		},
	],
]);
</script>
