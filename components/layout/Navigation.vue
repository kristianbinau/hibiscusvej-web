<template>
	<UHorizontalNavigation
		:links="links"
		class="border-b border-gray-200 dark:border-gray-800"
	/>
</template>

<script lang="ts" setup>
import type { HorizontalNavigationLink } from '#ui/types';

defineProps<{
	links: HorizontalNavigationLink[] | HorizontalNavigationLink[][];
}>();
</script>

<style></style>
