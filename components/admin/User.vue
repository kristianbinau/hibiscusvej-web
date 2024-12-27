<template>
	<UCard v-if="user" class="mb-4">
		<template #header>
			<div class="flex items-center justify-between">
				<h3
					class="text-base font-semibold leading-6 text-gray-900 dark:text-white"
				>
					ID: {{ user.id }}
				</h3>
			</div>
		</template>

		<UFormGroup label="Apartment ID">
			<UInput
				disabled
				:model-value="String(user.apartmentId)"
				class="mb-4 disabled:*:cursor-default"
			/>
		</UFormGroup>

		<UFormGroup label="Is Admin">
			<UInput
				disabled
				:model-value="String(user.admin)"
				class="mb-4 disabled:*:cursor-default"
			/>
		</UFormGroup>

		<UFormGroup label="Verified">
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

		<UFormGroup label="Created At">
			<UInput
				disabled
				:model-value="String(new Date(user.createdAt).toLocaleDateString())"
				class="mb-4 disabled:*:cursor-default"
			/>
		</UFormGroup>

		<UFormGroup label="Updated At">
			<UInput
				disabled
				:model-value="String(new Date(user.updatedAt).toLocaleDateString())"
				class="mb-4 disabled:*:cursor-default"
			/>
		</UFormGroup>

		<template v-if="showPersons">
			<h3
				class="text-base font-semibold leading-6 text-gray-900 dark:text-white"
			>
				Persons
			</h3>

			<UCard
				v-if="showPersons"
				v-for="person in user.persons"
				class="mb-4 last:mb-0"
			>
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
		</template>

		<template v-if="showLogins">
			<h3
				class="text-base font-semibold leading-6 text-gray-900 dark:text-white"
			>
				Logins
			</h3>

			<UCard
				v-if="showLogins"
				v-for="login in user.logins"
				class="mb-4 last:mb-0"
			>
				<template #header>
					<h4
						class="text-sm font-semibold leading-5 text-gray-900 dark:text-white"
					>
						Login ID: {{ login.id }}
					</h4>
				</template>

				<UFormGroup label="Email">
					<UInput
						disabled
						:model-value="login.email"
						class="mb-4 disabled:*:cursor-default"
					/>
				</UFormGroup>
			</UCard>
		</template>

		<template v-if="showSessions">
			<h3
				class="text-base font-semibold leading-6 text-gray-900 dark:text-white"
			>
				Sessions
			</h3>

			<UCard v-for="session in user.sessions" class="mb-4 last:mb-0">
				<template #header>
					<h4
						class="text-sm font-semibold leading-5 text-gray-900 dark:text-white"
					>
						Session ID: {{ session.id }}
					</h4>
				</template>

				<UFormGroup label="Expires At">
					<UInput
						disabled
						:model-value="
							String(new Date(session.expiredAt).toLocaleDateString())
						"
						class="mb-4 disabled:*:cursor-default"
					/>
				</UFormGroup>

				<UFormGroup label="Created At">
					<UInput
						disabled
						:model-value="
							String(new Date(session.createdAt).toLocaleDateString())
						"
						class="mb-4 disabled:*:cursor-default"
					/>
				</UFormGroup>

				<UFormGroup label="Updated At">
					<UInput
						disabled
						:model-value="
							String(new Date(session.updatedAt).toLocaleDateString())
						"
						class="disabled:*:cursor-default"
					/>
				</UFormGroup>
			</UCard>
		</template>

		<template v-if="showBookings">
			<h3
				class="text-base font-semibold leading-6 text-gray-900 dark:text-white"
			>
				Bookings
			</h3>

			<UCard v-for="booking in bookings" class="mb-4 last:mb-0">
				<template #header>
					<h4
						class="text-sm font-semibold leading-5 text-gray-900 dark:text-white"
					>
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
						:model-value="
							String(new Date(booking.createdAt).toLocaleDateString())
						"
						class="mb-4 disabled:*:cursor-default"
					/>
				</UFormGroup>
				<UFormGroup label="Updated At">
					<UInput
						disabled
						:model-value="
							String(new Date(booking.updatedAt).toLocaleDateString())
						"
						class="disabled:*:cursor-default"
					/>
				</UFormGroup>
			</UCard>
		</template>
	</UCard>
</template>

<script lang="ts" setup>
import type { Booking, User } from '~/utils/types/admin';

const { userId, showPersons, showLogins, showSessions, showBookings } =
	defineProps<{
		userId: number;
		showPersons: boolean;
		showLogins: boolean;
		showSessions: boolean;
		showBookings: boolean;
	}>();

const user = defineModel<User>('user', { required: false, type: Object });
const bookings = defineModel<Booking[]>('bookings', {
	required: false,
	type: Array,
});

const toast = useToast();

/**
 * Fetch Missing
 */

onMounted(() => {
	if (user.value === undefined) {
		fetchUser();
	}

	if (bookings.value === undefined && showBookings) {
		fetchBookings();
	}
});

const fetchingUsers = ref(false);
async function fetchUser() {
	if (fetchingUsers.value) {
		return;
	}

	fetchingUsers.value = true;

	try {
		const { data } = await useFetch(`/api/admin/users/${userId}`, {
			server: false,
		});

		if (data.value === null) {
			fetchingUsers.value = false;
			toast.add({
				title: 'Brugeren blev ikke fundet',
			});
			return;
		}

		user.value = data.value as User;
	} catch (error) {
		toast.add({
			title: 'Der skete en fejl ved hentning af brugeren, genindlæs siden',
		});
	}

	fetchingUsers.value = false;
}

const fetchingBookings = ref(false);
async function fetchBookings() {
	if (fetchingBookings.value) {
		return;
	}

	fetchingBookings.value = true;

	try {
		const { data } = await useFetch(`/api/admin/users/${userId}/bookings`, {
			server: false,
		});

		if (data.value === null) {
			fetchingBookings.value = false;
			toast.add({
				title: 'Brugeren blev ikke fundet',
			});
			return;
		}

		bookings.value = data.value.bookings as Booking[];
	} catch (error) {
		toast.add({
			title: 'Der skete en fejl ved hentning af bookings, genindlæs siden',
		});
	}

	fetchingBookings.value = false;
}
</script>

<style></style>
