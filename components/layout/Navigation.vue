<template>
	<UNavigationMenu
		orientation="horizontal"
		:items="links"
		class="border-b border-gray-200 dark:border-gray-800"
	/>
</template>

<script lang="ts" setup>
import type { NavigationMenuItem } from '#ui/types';

defineProps<{
	links: NavigationMenuItem[] | NavigationMenuItem[][];
}>();
</script>

<style></style>
