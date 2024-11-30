<template>
	<section class="sm:w-full lg:w-3/4 mx-auto pt-8 px-4 md:px-0">
		<div class="flex justify-center flex-wrap md:flex-nowrap mx-auto gap-6">
			<div>
				<h1 class="text-primary text-2xl mt-2 mb-2">Book fælleslokalet</h1>
				<p>
					Hver booking er fra kl. 10:00 til kl. 10:00 dagen efter.<br />
					Du kan fjerne din booking indtil 24 timer før start. <br />
					Dine bookinger kan ses under
					<ULink
						to="/u/communal/me"
						class="text-gray-500 underline hover:text-gray-600 dark:hover:text-gray-400"
						>Mine bookinger</ULink
					>.
				</p>
			</div>
			<div class="flex flex-col">
				<DatePicker
					v-model="date"
					:attributes="attributes"
					:minDate="new Date()"
					@didMove="onDidMove"
				/>
				<UButton @click="onSubmit" :disabled="date === null">Book</UButton>
			</div>
		</div>
	</section>
</template>

<script lang="ts" setup>
import type { AttributeConfig } from 'v-calendar/dist/types/src/utils/attribute.d.ts';
import type { Page } from 'v-calendar/dist/types/src/utils/page.js';
import { format, isSameDay } from 'date-fns';

definePageMeta({
	layout: 'logged-in',
	middleware: 'auth-required',
});

const toast = useToast();

const date = ref<Date | null>(null);
const year = ref<number>(new Date().getFullYear());
const month = ref<number>(new Date().getMonth() + 1);

watch(date, async (newDate) => {
	if (newDate) {
		const bookingOnDayExists = bookingsThisMonth.value.some((booking) =>
			isSameDay(booking, newDate),
		);
		if (bookingOnDayExists) {
			toast.add({ title: 'Der er allerede en booking den dag' });
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
	];
});

function onDidMove(pages: Page[]) {
	const firstPage = pages[0];

	if (!firstPage) return;

	year.value = firstPage.year;
	month.value = firstPage.month;

	fetchBookingsThisMonth();
}

/**
 * Bookings
 */
const bookingsThisMonth = ref<Date[]>([]);
const fetchingBookings = ref(true);

async function fetchBookingsThisMonth() {
	fetchingBookings.value = true;

	try {
		const { data } = await useFetch('/api/bookings', {
			params: {
				year: year.value.toString(),
				month: month.value.toString(),
			},
		});

		if (data.value === null) {
			fetchingBookings.value = false;
			return;
		}

		bookingsThisMonth.value = data.value.map((booking) => {
			return new Date(booking.from);
		});
	} catch (error) {
		toast.add({
			title: 'Der skete en fejl ved hentning af bookings, genindlæs siden',
		});
		fetchingBookings.value = false;
	}

	fetchingBookings.value = false;
}
fetchBookingsThisMonth();

async function onSubmit() {
	if (!date.value) return;

	try {
		console.log(date.value);

		const res = await $fetch('/api/bookings', {
			method: 'POST',
			body: {
				// Formatted as 2024-12-24
				date: format(date.value, 'yyyy-MM-dd'),
			},
		});

		if (res) {
			toast.add({
				title: `Du har booket fælleslokalet - ${date.value.toLocaleDateString()}`,
			});

			bookingsThisMonth.value.push(date.value);
			date.value = null;
		}
	} catch (error: any) {
		if (error.statusCode === 409) {
			toast.add({ title: 'Der er allerede en booking i det tidsrum' });
		} else {
			if (error.statusMessage) {
				toast.add({ title: error.statusMessage });
			} else {
				toast.add({ title: 'Der skete en fejl' });
			}
		}
	}
}
</script>

<style></style>
