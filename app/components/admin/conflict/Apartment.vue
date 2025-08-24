<template>
	<USlideover
		v-model:open="isOpen"
		:ui="{
			content: '!max-w-3xl',
		}"
	>
		<template #content>
			<UCard
				class="flex flex-col flex-1"
				:ui="{
					root: 'h-dvh',
					body: 'overflow-auto flex-1',
				}"
			>
				<template #header>
					<div class="flex items-center justify-between">
						<h3
							class="text-base font-semibold leading-6 text-neutral-900 dark:text-white"
						>
							Konfliktende lejligheder
						</h3>
						<UButton
							color="neutral"
							variant="ghost"
							icon="i-material-symbols-close"
							class="-my-1"
							@click="isOpen = false"
						/>
					</div>
				</template>

				<p
					v-if="conflicting.length !== 1"
					class="text-sm text-neutral-600 dark:text-neutral-400 mb-4"
				>
					Dette er en liste over lejligheder, hvor der er flere brugere
					tilknyttet. <br />
					Vælg en lejlighed for at se konflikten.
				</p>

				<USelect
					v-model="selectedConflictApartmentId"
					:items="conflictsOptions"
					variant="outline"
					icon="i-material-symbols-apartment-rounded"
					placeholder="Vælg konflikt.."
					class="mb-6"
				/>

				<template v-if="selectedConflict !== undefined">
					<p class="text-sm text-neutral-600 dark:text-neutral-400 mb-4">
						Lejligheden har følgende brugere tilknyttet:
						{{ selectedConflict.users.map((user) => '#' + user.id).join(', ') }}
						<br />
						Der må kun være en bruger tilknyttet, og konflikten skal løses.
						<br />
					</p>
					<p class="text-sm text-neutral-600 dark:text-neutral-400 mb-4">
						En konflikt kan løses ved at slette en bruger. <br />
						Det er vigtigt at vælge den rigtige bruger, da det ikke kan
						fortrydes.
					</p>

					<UAlert
						icon="i-material-symbols-warning-outline-rounded"
						color="warning"
						variant="subtle"
						title="Vigtigt!"
						description="Hvis du er itvivl om hvilken bruger der skal slettes, så kontakt resten af bestyrelsen."
						class="my-6"
					/>
				</template>

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

					<div
						v-else
						v-for="user in selectedConflict.users"
						:key="user.id"
						class="relative border rounded-md border-gray-200 dark:border-gray-800 mb-4 h-min"
					>
						<AdminUser
							:user-id="user.id"
							:user="user"
							:show-bookings="true"
							:show-persons="true"
							:show-sessions="true"
							:show-logins="true"
							:show-repremands="true"
							:show-close="false"
							@user-deleted="handleUserDeleted"
							class="select-none !h-auto transition-all"
							:class="{
								'pointer-events-none blur-xs animate-pulse':
									deletedUsersIds.includes(user.id),
							}"
						/>

						<UAlert
							v-if="deletedUsersIds.includes(user.id)"
							icon="i-material-symbols-delete-forever-outline-rounded"
							color="error"
							variant="subtle"
							title="Slettet!"
							description="Brugeren er blevet slettet fra lejligheden."
							class="absolute top-32 inset-x-3 w-3/4 mx-auto"
						/>
					</div>
				</div>
			</UCard>
		</template>
	</USlideover>
</template>

<script lang="ts" setup>
import type { SelectItem } from '@nuxt/ui';
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

const selectedConflictApartmentId = ref<number | undefined>(undefined);
const selectedConflict = computed<ConfictingApartment | undefined>(() => {
	if (selectedConflictApartmentId.value === undefined) return undefined;

	return conflicting.find(
		(conflict) => conflict.apartmentId === selectedConflictApartmentId.value,
	);
});

watchEffect(() => {
	const singleConflict = conflicting.length === 1 ? conflicting[0] : undefined;
	if (singleConflict) {
		selectedConflictApartmentId.value = singleConflict.apartmentId;
	}
});

const conflictsOptions = computed<SelectItem[]>(() => {
	const items: SelectItem[] = [];
	for (const conflict of conflicting) {
		const apartment = apartments.find(
			(apartment) => apartment.id === conflict.apartmentId,
		);

		if (apartment) {
			items.push({
				label: `${apartmentToAdress(apartment)}`,
				value: conflict.apartmentId,
			});
		}
	}
	return items;
});

/**
 * User Deletion
 */

const deletedUsersIds = ref<number[]>([]);

function handleUserDeleted(userId: number) {
	if (deletedUsersIds.value.includes(userId)) return;

	deletedUsersIds.value.push(userId);
}
</script>

<style scoped></style>
