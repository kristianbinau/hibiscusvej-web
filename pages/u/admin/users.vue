<template>
	<section class="sm:w-full lg:w-3/4 mx-auto pt-8 px-4 md:px-0">
		<div class="mb-8">
			<h1 class="text-primary text-2xl mt-2 mb-2">Users</h1>
			<p>Her kan vi se alle brugere, deres sessions, logins og personer.</p>
		</div>

		<ClientOnly>
			<AdminUsersConflictHandling
				v-if="usersJoined.length > 0"
				:users="usersJoined"
				:apartments="apartments"
			/>

			<UTable :loading="fetching" :rows="rows" :columns="columns">
				<template #apartmentId-data="{ row }">
					<UTooltip :text="`ID: ${row.apartmentId}`">
						{{ convertApartmentIdToApartmentAdress(row.apartmentId) }}
					</UTooltip>
				</template>

				<template #admin-data="{ row }">
					<UButton
						v-if="row.admin"
						icon="i-material-symbols-check-box-rounded"
						size="sm"
						color="green"
						variant="soft"
					/>

					<UButton
						v-else
						icon="i-material-symbols-check-box-outline-blank"
						size="sm"
						color="red"
						variant="soft"
					/>
				</template>

				<template #verified-data="{ row }">
					<UTooltip
						v-if="row.verified !== 'Ikke verificeret'"
						:text="row.verified"
					>
						<UButton
							icon="i-material-symbols-check-box-rounded"
							size="sm"
							color="green"
							variant="soft"
							:loading="updatingVerificationUserIds.includes(row.id)"
							@click="unverifyUser(row.id)"
						/>
					</UTooltip>

					<UTooltip v-else text="Klik for at verificere">
						<UButton
							icon="i-material-symbols-check-box-outline-blank"
							size="sm"
							color="red"
							variant="soft"
							:loading="updatingVerificationUserIds.includes(row.id)"
							@click="verifyUser(row.id)"
						/>
					</UTooltip>
				</template>
			</UTable>
		</ClientOnly>
	</section>
</template>

<script lang="ts" setup>
import type {
	AdminUsersApiResponse,
	User,
	Apartment,
} from '~/utils/types/admin';

definePageMeta({
	layout: 'logged-in-admin',
	middleware: 'admin-required',
});

useHead({
	title: 'Admin: Users',
});

const toast = useToast();

const columns = [
	{
		key: 'id',
		label: 'ID',
		sortable: true,
	},
	{
		key: 'apartmentId',
		label: 'Apartment',
		sortable: true,
	},
	{
		key: 'admin',
		label: 'isAdmin',
		sortable: true,
	},
	{
		key: 'verified',
		label: 'Verificeret',
		sortable: true,
	},
	{
		key: 'sessionCount',
		label: 'Sessions',
		sortable: true,
	},
	{
		key: 'loginCount',
		label: 'Logins',
		sortable: true,
	},
	{
		key: 'personCount',
		label: 'Personer',
		sortable: true,
	},
	{
		key: 'createdAt',
		label: 'Oprettet',
		sortable: true,
	},
	{
		key: 'updatedAt',
		label: 'Opdateret',
		sortable: true,
	},
];

const rows = computed(() => {
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
			createdAt: new Date(user.createdAt).toLocaleDateString(),
			updatedAt: new Date(user.updatedAt).toLocaleDateString(),
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
		const { data } = await useFetch('/api/admin/users');

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
			title: 'Der skete en fejl ved hentning af bookings, genindlæs siden',
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
		const { data } = await useFetch('/api/apartments');

		if (data.value === null) {
			toast.add({
				title:
					'Der er ingen lejligheder? Dette er en fejl, kontakt system administrator',
			});

			return;
		}

		apartments.value = data.value;
	} catch (error) {
		toast.add({
			title: 'Der skete en fejl ved hentning af lejligheder, genindlæs siden',
		});
	}
}
fetchApartments();

function convertApartmentIdToApartmentAdress(apartmentId: number) {
	const apartment = apartments.value.find(
		(apartment) => apartment.id === apartmentId,
	);

	if (!apartment) return 'Ukendt lejlighed';

	return apartmentToAdress(apartment);
}

/**
 * Actions
 */

const updatingVerificationUserIds = ref<number[]>([]);

async function verifyUser(id: number) {
	if (updatingVerificationUserIds.value.includes(id)) return;

	updatingVerificationUserIds.value.push(id);

	await new Promise((resolve) => setTimeout(resolve, 500));

	try {
		const res = await $fetch('/api/admin/users/verify', {
			method: 'POST',
			body: {
				userIds: [id],
			},
		});

		if (res) {
			toast.remove(`user-unverified-${id}`);
			toast.add({
				id: `user-verified-${id}`,
				title: `Du har verificeret brugeren med ID: ${id}`,
				timeout: 10000,
				actions: [
					{
						label: 'Undo',
						click: () => unverifyUser(id),
					},
				],
			});

			await fetch();
		}
	} catch (error: any) {
		toast.add({
			title: 'Der skete en fejl ved verificering af bruger',
		});
	}

	updatingVerificationUserIds.value = updatingVerificationUserIds.value.filter(
		(userId) => userId !== id,
	);
}

async function unverifyUser(id: number) {
	if (updatingVerificationUserIds.value.includes(id)) return;

	updatingVerificationUserIds.value.push(id);

	await new Promise((resolve) => setTimeout(resolve, 500));

	try {
		const res = await $fetch('/api/admin/users/unverify', {
			method: 'POST',
			body: {
				userIds: [id],
			},
		});

		if (res) {
			toast.remove(`user-verified-${id}`);
			toast.add({
				id: `user-unverified-${id}`,
				title: `Du har fjernet verificeringen af brugeren med ID: ${id}`,
				timeout: 10000,
				actions: [
					{
						label: 'Undo',
						click: () => verifyUser(id),
					},
				],
			});

			await fetch();
		}
	} catch (error: any) {
		toast.add({
			title: 'Der skete en fejl ved fjernelse af verificering af bruger',
		});
	}

	updatingVerificationUserIds.value = updatingVerificationUserIds.value.filter(
		(userId) => userId !== id,
	);
}
</script>

<style></style>
