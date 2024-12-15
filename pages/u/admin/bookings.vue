<template>
	<section class="sm:w-full lg:w-3/4 mx-auto pt-8 px-4 md:px-0">
		<div class="mb-8">
			<h1 class="text-primary text-2xl mt-2 mb-2">Bookings</h1>
			<p>Her kan vi se alle bookings.</p>
		</div>

		<ClientOnly>
			<UTable :loading="fetching" :rows="rows" :columns="columns"></UTable>
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

const columns = undefined;

const rows = computed(() => {
	return bookingsJoined.value;
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
</script>

<style></style>
