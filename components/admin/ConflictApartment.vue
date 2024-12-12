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

			<USkeleton class="h-full" />

			<template #footer>
				<USkeleton class="h-8" />
			</template>
		</UCard>
	</USlideover>
</template>

<script lang="ts" setup>
import type { InternalApi } from 'nitropack';
type AdminUsersApiResponse = InternalApi['/api/admin/users']['get'];

type User = {
	sessions: AdminUsersApiResponse['userSessions'];
	logins: AdminUsersApiResponse['userLogins'];
	persons: AdminUsersApiResponse['userPersons'];
} & AdminUsersApiResponse['users'][0];

type ConfictingApartment = {
	apartmentId: number;
	users: User[];
};

const isOpen = defineModel({ required: true, type: Boolean });

const props = defineProps<{
	conflicting: ConfictingApartment[];
}>();
</script>

<style></style>
