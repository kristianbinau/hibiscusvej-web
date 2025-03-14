<template>
	<UCard class="mb-4">
		<template #header>
			<h4 class="text-sm font-semibold leading-5 text-neutral-900 dark:text-white">
				Person ID: {{ person.id }}
			</h4>
		</template>

		<UFormField label="Name">
			<UInput
				disabled
				:model-value="person.name"
				class="mb-4 disabled:*:cursor-default"
			/>
		</UFormField>
		<UFormField label="Email">
			<UInput
				disabled
				:model-value="person.email"
				class="mb-4 disabled:*:cursor-default"
			/>
		</UFormField>
		<UFormField label="Phone">
			<UInput
				disabled
				:model-value="person.phone"
				class="disabled:*:cursor-default"
			/>
		</UFormField>
	</UCard>
</template>

<script lang="ts" setup>
import type { UserPerson } from '~/utils/types/admin';

const person = defineModel<UserPerson>('person', {
	required: true,
	type: Object,
});

const toast = useToast();
</script>

<style></style>
