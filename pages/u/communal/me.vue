<template>
	<section class="sm:w-full lg:w-3/4 mx-auto pt-8 px-4 md:px-0">
		<div class="mb-8">
			<h1 class="text-(--ui-primary) text-2xl mt-2 mb-2">Mine bookinger</h1>
			<p>
				Her kan du se dine bookinger og slette dem hvis du har brug for det.<br />
				Bookinger kan ikke slettes hvis de er startet.
			</p>
		</div>

		<ClientOnly>
			<UTable :loading="fetchingBookings" :data="rows" :columns="columns">
				<template #id-cell="{ row }">
					<UPopover
						class="mr-auto"
						:popper="{ placement: 'top-start' }"
						overlay
					>
						<UTooltip text="Klik for at fjerne booking">
							<UButton
								size="md"
								label="Slet denne booking"
								color="error"
								variant="soft"
								:disabled="isAfter(now, row.getValue<Date>('date'))"
								:loading="deleteBookingLoading"
							/>
						</UTooltip>

						<template #panel>
							<div class="p-4">
								<h3 class="text-sm font-semibold mb-2">Advarsel!</h3>
								<p class="text-xs">
									Du er ved fjerne denne booking. <br />
									Er du sikker på at du vil fjerne denne booking?
								</p>

								<UButton
									label="Godkend"
									icon="i-material-symbols-check-circle-rounded"
									color="error"
									variant="soft"
									size="xs"
									@click="deleteBooking(Number(row.id))"
									:loading="deleteBookingLoading"
									class="mt-4"
								/>
							</div>
						</template>
					</UPopover>
				</template>
			</UTable>
		</ClientOnly>
	</section>
</template>

<script lang="ts" setup>
import type { InternalApi } from 'nitropack';
type BookingsMeApiResponse = InternalApi['/api/app/bookings/me']['get'];

import { isAfter } from 'date-fns';
import type { TableColumn } from '@nuxt/ui';

definePageMeta({
	layout: 'logged-in',
	middleware: 'auth-required',
});

useHead({
	title: 'Mine bookinger',
});

const toast = useToast();

type MyBookingRow = {
	date: Date;
	createdAt: Date;
	id: number;
};

const columns: TableColumn<MyBookingRow>[] = [
	{
		accessorKey: 'date',
		header: 'Dato',
		cell: ({ row }) => row.getValue<Date>('date').toLocaleDateString(),
	},
	{
		accessorKey: 'createdAt',
		header: 'Oprettet',
		cell: ({ row }) => row.getValue<Date>('createdAt').toLocaleDateString(),
	},
	{
		accessorKey: 'id',
		header: 'Handlinger',
	},
];

const rows = computed<MyBookingRow[]>(() => {
	return myBookings.value.map((booking) => ({
		date: new Date(booking.from),
		createdAt: new Date(booking.createdAt),
		id: booking.id,
	}));
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
		const { data } = await useFetch('/api/app/bookings/me');

		if (data.value === null) {
			fetchingBookings.value = false;
			myBookings.value = [];
			return;
		}

		myBookings.value = data.value;
	} catch (error) {
		toast.add({
			icon: 'i-material-symbols-error-outline-rounded',
			title: 'Fejl!',
			description: 'Der skete en fejl...',
			actions: [
				{
					label: 'Prøv igen',
					onClick: fetchMyBookings,
				},
			],
		});
	}

	fetchingBookings.value = false;
}
fetchMyBookings();

/**
 * Delete Bookings
 */

const deleteBookingLoading = ref<boolean>(false);

async function deleteBooking(id: number) {
	deleteBookingLoading.value = true;

	try {
		const res = await $fetch(`/api/app/bookings/${id}`, {
			method: 'DELETE',
		});

		if (res) {
			myBookings.value = myBookings.value.filter(
				(booking) => booking.id !== id,
			);

			toast.add({
				icon: 'i-material-symbols-check-circle-outline-rounded',
				title: 'Success!',
				description: 'Booking blev slettet',
			});
		}
	} catch (error) {
		toast.add({
			icon: 'i-material-symbols-error-outline-rounded',
			title: 'Fejl!',
			description: 'Der skete en fejl...',
			actions: [
				{
					label: 'Prøv igen',
					onClick: () => deleteBooking(id),
				},
			],
		});
	}

	deleteBookingLoading.value = false;
}
</script>

<style></style>
