<template>
	<video
		ref="videoPlayer"
		@error="handleError"
		v-show="!hideVideoPlayer"
		:loop="loop"
		:muted="muted"
		:autoplay="autoplay"
		class="inline max-h-min"
	>
		<source :src="`/api/app/blob/${src}`" :type="type" />
	</video>
</template>

<script lang="ts" setup>
const { src, type } = defineProps<{
	src: string;
	type: string;
	loop: boolean;
	muted: boolean;
	autoplay: boolean;
}>();

const videoPlayer = ref<HTMLVideoElement | null>(null);
const hideVideoPlayer = ref<boolean>(true);

function handleError() {
	hideVideoPlayer.value = true;
}

watch(
	videoPlayer,
	(value) => {
		if (value && value.readyState >= 2) {
			hideVideoPlayer.value = false;
		} else {
			hideVideoPlayer.value = true;
		}
	},
	{ immediate: true, deep: true },
);
</script>

<style></style>
