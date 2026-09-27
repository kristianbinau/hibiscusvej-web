<template>
	<header class="md:container md:px-0 sm:px-3 px-1 w-full mx-auto">
		<UNavigationMenu
			orientation="horizontal"
			:items="links"
			class="border-b border-gray-200 dark:border-gray-800"
		/>
	</header>

	<main class="md:container w-full md:px-0 sm:px-3 px-1 mb-12 mx-auto">
		<slot />
	</main>

	<Guide />

	<footer
		class="md:container w-full md:px-0 sm:px-3 px-1 mt-auto mb-10 mx-auto"
	>
		<LazyLayoutLinks hydrate-never />
	</footer>
</template>

<script setup lang="ts">
import type { NavigationMenuItem } from '#ui/types';

const links: NavigationMenuItem[][] = [
	[
		{
			label: 'System Admin',
			icon: 'i-material-symbols-admin-panel-settings-rounded',
			to: '/u/system-admin',
		},
	],
	[
		{
			label: 'Audit Logs',
			icon: 'i-material-symbols-event-list-rounded',
			to: '/u/system-admin/logs',
		},
	],
	[
		{
			icon: 'i-material-symbols-backspace-rounded',
			label: 'Back',
			to: '/u/admin',
		},
	],
];
</script>
