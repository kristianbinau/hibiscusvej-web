<template>
	<section class="markdown-content">
		<ContentRenderer v-if="page" :value="page" />
	</section>
</template>

<script lang="ts" setup>
const route = useRoute();
const { data: page } = await useAsyncData(route.path, () => {
	return queryCollection('pages').path(route.path).first();
});

if (!page.value) {
	throw createError({
		statusCode: 404,
		statusMessage: 'Page Not Found',
	});
}
</script>
