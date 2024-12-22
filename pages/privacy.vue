<template>
	<section class="markdown-content">
		<ContentDoc />
	</section>
</template>

<script lang="ts" setup>
defineRouteRules({
	prerender: true,
});
</script>

<style>
@import url('~/assets/css/markdown.css');
</style>
