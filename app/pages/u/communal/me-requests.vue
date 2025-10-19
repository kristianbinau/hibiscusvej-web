<template>
	<section class="sm:w-full lg:w-3/4 mx-auto pt-8 px-4 md:px-0">
		<div class="mb-8">
			<h1 class="text-(--ui-primary) text-2xl mt-2 mb-2">
				Mine booking anmodninger
			</h1>
			<p>
				Her kan du se dine booking anmodninger og slette dem hvis du har brug
				for det.<br />
				Anmodninger kan ikke slettes efter de er blevet håndteret.
			</p>
		</div>

		<ClientOnly>
			<UTable
				v-model:expanded="expanded"
				v-model:column-visibility="columnVisibility"
				:data="rows"
				:columns="columns"
				:ui="{ tr: 'data-[expanded=true]:bg-elevated/50' }"
			>
				<template #handledAt-cell="{ row }">
					<UBadge
						v-if="row.getValue<boolean | null>('permitted') === null"
						label="Afventer"
						color="warning"
					/>

					<UBadge
						v-else-if="row.getValue<boolean>('permitted')"
						label="Godkendt"
						color="success"
					/>
					<UBadge v-else label="Afvist" color="error" />
				</template>

				<template #id-cell="{ row }">
					<UTooltip text="Klik for at fjerne booking anmodning">
						<UButton
							size="md"
							label="Slet denne anmodning"
							color="error"
							variant="soft"
							:disabled="
								isAfter(now, row.getValue<Date>('date')) ||
								row.getValue<Date | null>('handledAt') !== null
							"
							@click="deleteBookingRequest(row.getValue('id'))"
							:loading="deleteBookingRequestLoading"
						/>
					</UTooltip>
				</template>

				<template #expanded="{ row }">
					<div class="flex flex-col gap-4">
						<UFormField label="Din Begrundelse">
							<p>{{ row.getValue('requestText') }}</p>
						</UFormField>

						<UFormField label="Administrators Beslutning">
							<UBadge
								v-if="row.getValue<boolean | null>('permitted') === null"
								label="Afventer"
								color="warning"
							/>

							<UBadge
								v-else-if="row.getValue<boolean>('permitted')"
								label="Godkendt"
								color="success"
							/>
							<UBadge v-else label="Afvist" color="error" />
						</UFormField>

						<UFormField
							v-if="row.getValue<string | null>('handledText') !== null"
							label="Administrators Forklaring"
						>
							<p>
								{{ row.getValue('handledText') }}
							</p>
						</UFormField>
					</div>
				</template>
			</UTable>
		</ClientOnly>
	</section>
</template>

<script lang="ts" setup>
import { h, resolveComponent } from 'vue';
import type { InternalApi } from 'nitropack';
import type { TableColumn } from '@nuxt/ui';
type MyBookingRequestsApiResponse =
	InternalApi['/api/app/bookings/requests/me']['get'];

import { isAfter } from 'date-fns';

const UButton = resolveComponent('UButton');
const UBadge = resolveComponent('UBadge');

definePageMeta({
	layout: 'logged-in',
	middleware: 'auth-required',
});

useHead({
	title: 'Mine bookinger',
});

const toast = useToast();

type MyBookingRequestRow = {
	date: Date;
	createdAt: Date;
	requestText: string | null;
	handledText: string | null;
	handledAt: Date | null;
	permitted: boolean | null;
	id: number;
};

const columns: TableColumn<MyBookingRequestRow>[] = [
	{
		id: 'expand',
		cell: ({ row }) =>
			h(UButton, {
				color: 'neutral',
				variant: 'ghost',
				icon: 'i-lucide-chevron-down',
				square: true,
				'aria-label': 'Expand',
				ui: {
					leadingIcon: [
						'transition-transform',
						row.getIsExpanded() ? 'duration-200 rotate-180' : '',
					],
				},
				onClick: () => row.toggleExpanded(),
			}),
	},
	{
		accessorKey: 'handledAt',
		header: 'Status',
	},
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
	{
		accessorKey: 'handledText',
		header: 'Håndteret Tekst',
	},
	{
		accessorKey: 'requestText',
		header: 'Anmodnings Tekst',
	},
	{
		accessorKey: 'permitted',
		header: 'Tilladt',
	},
];

const rows = computed<MyBookingRequestRow[]>(() => {
	return (
		myBookingRequests.value?.map((booking) => ({
			date: new Date(booking.fromTimestamp),
			requestText: booking.requestText,
			handledText: booking.handledText,
			permitted: booking.permitted,
			createdAt: new Date(booking.createdAt),
			handledAt: booking.handledAt ? new Date(booking.handledAt) : null,
			id: booking.id,
		})) || []
	);
});

const expanded = ref({});

const columnVisibility = ref({
	handledText: false,
	requestText: false,
	permitted: false,
});

const now = ref(new Date());

/**
 * Fetch Booking Requests
 */

const { data: myBookingRequests } = useNuxtData<MyBookingRequestsApiResponse>(
	'my-booking-requests',
);

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
				description: 'Booking anmodning blev slettet',
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
