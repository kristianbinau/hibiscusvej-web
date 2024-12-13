<template>
	<USlideover v-model="isOpen">
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

			<div class="h-full">
				<USelect
					v-model="selectedConflict"
					:options="confictsOptions"
					variant="outline"
					icon="i-material-symbols-apartment-rounded"
					placeholder="Vælg konflikt.."
					class="mb-6"
				/>

				<UCard v-if="selectedConflict === undefined">
					<template #header>
						<USkeleton class="h-8" />
					</template>
					<USkeleton class="h-12" />
					<template #footer>
						<USkeleton class="h-8" />
					</template>
				</UCard>

				<UCard
					v-else
					v-for="user in selectedConflict.users"
					:key="user.id"
					class="mb-4"
				>
					<template #header>
						<div class="flex items -center justify-between">
							<h3
								class="text-base font-semibold leading-6 text-gray-900 dark:text-white"
							>
								ID: {{ user.id }}
							</h3>
						</div>
					</template>

					<UFormGroup label="Is Admin">
						<UInput
							disabled
							:model-value="String(user.admin)"
							class="mb-4 disabled:*:cursor-default"
						/>
					</UFormGroup>

					<UFormGroup label="Verified At">
						<UInput
							disabled
							:model-value="
								user.verifiedAt
									? String(new Date(user.verifiedAt).toLocaleDateString())
									: 'Ikke verificeret'
							"
							class="mb-4 disabled:*:cursor-default"
						/>
					</UFormGroup>

					<UCard v-for="person in user.persons" class="mb-4 last:mb-0">
						<template #header>
							<h4
								class="text-sm font-semibold leading-5 text-gray-900 dark:text-white"
							>
								Person ID: {{ person.id }}
							</h4>
						</template>

						<UFormGroup label="Name">
							<UInput
								disabled
								:model-value="person.name"
								class="mb-4 disabled:*:cursor-default"
							/>
						</UFormGroup>
						<UFormGroup label="Email">
							<UInput
								disabled
								:model-value="person.email"
								class="mb-4 disabled:*:cursor-default"
							/>
						</UFormGroup>
						<UFormGroup label="Phone">
							<UInput
								disabled
								:model-value="person.phone"
								class="disabled:*:cursor-default"
							/>
						</UFormGroup>
					</UCard>
				</UCard>
			</div>

			<template #footer>
				<USkeleton class="h-8" />
			</template>
		</UCard>
	</USlideover>
</template>

<script lang="ts" setup>
import type { InternalApi } from 'nitropack';
type AdminUsersApiResponse = InternalApi['/api/admin/users']['get'];
type ApartmentsApiResponse = InternalApi['/api/apartments']['get'];

type User = {
	sessions: AdminUsersApiResponse['userSessions'];
	logins: AdminUsersApiResponse['userLogins'];
	persons: AdminUsersApiResponse['userPersons'];
} & AdminUsersApiResponse['users'][0];

type ConfictingApartment = {
	apartmentId: number;
	users: User[];
};

type Apartment = ApartmentsApiResponse[0];

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

<style></style>
