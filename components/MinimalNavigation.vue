<template>
	<UHorizontalNavigation
		:links="links"
		class="border-b border-gray-200 dark:border-gray-800"
	/>
</template>

<script lang="ts" setup>
const links = [
	[
		{
			label: 'Hibiscusvej',
			labelClass: 'sm:text-2xl',
			icon: 'i-material-symbols-home',
			to: '/',
		},
	],
	[],
];
</script>

<style></style>
