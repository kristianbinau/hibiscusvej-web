<template>
	<section class="sm:w-full lg:w-3/4 mx-auto pt-8 px-4 md:px-0">
		<div class="mb-8">
			<h1 class="text-(--ui-primary) text-2xl mt-2 mb-2">Booking Requests</h1>
			<p>Her kan vi se alle booking anmodninger.</p>
			<p>Booking anmodninger skal håndteres af en administrator.</p>
		</div>

		<ClientOnly>
			<UTable :data="rows" :columns="columns">
				<template #userId-cell="{ row }">
					<UTooltip
						v-if="row.getValue('userId') !== 0"
						text="Klik for at se bruger"
					>
						<UButton
							@click="openUser(row.getValue('userId'))"
							class="cursor-pointer select-none"
							color="primary"
							icon="i-material-symbols-open-in-new"
							:label="String(row.getValue('userId'))"
						/>
					</UTooltip>

					<UTooltip v-else text="System bruger">
						<UButton
							class="cursor-pointer select-none"
							color="primary"
							icon="i-material-symbols-verified-user-outline-rounded"
							:label="String(row.getValue('userId'))"
						/>
					</UTooltip>
				</template>

				<template #id-cell="{ row }">
					<UTooltip
						v-if="row.getValue<Date | null>('handledAt') === null"
						text="Klik for at håndtere anmodning"
					>
						<UButton
							@click="openBookingRequestHandlingModal(row.getValue('id'))"
							size="md"
							icon="i-material-symbols-open-in-new"
							label="Håndter"
							color="primary"
							:disabled="isAfter(now, row.getValue<Date>('date'))"
						/>
					</UTooltip>

					<UBadge
						v-else
						size="md"
						icon="i-material-symbols-check"
						color="success"
						variant="solid"
					>
						Håndteret
					</UBadge>
				</template>
			</UTable>

			<USlideover
				v-model:open="isUserSlideOpen"
				:ui="{
					content: '!max-w-3xl',
				}"
				@after:leave="atUserSlideClose()"
			>
				<template #content>
					<!-- TODO: Implement Sync between AdminUser & Users page-->
					<AdminUser
						v-if="selectedUserIdForSlide"
						:userId="selectedUserIdForSlide"
						:showPersons="true"
						:showLogins="true"
						:showSessions="true"
						:showBookings="true"
						:showRepremands="true"
						:showClose="true"
						@close="isUserSlideOpen = false"
					/>
				</template>
			</USlideover>
		</ClientOnly>
	</section>
</template>

<script lang="ts" setup>
import type { TableColumn } from '@nuxt/ui';

import { isAfter } from 'date-fns';

definePageMeta({
	layout: 'logged-in-admin',
	middleware: 'admin-required',
});

useHead({
	title: 'Admin: Booking Requests',
});

const toast = useToast();
const now = ref(new Date());

const filteredByUserId = ref<number | null>(null);

type BookingRow = {
	id: number;
	userId: number;
	date: Date;
	handledText: string | null;
	handledAt: Date | null;
	createdAt: Date;
	updatedAt: Date;
};

const columns: TableColumn<BookingRow>[] = [
	{
		accessorKey: 'id',
		header: 'Status',
	},
	{
		accessorKey: 'userId',
		header: 'UserId',
	},
	{
		accessorKey: 'date',
		header: 'Date',
		cell: ({ row }) => row.getValue<Date>('date').toLocaleDateString(),
	},
	{
		accessorKey: 'handledText',
		header: 'Text From Admin',
	},
	{
		accessorKey: 'createdAt',
		header: 'Requested At',
		cell: ({ row }) => row.getValue<Date>('createdAt').toLocaleDateString(),
	},
	{
		accessorKey: 'handledAt',
		header: 'Handled At',
		cell: ({ row }) =>
			row.getValue<Date | null>('handledAt')?.toLocaleDateString() ??
			'Unhandled',
	},
];

const rows = computed<BookingRow[]>(() => {
	return bookingsJoined.value
		.map((booking) => {
			return {
				...booking,
				date: new Date(booking.fromTimestamp),
				handledAt: booking.handledAt ? new Date(booking.handledAt) : null,
				createdAt: new Date(booking.createdAt),
				updatedAt: new Date(booking.updatedAt),
				actions: booking.id,
			};
		})
		.filter((booking) => {
			if (filteredByUserId.value) {
				return booking.userId === filteredByUserId.value;
			}

			return true;
		});
});

/**
 * Fetch Admin Bookings endpoint
 */

/**
 * Join bookings into one array
 */
const bookingsJoined = computed(() => {
	if (!response.value) return [];

	return response.value.communalBookingRequests.map((communalBooking) => {
		return {
			...communalBooking,
		};
	});
});

const { data: response } = await useFetch('/api/app/admin/bookings/requests', {
	key: 'admin-booking-requests',
});

/**
 * Delete Bookings
 */

const deleteBookingLoading = ref<boolean>(false);

async function deleteBooking(id: number) {
	deleteBookingLoading.value = true;

	try {
		const res = await $fetch(`/api/app/admin/bookings/${id}/delete`, {
			method: 'POST',
		});

		if (res) {
			await refreshNuxtData(['admin-booking-requests']);

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
	refreshNuxtData(['admin-booking-requests']);
}

/**
 * Booking Request Handling
 */

import { AdminBookingRequestHandlingModal } from '#components';

const overlay = useOverlay();
const bookingRequestHandlingModal = overlay.create(
	AdminBookingRequestHandlingModal,
);

async function openBookingRequestHandlingModal(id: number) {
	const bookingRequest = bookingsJoined.value.find((b) => b.id === id);
	if (!bookingRequest) return;

	await bookingRequestHandlingModal.open({ bookingRequest: bookingRequest });
	refreshNuxtData(['admin-booking-requests']);
}
</script>

<style></style>
