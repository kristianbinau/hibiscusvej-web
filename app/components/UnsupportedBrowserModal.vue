<template>
	<UModal
		:title="t('auth.unsupportedBrowser.title')"
		:description="t('auth.unsupportedBrowser.description')"
		:dismissible="false"
		:close="false"
	>
		<template #body>
			<p class="mb-4">{{ t('auth.unsupportedBrowser.switchBrowser') }}</p>
			<p>
				{{ t('auth.unsupportedBrowser.reason1') }} <br />
				{{ t('auth.unsupportedBrowser.reason2') }}
			</p>
		</template>

		<template #footer>
			<UButton @click="emit('close', true)" :to="localePath('/')">
				{{ t('auth.unsupportedBrowser.backToHome') }}
			</UButton>
		</template>
	</UModal>
</template>

<script lang="ts" setup>
const { t } = useI18n();
const localePath = useLocalePath();

const emit = defineEmits<{ close: [boolean] }>();
</script>

<style></style>
