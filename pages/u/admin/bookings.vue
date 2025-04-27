<template>
	<section class="sm:w-full lg:w-3/4 mx-auto pt-8 px-4 md:px-0">
		<div class="mb-8">
			<h1 class="text-(--ui-primary) text-2xl mt-2 mb-2">Bookings</h1>
			<p>Her kan vi se alle bookings.</p>
		</div>

		<AdminBookingCalendar
			@update:userId="($event) => (filteredByUserId = $event)"
			class="mb-8"
		/>

		<ClientOnly>
			<UTable :loading="fetching" :data="rows" :columns="columns">
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

				<template #actions-cell="{ row }">
					<UPopover
						class="mr-auto"
						:content="{
							align: 'start',
							side: 'top',
						}"
					>
						<UTooltip text="Klik for at fjerne booking">
							<UButton
								size="md"
								icon="i-material-symbols-delete-outline"
								label="Slet"
								color="error"
								variant="soft"
								:disabled="isAfter(now, row.getValue<Date>('date'))"
								:loading="deleteBookingLoading"
							/>
						</UTooltip>

						<template #content>
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
									@click="deleteBooking(row.getValue('id'))"
									:loading="deleteBookingLoading"
									class="mt-4"
								/>
							</div>
						</template>
					</UPopover>
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
import type { AdminBookingsApiResponse } from '~/utils/types/admin';
import type { TableColumn } from '@nuxt/ui';

import { isAfter } from 'date-fns';

definePageMeta({
	layout: 'logged-in-admin',
	middleware: 'admin-required',
});

useHead({
	title: 'Admin: Bookings',
});

const toast = useToast();
const now = ref(new Date());

const filteredByUserId = ref<number | null>(null);

type BookingRow = {
	id: number;
	userId: number;
	date: Date;
	createdAt: Date;
	updatedAt: Date;
};

const columns: TableColumn<BookingRow>[] = [
	{
		accessorKey: 'id',
		header: 'ID',
	},
	{
		accessorKey: 'userId',
		header: 'UserId',
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
		accessorKey: 'updatedAt',
		header: 'Opdateret',
		cell: ({ row }) => row.getValue<Date>('updatedAt').toLocaleDateString(),
	},
	{
		accessorKey: 'actions',
		header: 'Handlinger',
	},
];

const rows = computed<BookingRow[]>(() => {
	return bookingsJoined.value
		.map((booking) => {
			return {
				...booking,
				date: new Date(booking.from),
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
		const { data } = await useFetch('/api/app/admin/bookings');

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
			icon: 'i-material-symbols-error-outline-rounded',
			title: 'Fejl!',
			description: 'Der skete en fejl...',
			actions: [
				{
					label: 'Genindlæs siden',
					onClick: () => reloadNuxtApp(),
				},
			],
		});
	}

	fetching.value = false;
}
fetch();

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
			response.value.communalBookings = response.value.communalBookings.filter(
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
