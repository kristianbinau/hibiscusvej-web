<template>
	<UCard>
		<template #header>
			<h2>{{ member.name }}</h2>
		</template>

		<section class="markdown-content">
			<ContentRenderer :value="member" />
		</section>

		<template #footer>
			<ULink v-for="link in member.links" :to="link.url" target="_blank">
				{{ link.label }}
			</ULink>
		</template>
	</UCard>
</template>

<script lang="ts" setup>
import { type BoardCollectionItem } from '@nuxt/content';

const { member } = defineProps<{
	member: BoardCollectionItem;
}>();
</script>

<style scoped>
section.markdown-content {
	width: unset;
}
</style>
