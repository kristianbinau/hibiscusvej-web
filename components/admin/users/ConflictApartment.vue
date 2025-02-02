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
				base: 'h-dvh',
				body: { base: 'overflow-auto flex-1' },
				ring: '',
				divide: 'divide-y divide-gray-100 dark:divide-gray-800',
			}"
		>
			<template #header>
				<div class="flex items-center justify-between">
					<h3
						class="text-base font-semibold leading-6 text-gray-900 dark:text-white"
					>
						Konfliktende lejligheder
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

			<USelect
				v-model="selectedConflict"
				:options="confictsOptions"
				variant="outline"
				icon="i-material-symbols-apartment-rounded"
				placeholder="Vælg konflikt.."
				class="mb-6"
			/>

			<div class="flex flex-col gap-4">
				<UCard v-if="selectedConflict === undefined">
					<template #header>
						<USkeleton class="h-8" />
					</template>
					<USkeleton class="h-12" />
					<template #footer>
						<USkeleton class="h-8" />
					</template>
				</UCard>

				<AdminUser
					v-else
					v-for="user in selectedConflict.users"
					:key="user.id"
					:user-id="user.id"
					:user="user"
					:show-bookings="true"
					:show-persons="true"
					:show-sessions="true"
					:show-logins="true"
					:show-repremands="true"
					class="mb-4 border rounded-md border-gray-200 dark:border-gray-800"
				/>
			</div>
		</UCard>
	</USlideover>
</template>

<script lang="ts" setup>
import type { ConfictingApartment } from '~/utils/types/admin';
import type { Apartment } from '~/utils/types/global';

const isOpen = defineModel({ required: true, type: Boolean });

const { conflicting, apartments } = defineProps<{
	conflicting: ConfictingApartment[];
	apartments: Apartment[];
}>();

/**
 * Conflict Selection
 */

const selectedConflict = ref<ConfictingApartment | undefined>(undefined);

watchEffect(() => {
	if (conflicting.length === 1) {
		selectedConflict.value = conflicting[0];
	}
});

const confictsOptions = computed(() => {
	const items = [];
	for (const conflict of conflicting) {
		const apartment = apartments.find(
			(apartment) => apartment.id === conflict.apartmentId,
		);

		if (apartment) {
			items.push({
				label: `${apartmentToAdress(apartment)}`,
				value: conflict,
			});
		}
	}
	return items;
});
</script>

<style scoped></style>
