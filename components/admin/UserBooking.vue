<template>
	<UCard class="mb-4 last:mb-0">
		<template #header>
			<h4 class="text-sm font-semibold leading-5 text-gray-900 dark:text-white">
				Booking ID: {{ booking.id }}
			</h4>
		</template>

		<UFormGroup label="Starts At">
			<UInput
				disabled
				:model-value="String(new Date(booking.from).toLocaleString())"
				class="mb-4 disabled:*:cursor-default"
			/>
		</UFormGroup>

		<UFormGroup label="Ends At">
			<UInput
				disabled
				:model-value="String(new Date(booking.to).toLocaleString())"
				class="mb-4 disabled:*:cursor-default"
			/>
		</UFormGroup>

		<UFormGroup label="Deleted At">
			<UInput
				disabled
				:model-value="
					booking.deletedAt
						? String(new Date(booking.deletedAt).toLocaleDateString())
						: 'Ikke slettet'
				"
				class="disabled:*:cursor-default"
			/>
		</UFormGroup>

		<UFormGroup label="Created At">
			<UInput
				disabled
				:model-value="String(new Date(booking.createdAt).toLocaleDateString())"
				class="mb-4 disabled:*:cursor-default"
			/>
		</UFormGroup>
		<UFormGroup label="Updated At">
			<UInput
				disabled
				:model-value="String(new Date(booking.updatedAt).toLocaleDateString())"
				class="disabled:*:cursor-default"
			/>
		</UFormGroup>
	</UCard>
</template>

<script lang="ts" setup>
import type { Booking } from '~/utils/types/admin';

const booking = defineModel<Booking>('booking', {
	required: true,
	type: Object,
});

const toast = useToast();
</script>

<style></style>
