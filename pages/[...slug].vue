<template>
	<section class="markdown-content">
		<ContentRenderer v-if="page" :value="page" />
	</section>
</template>

<script lang="ts" setup>
defineRouteRules({
	prerender: true,
});

const route = useRoute();
const { data: page } = await useAsyncData(route.path, () => {
  return queryCollection('pages').path(route.path).first()
})
</script>

<style>
@import url('~/assets/css/markdown.css');
</style>
