<template>
	<section class="sm:w-full lg:w-3/4 mx-auto pt-8 px-4 md:px-0">
		<div class="mb-8">
			<h1 class="text-primary text-2xl mt-2 mb-2">Mine bookinger</h1>
			<p>
				Her kan du se dine bookinger og slette dem hvis du har brug for det.<br />
				Bookinger kan ikke slettes hvis de er startet.
			</p>
		</div>

		<ClientOnly>
			<UTable :loading="fetchingBookings" :rows="rows" :columns="columns">
				<template #id-data="{ row }">
					<UButton
						size="md"
						label="Slet denne booking"
						color="red"
						variant="soft"
						:disabled="isAfter(now, row.fromDate)"
						@click="deleteBooking(row.id)"
					/>
				</template>
			</UTable>
		</ClientOnly>
	</section>
</template>

<script lang="ts" setup>
import type { InternalApi } from 'nitropack';
type BookingsMeApiResponse = InternalApi['/api/bookings/me']['get'];

import { isAfter } from 'date-fns';

definePageMeta({
	layout: 'logged-in',
	middleware: 'auth-required',
});

useHead({
	title: 'Mine bookinger',
});

const toast = useToast();

const columns = [
	{
		key: 'date',
		label: 'Dato',
	},
	{
		key: 'createdAt',
		label: 'Oprettet',
		// Hide on mobile
		class: 'hidden md:table-cell',
		rowClass: 'hidden md:table-cell',
	},
	{
		key: 'id',
		label: 'Handlinger',
	},
];

const rows = computed(() => {
	return myBookings.value.map((booking) => {
		return {
			id: booking.id,
			date: new Date(booking.from).toLocaleDateString(),
			createdAt: new Date(booking.createdAt).toLocaleString(),
			fromDate: new Date(booking.from),
		};
	});
});

const now = ref(new Date());

/**
 * Fetch Bookings
 */
const myBookings = ref<BookingsMeApiResponse>([]);
const fetchingBookings = ref(true);

async function fetchMyBookings() {
	fetchingBookings.value = true;

	try {
		const { data } = await useFetch('/api/bookings/me');

		if (data.value === null) {
			fetchingBookings.value = false;
			myBookings.value = [];
			return;
		}

		myBookings.value = data.value;
	} catch (error) {
		toast.add({
			title: 'Der skete en fejl ved hentning af bookings, genindlæs siden',
		});
		fetchingBookings.value = false;
	}

	fetchingBookings.value = false;
}
fetchMyBookings();

/**
 * Delete Bookings
 */
async function deleteBooking(id: number) {
	try {
		const res = await $fetch(`/api/bookings/${id}`, {
			method: 'DELETE',
		});

		if (res) {
			myBookings.value = myBookings.value.filter(
				(booking) => booking.id !== id,
			);

			toast.add({
				title: 'Booking slettet',
			});
		}
	} catch (error) {
		toast.add({
			title: 'Der skete en fejl ved sletning af booking',
		});
		return false;
	}

	return true;
}
</script>

<style></style>
