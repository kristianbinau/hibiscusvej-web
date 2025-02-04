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
						Konfliktende Personer
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

			<p
				v-if="conflicting.length !== 1"
				class="text-sm text-gray-600 dark:text-gray-400 mb-4"
			>
				Dette er en liste over de brugere, hvor der er en eller flere personer
				som er ens. <br />
				Vælg en konflikt for at se de brugere som er i konflikt.
			</p>

			<USelect
				v-model="selectedConflict"
				:options="confictsOptions"
				variant="outline"
				icon="i-material-symbols-apartment-rounded"
				placeholder="Vælg konflikt.."
				class="mb-6"
			/>

			<template v-if="selectedConflict !== undefined">
				<p class="text-sm text-gray-600 dark:text-gray-400 mb-4">
					Konflikten har følgende brugere tilknyttet:
					{{ selectedConflict.users.map((user) => '#' + user.id).join(', ') }}
					<br />
					Der må kun være en bruger med samme person, og konflikten skal løses.
					<br />
				</p>
				<p class="text-sm text-gray-600 dark:text-gray-400 mb-4">
					En konflikt kan løses ved at slette en bruger. <br />
					Det er vigtigt at vælge den rigtige bruger, da det ikke kan fortrydes.
				</p>

				<UAlert
					icon="i-material-symbols-warning-outline-rounded"
					color="amber"
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
							'pointer-events-none blur-sm animate-pulse':
								deletedUsersIds.includes(user.id),
						}"
					/>

					<UAlert
						v-if="deletedUsersIds.includes(user.id)"
						icon="i-material-symbols-delete-forever-outline-rounded"
						color="red"
						variant="subtle"
						title="Slettet!"
						description="Brugeren er blevet slettet fra lejligheden."
						class="absolute top-32 inset-x-3 w-3/4 mx-auto"
					/>
				</div>
			</div>
		</UCard>
	</USlideover>
</template>

<script lang="ts" setup>
import type { ConfictingPerson } from '~/utils/types/admin';
const isOpen = defineModel({ required: true, type: Boolean });

const { conflicting } = defineProps<{
	conflicting: ConfictingPerson[];
}>();

/**
 * Conflict Selection
 */

const selectedConflict = ref<ConfictingPerson | undefined>(undefined);

watchEffect(() => {
	if (conflicting.length === 1) {
		selectedConflict.value = conflicting[0];
	}
});

const confictsOptions = computed(() => {
	const items = [];
	for (const conflict of conflicting) {
		const userIds = conflict.users.map((user) => user.id);

		items.push({
			label: `#${userIds.join(', #')}`,
			value: conflict,
		});
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

<style></style>
