<template>
	<UCard class="mb-4 last:mb-0">
		<template #header>
			<h4 class="text-sm font-semibold leading-5 text-gray-900 dark:text-white">
				Repremand ID: {{ repremand.id }}
			</h4>
		</template>

		<UFormGroup label="Type">
			<UInput
				disabled
				:model-value="repremand.type"
				class="mb-4 disabled:*:cursor-default"
			/>
		</UFormGroup>
		<UFormGroup label="Reason">
			<UInput
				disabled
				:model-value="repremand.reason"
				class="mb-4 disabled:*:cursor-default"
			/>
		</UFormGroup>
		<UFormGroup label="Expires At">
			<UInput
				disabled
				:model-value="
					repremand.expiresAt
						? new Date(repremand.expiresAt).toLocaleString()
						: 'Never'
				"
				class="disabled:*:cursor-default"
			/>
		</UFormGroup>
		<UFormGroup label="Created At">
			<UInput
				disabled
				:model-value="new Date(repremand.createdAt).toLocaleString()"
				class="disabled:*:cursor-default"
			/>
		</UFormGroup>
	</UCard>
</template>

<script lang="ts" setup>
import type { UserRepremand } from '~/utils/types/admin';

const repremand = defineModel<UserRepremand>('repremand', {
	required: true,
	type: Object,
});

const toast = useToast();
</script>

<style></style>
