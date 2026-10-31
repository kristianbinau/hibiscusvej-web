<template>
	<section class="markdown-content">
		<ContentRenderer v-if="page" :value="page" />
	</section>
</template>

<script lang="ts" setup>
/**
 * Locale-aware catch-all for content pages.
 *
 * Content paths are stored unprefixed (frontmatter `path`). Danish routes
 * (`/communal`) resolve the `pages` collection, `/en/*` routes the
 * `pages_en` collection. Missing English content redirects (302) to the
 * Danish path — Danish is never silently rendered at an `/en/` URL. Paths
 * without content at all (e.g. `/en/u/admin/*`, which exists only in
 * Danish) 404.
 */
const route = useRoute();

// Derived from the URL path (not `useI18n().locale`) so the resolution is
// deterministic regardless of module plugin/middleware ordering.
const urlLocale = computed(() =>
	route.path === '/en' || route.path.startsWith('/en/') ? 'en' : 'da',
);
const barePath = computed(() =>
	urlLocale.value === 'en' ? route.path.slice(3) || '/' : route.path,
);

const { data: page } = await useAsyncData(
	() => `${urlLocale.value}:${route.path}`,
	() =>
		queryCollection(urlLocale.value === 'en' ? 'pages_en' : 'pages')
			.path(barePath.value)
			.first(),
);

if (!page.value) {
	if (urlLocale.value === 'en') {
		// Does Danish content exist for the bare path? If yes, 302 there;
		// otherwise the path has no content in either locale → 404.
		const { data: danishPage } = await useAsyncData(
			() => `da-lookup:${barePath.value}`,
			() => queryCollection('pages').path(barePath.value).first(),
		);

		if (danishPage.value) {
			await navigateTo(
				{ path: barePath.value, query: route.query, hash: route.hash },
				{ redirectCode: 302 },
			);
		} else {
			throw createError({
				statusCode: 404,
				statusMessage: 'Page Not Found',
			});
		}
	} else {
		throw createError({
			statusCode: 404,
			statusMessage: 'Page Not Found',
		});
	}
}
</script>
