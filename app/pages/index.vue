<template>
	<section
		class="relative lg:px-0 px-4 flex flex-col items-center text-center gap-4 mt-6"
	>
		<video :muted="true" :autoplay="true" :loop="true" class="w-dvw rounded-lg">
			<source
				src="https://storage.hibiscusvej.dk/google-earth-video.mp4"
				type="video/mp4"
			/>
		</video>

		<section
			class="lg:absolute lg:mt-0 -bottom-16 xl:bottom-0 z-30 mt-2 bg-neutral-100 dark:bg-neutral-900 p-4 rounded-tl-lg rounded-tr-lg"
		>
			<h1 class="text-(--ui-primary) text-4xl mb-2">
				{{ t('home.welcome') }}
			</h1>

			<p class="mb-2">{{ t('home.governedBy') }}<br /></p>
			<p>
				{{ t('home.contactIntro') }}
				<ULink
					to="mailto:hibiscusvejbestyrelse@outlook.dk"
					:external="true"
					target="_blank"
					class="text-(--ui-primary) underline"
				>
					{{ t('home.boardLink') }}</ULink
				>.
			</p>

			<p>
				{{ t('home.facebookIntro') }}
				<ULink
					to="https://www.facebook.com/groups/692711287862071"
					:external="true"
					target="_blank"
					class="text-(--ui-primary) underline"
				>
					{{ t('home.facebookLink') }}</ULink
				>{{ t('home.facebookOutro') }}
			</p>
		</section>
	</section>
</template>

<script lang="ts" setup>
const { t } = useI18n();

useHead({
	title: () => t('home.title'),
});
</script>
