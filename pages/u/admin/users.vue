<template>
	<section class="sm:w-full lg:w-3/4 mx-auto pt-8 px-4 md:px-0">
		<div class="mb-8">
			<h1 class="text-(--ui-primary) text-2xl mt-2 mb-2">Users</h1>
			<p>Her kan vi se alle brugere, deres sessions, logins og personer.</p>
		</div>

		<ClientOnly>
			<AdminConflictHandling
				v-if="usersJoined.length > 0"
				:users="usersJoined"
				:apartments="apartments"
				@update="atConflictHandlingClose"
			/>

			<UTable :loading="fetching" :data="rows" :columns="columns">
				<template #id-cell="{ row }">
					<UTooltip text="Klik for at se bruger">
						<UButton
							@click="openUser(row.getValue('id'))"
							class="cursor-pointer select-none"
							color="primary"
							icon="i-material-symbols-open-in-new"
							:label="String(row.getValue('id'))"
						/>
					</UTooltip>
				</template>

				<template #apartmentId-cell="{ row }">
					<UTooltip :text="`ID: ${row.getValue('apartmentId')}`">
						{{
							convertApartmentIdToApartmentAdress(row.getValue('apartmentId'))
						}}
					</UTooltip>
				</template>

				<template #admin-cell="{ row }">
					<UBadge
						v-if="row.getValue('admin')"
						class="px-1.5"
						size="lg"
						icon="i-material-symbols-check-box-rounded"
						color="success"
						variant="soft"
					/>

					<UBadge
						v-else
						class="px-1.5"
						size="lg"
						icon="i-material-symbols-check-box-outline-blank"
						color="error"
						variant="soft"
					/>
				</template>

				<template #verified-cell="{ row }">
					<UTooltip
						v-if="row.getValue('verified') !== 'Ikke verificeret'"
						:text="row.getValue('verified')"
					>
						<UBadge
							class="px-1.5"
							size="lg"
							icon="i-material-symbols-check-box-rounded"
							color="success"
							variant="soft"
						/>
					</UTooltip>

					<UTooltip v-else>
						<UBadge
							class="px-1.5"
							size="lg"
							icon="i-material-symbols-check-box-outline-blank"
							color="error"
							variant="soft"
						/>
					</UTooltip>
				</template>
			</UTable>

			<USlideover
				v-model:open="isUserSlideOpen"
				:ui="{
					content: '!max-w-3xl',
				}"
				@after:leave="atUserSlideClose()"
			>
				<template #content>
					<!-- TODO: Implement Sync between AdminUser & Users page-->
					<AdminUser
						v-if="selectedUserForSlide"
						:userId="selectedUserForSlide.id"
						:user="selectedUserForSlide"
						:showPersons="true"
						:showLogins="true"
						:showSessions="true"
						:showBookings="true"
						:showRepremands="true"
						:showClose="true"
						@close="isUserSlideOpen = false"
					/>
				</template>
			</USlideover>
		</ClientOnly>
	</section>
</template>

<script lang="ts" setup>
import type { AdminUsersApiResponse, User } from '~/utils/types/admin';
import type { Apartment } from '~/utils/types/global';
import type { TableColumn } from '@nuxt/ui';

definePageMeta({
	layout: 'logged-in-admin',
	middleware: 'admin-required',
});

useHead({
	title: 'Admin: Users',
});

const toast = useToast();
const { query } = useRoute();

type UserRow = {
	id: number;
	apartmentId: number;
	admin: boolean;
	verified: string;
	sessionCount: number;
	loginCount: number;
	personCount: number;
	createdAt: Date;
	updatedAt: Date;
};

const columns: TableColumn<UserRow>[] = [
	{
		accessorKey: 'id',
		header: 'ID',
	},
	{
		accessorKey: 'apartmentId',
		header: 'Apartment',
	},
	{
		accessorKey: 'admin',
		header: 'isAdmin',
	},
	{
		accessorKey: 'verified',
		header: 'Verificeret',
	},
	{
		accessorKey: 'sessionCount',
		header: 'Sessions',
	},
	{
		accessorKey: 'loginCount',
		header: 'Logins',
	},
	{
		accessorKey: 'personCount',
		header: 'Personer',
	},
	{
		accessorKey: 'createdAt',
		header: 'Oprettet',
		cell: ({ row }) => row.getValue<Date>('createdAt').toLocaleDateString(),
	},
	{
		accessorKey: 'updatedAt',
		header: 'Opdateret',
		cell: ({ row }) => row.getValue<Date>('createdAt').toLocaleDateString(),
	},
];

onMounted(() => {
	if (query.userId) {
		openUser(Number(query.userId));
	}
});

const rows = computed<UserRow[]>(() => {
	return usersJoined.value.map((user) => {
		const verifiedByUser = usersJoined.value.find(
			(verifiedUser) => verifiedUser.id === user.verifiedByUserId,
		);

		const verified = user.verifiedAt
			? `${new Date(user.verifiedAt).toLocaleDateString()}: ${verifiedByUser?.persons[0].name}`
			: 'Ikke verificeret';

		return {
			id: user.id,
			apartmentId: user.apartmentId,
			admin: user.admin,
			verified: verified,
			sessionCount: user.sessions.length,
			loginCount: user.logins.length,
			personCount: user.persons.length,
			createdAt: new Date(user.createdAt),
			updatedAt: new Date(user.updatedAt),
		};
	});
});

/**
 * Fetch Admin Users
 */

/**
 * Join users, sessions, logins and persons into one array
 */
const usersJoined: Ref<User[]> = computed(() => {
	return adminUsersApiResponse.value.users.map((user) => {
		const userPersons = adminUsersApiResponse.value.userPersons.filter(
			(person) => person.userId === user.id,
		);
		const userLogins = adminUsersApiResponse.value.userLogins.filter(
			(login) => login.userId === user.id,
		);
		const userSessions = adminUsersApiResponse.value.userSessions.filter(
			(session) => {
				return userLogins.some((login) => login.id === session.userLoginId);
			},
		);

		return {
			...user,
			sessions: userSessions,
			logins: userLogins,
			persons: userPersons,
		};
	});
});

const adminUsersApiResponse = ref<AdminUsersApiResponse>({
	users: [],
	userSessions: [],
	userLogins: [],
	userPersons: [],
});
const fetching = ref(true);

async function fetch() {
	fetching.value = true;

	try {
		const { data } = await useFetch('/api/app/admin/users');

		if (data.value === null) {
			fetching.value = false;
			adminUsersApiResponse.value = {
				users: [],
				userSessions: [],
				userLogins: [],
				userPersons: [],
			};
			return;
		}

		adminUsersApiResponse.value = data.value;
	} catch (error) {
		toast.add({
			icon: 'i-material-symbols-error-outline-rounded',
			title: 'Fejl!',
			description: 'Der skete en fejl...',
			actions: [
				{
					label: 'Genindlæs siden',
					onClick: () => reloadNuxtApp(),
				},
			],
		});
	}

	fetching.value = false;
}
fetch();

/**
 * Fetch Apartments
 */

const apartments = ref<Apartment[]>([]);
async function fetchApartments() {
	try {
		const { data } = await useFetch('/api/app/apartments');

		apartments.value = data.value;
	} catch (error) {
		toast.add({
			icon: 'i-material-symbols-error-outline-rounded',
			title: 'Fejl!',
			description: 'Der skete en fejl...',
			actions: [
				{
					label: 'Prøv igen',
					onClick: fetchApartments,
				},
			],
		});
	}
}
fetchApartments();

function convertApartmentIdToApartmentAdress(apartmentId: number) {
	const apartment = apartments.value.find(
		(apartment: Apartment) => apartment.id === apartmentId,
	);

	if (!apartment) return 'Ukendt lejlighed';

	return apartmentToAdress(apartment);
}

/**
 * User Slideover
 */
const isUserSlideOpen = ref<boolean>(false);
const selectedUserForSlide = ref<User | null>(null);

function openUser(id: number) {
	const user = usersJoined.value.find((user) => user.id === id);

	if (!user) {
		toast.add({
			icon: 'i-material-symbols-error-outline-rounded',
			title: 'Fejl!',
			description: `Brugeren med ID: ${id} blev ikke fundet`,
			actions: [
				{
					label: 'Prøv igen',
					onClick: () => openUser(id),
				},
			],
		});
		return;
	}

	selectedUserForSlide.value = user;

	nextTick(() => {
		isUserSlideOpen.value = true;
	});
}

function atUserSlideClose() {
	selectedUserForSlide.value = null;
	fetch();
}

function atConflictHandlingClose() {
	fetch();
}
</script>

<style></style>
