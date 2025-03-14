<template>
	<UCard class="mb-4">
		<template #header>
			<h4 class="text-sm font-semibold leading-5 text-neutral-900 dark:text-white">
				Session ID: {{ session.id }}
			</h4>
		</template>

		<UFormField label="Expires At">
			<UInput
				disabled
				:model-value="String(new Date(session.expiredAt).toLocaleDateString())"
				class="mb-4 disabled:*:cursor-default"
			/>
		</UFormField>

		<UFormField label="Created At">
			<UInput
				disabled
				:model-value="String(new Date(session.createdAt).toLocaleDateString())"
				class="mb-4 disabled:*:cursor-default"
			/>
		</UFormField>

		<UFormField label="Updated At">
			<UInput
				disabled
				:model-value="String(new Date(session.updatedAt).toLocaleDateString())"
				class="disabled:*:cursor-default"
			/>
		</UFormField>
	</UCard>
</template>

<script lang="ts" setup>
import type { UserSession } from '~/utils/types/admin';

const session = defineModel<UserSession>('session', {
	required: true,
	type: Object,
});

const toast = useToast();
</script>

<style></style>
