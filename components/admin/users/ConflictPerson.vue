<template>
	<USlideover
		v-model="isOpen"
		:ui="{
			base: '!max-w-3xl',
		}"
	>
		<UCard
			class="flex flex-col flex-1"
			:ui="{
				body: { base: 'flex-1' },
				ring: '',
				divide: 'divide-y divide-gray-100 dark:divide-gray-800',
			}"
		>
			<template #header>
				<div class="flex items-center justify-between">
					<h3
						class="text-base font-semibold leading-6 text-gray-900 dark:text-white"
					>
						Konfliktende personer
					</h3>
					<UButton
						color="gray"
						variant="ghost"
						icon="i-heroicons-x-mark-20-solid"
						class="-my-1"
						@click="isOpen = false"
					/>
				</div>
			</template>

			<USkeleton class="h-full" />

			<template #footer>
				<USkeleton class="h-8" />
			</template>
		</UCard>
	</USlideover>
</template>

<script lang="ts" setup>
import type { ConfictingPerson } from '~/utils/types/admin';
const isOpen = defineModel({ required: true, type: Boolean });

const props = defineProps<{
	conflicting: ConfictingPerson[];
}>();
</script>

<style></style>
