<template>
	<header class="md:container md:px-0 sm:px-3 px-1 w-full mx-auto">
		<div class="flex items-stretch gap-2">
			<LayoutNavigation :links="links" class="flex-1 min-w-0" />

			<!-- Language picker (UI only — locale resolution is unchanged). -->
			<div
				class="flex items-center border-b border-gray-200 dark:border-gray-800"
			>
				<LayoutLanguagePicker />
			</div>
		</div>
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
