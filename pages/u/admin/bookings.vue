<template>
	<section class="sm:w-full lg:w-3/4 mx-auto pt-8 px-4 md:px-0">
		<div class="mb-8">
			<h1 class="text-primary text-2xl mt-2 mb-2">Bookings</h1>
			<p>Her kan vi se alle bookings.</p>
		</div>

		<ClientOnly>
			<UTable :loading="fetching" :rows="rows" :columns="columns">
				<template #userId-data="{ row }">
					<UTooltip v-if="row.userId !== 0" text="Klik for at se bruger">
						<UButton
							@click="openUser(row.userId)"
							class="cursor-pointer select-none"
							color="primary"
							icon="i-material-symbols-open-in-new"
							:label="String(row.userId)"
						/>
					</UTooltip>

					<UTooltip v-else text="System bruger">
						<UButton
							class="cursor-pointer select-none"
							color="primary"
							icon="i-material-symbols-verified-user-outline-rounded"
							:label="String(row.userId)"
						/>
					</UTooltip>
				</template>

				<template #actions-data="{ row }">
					<UPopover
						class="mr-auto"
						:popper="{ placement: 'top-start' }"
						overlay
					>
						<UTooltip text="Klik for at fjerne booking">
							<UButton
								size="md"
								icon="i-material-symbols-delete-outline"
								label="Slet"
								color="red"
								variant="soft"
								:disabled="isAfter(now, row.fromDate)"
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
									color="red"
									variant="soft"
									size="xs"
									@click="deleteBooking(row.id)"
									:loading="deleteBookingLoading"
									class="mt-4"
								/>
							</div>
						</template>
					</UPopover>
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
					:showClose="true"
					@close="isUserSlideOpen = false"
				/>
			</USlideover>
		</ClientOnly>
	</section>
</template>

<script lang="ts" setup>
import type { AdminBookingsApiResponse } from '~/utils/types/admin';

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
	{
		key: 'actions',
		label: 'Handlinger',
	},
];

const rows = computed(() => {
	return bookingsJoined.value.map((booking) => {
		return {
			...booking,
			date: new Date(booking.from).toLocaleDateString(),
			createdAt: new Date(booking.createdAt).toLocaleString(),
			updatedAt: new Date(booking.updatedAt).toLocaleString(),
			actions: booking.id,
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
					click: () => reloadNuxtApp(),
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
					click: () => deleteBooking(id),
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
