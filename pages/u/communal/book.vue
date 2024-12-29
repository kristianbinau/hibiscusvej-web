<template>
	<section class="sm:w-full lg:w-3/4 mx-auto pt-8 px-4 md:px-0">
		<ClientOnly>
			<UAlert
				v-if="currentUser && currentUser.user.verifiedAt === null"
				title="Din konto er ikke verificeret!"
				description="Du kan ikke booke fælleslokalet før din konto er verificeret. Bestyrelsen vil verificere din konto hurtigst muligt."
				icon="i-material-symbols-edit-attributes-outline-rounded"
				color="red"
				variant="subtle"
				class="mb-6 cursor-pointer select-none"
				@click="onClickNotVerified"
			></UAlert>
		</ClientOnly>

		<ClientOnly>
			<div class="flex justify-center flex-wrap md:flex-nowrap mx-auto gap-6">
				<div>
					<h1 class="text-primary text-2xl mt-2 mb-2">Book fælleslokalet</h1>
					<p>
						Hver booking er fra kl. 10:00 til kl. 10:00 dagen efter.<br />
						Du kan fjerne din booking indtil før den starter. <br />
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

					<UCheckbox v-model="hasReadTerms" class="my-4">
						<template #label>
							<span class="select-none">
								Jeg har læst og accepteret
								<ULink
									to="/communal"
									target="_blank"
									class="text-gray-500 underline hover:text-gray-600 dark:hover:text-gray-400"
									>reglerne</ULink
								>.
							</span>
						</template>
					</UCheckbox>

					<UButton
						:loading="onSubmitLoading"
						@click="onSubmit"
						:disabled="date === null || !hasReadTerms"
						>Book</UButton
					>
				</div>
			</div>
		</ClientOnly>
	</section>
</template>

<script lang="ts" setup>
import type { AttributeConfig } from 'v-calendar/dist/types/src/utils/attribute.d.ts';
import type { Page } from 'v-calendar/dist/types/src/utils/page.js';
import { format, isSameDay } from 'date-fns';

import type { InternalApi } from 'nitropack';
type CurrentUserResponse = InternalApi['/api/users/me']['get'];

definePageMeta({
	layout: 'logged-in',
	middleware: 'auth-required',
});

useHead({
	title: 'Book fælleslokalet',
});

const toast = useToast();

const hasReadTerms = ref(false);
const date = ref<Date | null>(null);
const year = ref<number>(new Date().getFullYear());
const month = ref<number>(new Date().getMonth() + 1);

watch(date, async (newDate) => {
	if (newDate) {
		const alreadyBooked = bookingsThisMonth.value.some((booking) =>
			isSameDay(booking, newDate),
		);

		const alreadyBookedByUser = myBookingsThisMonth.value.some((booking) =>
			isSameDay(booking, newDate),
		);

		if (alreadyBooked) {
			toast.add({ title: 'Der er allerede en booking den dag' });
			date.value = null;
		}

		if (alreadyBookedByUser) {
			toast.add({ title: 'Du har allerede booket den dag' });
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

	year.value = firstPage.year;
	month.value = firstPage.month;

	fetchBookingsThisMonth();
}

/**
 * Bookings
 */

const bookingsThisMonth = ref<Date[]>([]);
const myBookingsThisMonth = ref<Date[]>([]);
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

		bookingsThisMonth.value = data.value
			.filter((booking) => booking.userId !== currentUser.value?.user.id)
			.map((booking) => {
				return new Date(booking.from);
			});
		myBookingsThisMonth.value = data.value
			.filter((booking) => booking.userId === currentUser.value?.user.id)
			.map((booking) => {
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

/**
 * Current User
 */

const currentUser = ref<CurrentUserResponse | null>(null);

async function fetchCurrentUser() {
	try {
		const { data } = await useFetch('/api/users/me');

		if (data.value === null) {
			toast.add({
				title: 'Der skete en fejl ved hentning af brugeroplysninger',
			});
			currentUser.value = null;
			return;
		}

		currentUser.value = data.value;
	} catch (error) {
		toast.add({
			title: 'Der skete en fejl ved hentning af brugeroplysninger',
		});
	}
}
fetchCurrentUser();

/**
 * Submit
 */

const onSubmitLoading = ref<boolean>(false);

async function onSubmit() {
	if (!date.value) return;

	onSubmitLoading.value = true;

	try {
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

			myBookingsThisMonth.value.push(date.value);
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

	onSubmitLoading.value = false;
}

/**
 * Push Notifications
 */
const { isSupported, hasPermission, askPermission, subscribeUserToPush } =
	usePush();

async function onClickNotVerified() {
	if (!isSupported.value) {
		return;
	}

	if (!hasPermission.value) {
		const permission = await askPermission();

		if (!permission) {
			return;
		}
	}

	const pushSubscription = await subscribeUserToPush();
}
</script>

<style></style>
