<template>
	<section class="sm:w-full lg:w-3/4 mx-auto pt-8 px-4 md:px-0">
		<div class="mb-8">
			<h1 class="text-primary text-2xl mt-2 mb-2">Users</h1>
			<p>Her kan vi se alle brugere, deres sessions, logins og personer.</p>
		</div>

		<ClientOnly>
			<UTable :loading="fetching" :rows="rows" :columns="columns"></UTable>
		</ClientOnly>
	</section>
</template>

<script lang="ts" setup>
import type { InternalApi } from 'nitropack';
type AdminUsersApiResponse = InternalApi['/api/admin/users']['get'];
import { format } from 'date-fns';

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
	},
	{
		key: 'apartmentId',
		label: 'Apartment',
	},
	{
		key: 'admin',
		label: 'isAdmin',
	},
	{
		key: 'verified',
		label: 'Verificeret',
	},
	{
		key: 'sessionCount',
		label: 'Sessions',
	},
	{
		key: 'loginCount',
		label: 'Logins',
	},
	{
		key: 'personCount',
		label: 'Personer',
	},
	{
		key: 'createdAt',
		label: 'Oprettet',
	},
	{
		key: 'updatedAt',
		label: 'Opdateret',
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
 * Fetch Admin Users endpoint
 */

/**
 * Join users, sessions, logins and persons into one array
 */
const usersJoined = computed(() => {
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
		fetching.value = false;
	}

	fetching.value = false;
}
fetch();
</script>

<style></style>
