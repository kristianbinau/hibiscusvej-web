<template>
	<section class="sm:w-full lg:w-3/4 mx-auto pt-8 px-4 md:px-0">
		<div class="mb-8">
			<h1 class="text-(--ui-primary) text-2xl mt-2 mb-2">Mine bookinger</h1>
			<p>
				Her kan du se dine bookinger og slette dem hvis du har brug for det.<br />
				Bookinger kan ikke slettes hvis de er startet.
			</p>
		</div>

		<div class="flex flex-col flex-1 w-full space-y-4">
			<ClientOnly>
				<UTable
					v-model:sorting="sorting"
					:data="rows"
					:columns="columns"
					:loading="deleteBookingLoading"
					:ui="{ td: 'whitespace-nowrap' }"
				>
					<template #empty-state>
						<div
							class="flex flex-col items-center justify-center py-6 text-muted"
						>
							<div class="text-muted text-sm">Ingen bookinger fundet</div>
						</div>
					</template>
				</UTable>
			</ClientOnly>
		</div>
	</section>
</template>

<script lang="ts" setup>
import { h, resolveComponent } from 'vue';
import type { InternalApi } from 'nitropack';
import type { TableColumn } from '@nuxt/ui';
import type { Row } from '@tanstack/vue-table';
import { isAfter } from 'date-fns';

type MyBookingsApiResponse = InternalApi['/api/app/bookings/me']['get'];

const UButton = resolveComponent('UButton');
const UDropdownMenu = resolveComponent('UDropdownMenu');

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

const sorting = ref([
	{
		id: 'date',
		desc: true,
	},
]);

// Create sortable header component
function createSortableHeader(label: string) {
	return ({ column }: { column: any }) => {
		const isSorted = column.getIsSorted();

		return h(UButton, {
			color: 'neutral',
			variant: 'ghost',
			label,
			icon: isSorted
				? isSorted === 'asc'
					? 'i-lucide-arrow-up-narrow-wide'
					: 'i-lucide-arrow-down-wide-narrow'
				: 'i-lucide-arrow-up-down',
			class: '-mx-2.5 font-semibold',
			onClick: () => column.toggleSorting(column.getIsSorted() === 'asc'),
		});
	};
}

const columns: TableColumn<MyBookingRow>[] = [
	{
		accessorKey: 'date',
		header: createSortableHeader('Dato'),
		cell: ({ row }) => {
			const date = row.getValue<Date>('date');
			return date.toLocaleDateString('da-DK', {
				day: 'numeric',
				month: 'short',
				year: 'numeric',
			});
		},
		meta: {
			class: {
				th: 'text-left',
				td: 'text-left font-medium',
			},
		},
	},
	{
		accessorKey: 'createdAt',
		header: createSortableHeader('Oprettet'),
		cell: ({ row }) => {
			const date = row.getValue<Date>('createdAt');
			return date.toLocaleDateString('da-DK', {
				day: 'numeric',
				month: 'short',
				year: 'numeric',
				hour: '2-digit',
				minute: '2-digit',
				second: '2-digit',
			});
		},
		meta: {
			class: {
				th: 'text-left',
				td: 'text-left',
			},
		},
	},
	{
		id: 'actions',
		header: 'Handlinger',
		meta: {
			class: {
				th: 'text-right sr-only sm:not-sr-only',
				td: 'text-right',
			},
		},
		cell: ({ row }) => {
			const isPast = isAfter(now.value, row.getValue<Date>('date'));
			const rowItems = getRowItems(row, isPast);

			// Don't render dropdown if no items available
			if (rowItems.length <= 1) {
				return null;
			}

			return h(
				UDropdownMenu,
				{
					content: {
						align: 'end',
					},
					items: rowItems,
					'aria-label': 'Actions dropdown',
				},
				() =>
					h(UButton, {
						icon: 'i-lucide-ellipsis-vertical',
						color: 'neutral',
						variant: 'ghost',
						size: 'sm',
						'aria-label': 'Actions dropdown',
					}),
			);
		},
	},
];

function getRowItems(row: Row<MyBookingRow>, isPast: boolean) {
	const bookingId = row.original.id;
	const actions = [];

	// Copy action
	actions.push([
		{
			type: 'label' as const,
			label: 'Handlinger',
		},
	]);

	// Delete action if not in the past
	if (!isPast) {
		actions.push([
			{
				type: 'separator' as const,
			},
			{
				label: 'Slet booking',
				icon: 'i-lucide-trash',
				color: 'error' as const,
				onSelect() {
					deleteBooking(bookingId);
				},
			},
		]);
	}

	return actions.flat();
}

const rows = computed<MyBookingRow[]>(() => {
	return (
		myBookings.value?.map((booking) => ({
			date: new Date(booking.fromTimestamp),
			createdAt: new Date(booking.createdAt),
			id: booking.id,
		})) || []
	);
});

const now = ref(new Date());

/**
 * Fetch Bookings
 */

const { data: myBookings } = useNuxtData<MyBookingsApiResponse>('my-bookings');

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
			await refreshNuxtData(['my-bookings']);

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
