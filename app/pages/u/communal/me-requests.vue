<template>
	<section class="sm:w-full lg:w-3/4 mx-auto pt-8 px-4 md:px-0">
		<div class="mb-8">
			<h1 class="text-(--ui-primary) text-2xl mt-2 mb-2">Mine booking anmodninger</h1>
			<p>
				Her kan du se dine booking anmodninger og slette dem hvis du har brug
				for det.<br />
				Anmodninger kan ikke slettes efter de er blevet håndteret.
			</p>
		</div>

		<ClientOnly>
			<UTable :data="rows" :columns="columns">
				<template #id-cell="{ row }">
					<UTooltip text="Klik for at fjerne booking anmodning">
						<UButton
							size="md"
							label="Slet denne anmodning"
							color="error"
							variant="soft"
							:disabled="isAfter(now, row.getValue<Date>('date'))"
							@click="deleteBookingRequest(row.getValue('id'))"
							:loading="deleteBookingRequestLoading"
						/>
					</UTooltip>
				</template>
			</UTable>
		</ClientOnly>
	</section>
</template>

<script lang="ts" setup>
import type { InternalApi } from 'nitropack';
import type { TableColumn } from '@nuxt/ui';
type MyBookingRequestsApiResponse = InternalApi['/api/app/bookings/requests/me']['get'];

import { isAfter } from 'date-fns';

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
	return (
		myBookingRequests.value?.map((booking) => ({
			date: new Date(booking.fromTimestamp),
			createdAt: new Date(booking.createdAt),
			id: booking.id,
		})) || []
	);
});

const now = ref(new Date());

/**
 * Fetch Booking Requests
 */

const { data: myBookingRequests } = useNuxtData<MyBookingRequestsApiResponse>('my-booking-requests');

/**
 * Delete Bookings
 */

const deleteBookingRequestLoading = ref<boolean>(false);

async function deleteBookingRequest(id: number) {
	deleteBookingRequestLoading.value = true;

	try {
		const res = await $fetch(`/api/app/bookings/requests/${id}`, {
			method: 'DELETE',
		});

		if (res) {
			await refreshNuxtData(['my-booking-requests']);

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
					onClick: () => deleteBookingRequest(id),
				},
			],
		});
	}

	deleteBookingRequestLoading.value = false;
}
</script>

<style></style>
