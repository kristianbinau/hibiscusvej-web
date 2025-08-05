<template>
	<section v-if="guide" class="fixed bottom-4 left-4 z-30">
		<span v-if="!hasSeen" class="absolute -top-1 -right-1 flex h-3 w-3 z-40">
			<span
				class="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"
			></span>
			<span class="relative inline-flex rounded-full h-3 w-3 bg-sky-500"></span>
		</span>

		<UPopover>
			<UButton
				size="xl"
				color="neutral"
				variant="subtle"
				icon="i-material-symbols-help-outline"
				square
				@click="hasSeen = '1'"
			/>

			<template #content>
				<section
					id="guide-content"
					class="markdown-content max-h-96 overflow-y-scroll"
				>
					<ContentRenderer class="pointer-events-none" :value="guide" />
				</section>
			</template>
		</UPopover>
	</section>
</template>

<script lang="ts" setup>
const hasSeen = useCookie('has-seen-guide', {
	maxAge: 60 * 60 * 24 * 7 * 4 * 12, // 1 year
});

const route = useRoute();

const { data: guide, refresh } = await useAsyncData(
	`collection-guide-${route.path}`,
	() => {
		return queryCollection('guide').path(route.path).first();
	},
	{ immediate: false },
);

watch(
	route,
	() => {
		refresh();
	},
	{ immediate: true },
);
</script>

<style>
#guide-content.markdown-content {
	width: unset;
	max-width: 90vw;

	h1,
	h2,
	h3,
	h4,
	h5,
	h6 {
		margin-bottom: 0;
	}

	ul,
	li {
		margin-bottom: 0;
	}
}
</style>
