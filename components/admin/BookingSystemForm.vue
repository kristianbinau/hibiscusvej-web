<template>
	<UCard class="mt-4 mb-12 w-fit">
		<template #header>
			<h2 class="text-lg flex justify-between">
				System Booking <UBadge color="amber">Warning</UBadge>
			</h2>

			<p>Book som system.</p>
		</template>

		<DatePicker
			v-model="date"
			:attributes="attributes"
			:minDate="new Date()"
			@didMove="onDidMove"
			class="mx-4"
		/>

		<template #footer>
			<UButton
				:loading="onSubmitLoading || statusBookingsThisMonth === 'pending'"
				@click="onSubmit"
				:disabled="date === null || statusBookingsThisMonth !== 'success'"
				>Book as System</UButton
			>
		</template>
	</UCard>
</template>

<script lang="ts" setup>
import type { AttributeConfig } from 'v-calendar/dist/types/src/utils/attribute.d.ts';
import type { Page } from 'v-calendar/dist/types/src/utils/page.js';
import { format, isSameDay } from 'date-fns';

const toast = useToast();

const date = ref<Date | null>(null);
const year = ref<string>(new Date().getFullYear().toString());
const month = ref<string>((new Date().getMonth() + 1).toString());

watch(date, async (newDate) => {
	if (newDate) {
		const alreadyBooked = bookingsThisMonth.value.some((booking) =>
			isSameDay(booking, newDate),
		);

		const alreadyBookedByUser = myBookingsThisMonth.value.some((booking) =>
			isSameDay(booking, newDate),
		);

		if (alreadyBooked) {
			toast.add({
				icon: 'i-material-symbols-error-outline-rounded',
				title: 'Mislykkes!',
				description: 'Der er allerede en booking på den dag',
			});
			date.value = null;
		}

		if (alreadyBookedByUser) {
			toast.add({
				icon: 'i-material-symbols-error-outline-rounded',
				title: 'Mislykkes!',
				description: 'Systemet har allerede booket på den dag',
			});
			date.value = null;
		}
	}
});

const attributes: Ref<AttributeConfig[]> = computed(() => {
	return [
		{
			highlight: 'red',
			dates: bookingsThisMonth.value,
			order: 0,
		},
		{
			highlight: 'blue',
			dates: myBookingsThisMonth.value,
			order: 1,
		},
	];
});

function onDidMove(pages: Page[]) {
	const firstPage = pages[0];

	if (!firstPage) return;

	year.value = firstPage.year.toString();
	month.value = firstPage.month.toString();

	refreshBookingsThisMonth();
}

/**
 * Bookings
 */

const bookingsThisMonth = computed<Date[]>(() => {
	if (dataBookingsThisMonth.value === null) return [];

	return dataBookingsThisMonth.value
		.filter((booking) => booking.userId !== 0) // 0 is System
		.map((booking) => {
			return new Date(booking.from);
		});
});
const myBookingsThisMonth = computed<Date[]>(() => {
	if (dataBookingsThisMonth.value === null) return [];

	return dataBookingsThisMonth.value
		.filter((booking) => booking.userId === 0) // 0 is System
		.map((booking) => {
			return new Date(booking.from);
		});
});

const {
	data: dataBookingsThisMonth,
	refresh: refreshBookingsThisMonth,
	status: statusBookingsThisMonth,
} = await useFetch('/api/app/bookings', {
	params: {
		year: year,
		month: month,
	},
});

/**
 * Submit
 */

const onSubmitLoading = ref<boolean>(false);

async function onSubmit() {
	if (!date.value) return;

	onSubmitLoading.value = true;

	try {
		const bookAsDate = date.value;

		const res = await $fetch('/api/app/admin/bookings/system', {
			method: 'POST',
			body: {
				// Formatted as 2024-12-24
				date: format(bookAsDate, 'yyyy-MM-dd'),
			},
		});

		if (res) {
			toast.add({
				icon: 'i-material-symbols-check-circle-outline-rounded',
				title: 'Success!',
				description: `Systemet har booket fælleslokalet - ${bookAsDate.toLocaleDateString()}`,
			});

			myBookingsThisMonth.value.push(bookAsDate);
			date.value = null;
		}
	} catch (error: any) {
		if (error.statusCode === 409) {
			toast.add({
				icon: 'i-material-symbols-error-outline-rounded',
				title: 'Mislykkes!',
				description: 'Der er allerede en booking på den dag',
			});
		} else {
			if (error.statusMessage) {
				toast.add({
					icon: 'i-material-symbols-error-outline-rounded',
					title: 'Fejl!',
					description: error.statusMessage,
					actions: [
						{
							label: 'Prøv igen',
							click: onSubmit,
						},
					],
				});
			} else {
				toast.add({
					icon: 'i-material-symbols-error-outline-rounded',
					title: 'Fejl!',
					description: 'Der skete en fejl...',
					actions: [
						{
							label: 'Prøv igen',
							click: onSubmit,
						},
					],
				});
			}
		}
	}

	onSubmitLoading.value = false;
}
</script>

<style></style>
