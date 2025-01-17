<template>
	<section class="sm:w-full lg:w-3/4 mx-auto pt-8 px-4 md:px-0">
		<div class="mb-8">
			<h1 class="text-primary text-2xl mt-2 mb-2">Bookings</h1>
			<p>Her kan vi se alle bookings.</p>
		</div>

		<ClientOnly>
			<UTable :loading="fetching" :rows="rows" :columns="columns">
				<template #userId-data="{ row }">
					<UTooltip text="Klik for at se bruger">
						<UButton
							@click="openUser(row.userId)"
							class="cursor-pointer select-none"
							color="primary"
							icon="i-material-symbols-open-in-new"
							:label="String(row.userId)"
						/>
					</UTooltip>
				</template>
			</UTable>

			<USlideover
				v-model="isUserSlideOpen"
				:ui="{
					base: '!max-w-3xl',
				}"
				@close="atUserSlideClose()"
			>
				<!-- TODO: Implement Sync between AdminUser & Users page-->
				<AdminUser
					v-if="selectedUserIdForSlide"
					:userId="selectedUserIdForSlide"
					:bookings="response.communalBookings"
					:showPersons="true"
					:showLogins="true"
					:showSessions="true"
					:showBookings="true"
					:showRepremands="true"
					@close="isUserSlideOpen = false"
				/>
			</USlideover>
		</ClientOnly>
	</section>
</template>

<script lang="ts" setup>
import type { AdminBookingsApiResponse } from '~/utils/types/admin';

definePageMeta({
	layout: 'logged-in-admin',
	middleware: 'admin-required',
});

useHead({
	title: 'Admin: Bookings',
});

const toast = useToast();

const columns = [
	{
		key: 'id',
		label: 'ID',
		sortable: true,
	},
	{
		key: 'userId',
		label: 'UserId',
		sortable: true,
	},
	{
		key: 'date',
		label: 'Dato',
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

	return bookingsJoined.value.map((booking) => {
		return {
			...booking,
			date: new Date(booking.from).toLocaleDateString(),
			createdAt: new Date(booking.createdAt).toLocaleString(),
			updatedAt: new Date(booking.updatedAt).toLocaleString(),
		};
	});
});

/**
 * Fetch Admin Bookings endpoint
 */

/**
 * Join bookings into one array
 */
const bookingsJoined = computed(() => {
	return response.value.communalBookings.map((communalBooking) => {
		return {
			...communalBooking,
		};
	});
});

const response = ref<AdminBookingsApiResponse>({
	communalBookings: [],
});
const fetching = ref(true);

async function fetch() {
	fetching.value = true;

	try {
		const { data } = await useFetch('/api/admin/bookings');

		if (data.value === null) {
			fetching.value = false;
			response.value = {
				communalBookings: [],
			};
			return;
		}

		response.value = data.value;
	} catch (error) {
		toast.add({
			title: 'Der skete en fejl ved hentning af bookings, genindlæs siden',
		});
		fetching.value = false;
	}

	fetching.value = false;
}
fetch();

/**
 * User Slideover
 */
const isUserSlideOpen = ref<boolean>(false);
const selectedUserIdForSlide = ref<number | null>(null);

function openUser(id: number) {
	selectedUserIdForSlide.value = id;

	nextTick(() => {
		isUserSlideOpen.value = true;
	});
}

function atUserSlideClose() {
	selectedUserIdForSlide.value = null;
	fetch();
}
</script>

<style></style>
