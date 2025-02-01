<template>
	<section class="sm:w-full lg:w-3/4 mx-auto pt-8 px-4 md:px-0">
		<ClientOnly>
			<UAlert
				v-if="!currentUserVerified"
				title="Din konto er ikke verificeret!"
				description="Du kan ikke booke fælleslokalet før din konto er verificeret. Bestyrelsen vil verificere din konto hurtigst muligt."
				icon="i-material-symbols-edit-attributes-outline-rounded"
				color="red"
				variant="subtle"
				class="mb-6"
				:actions="[
					{
						label: 'Aktiver notifikationer',
						icon: 'i-material-symbols-notification-add-outline-rounded',
						variant: 'soft',
						color: 'red',
						click: subscribeToPush,
						loading: subscribeToPushLoading,
					},
				]"
			></UAlert>

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
						:loading="onSubmitLoading || statusBookingsThisMonth === 'pending'"
						@click="onSubmit"
						:disabled="date === null || !hasReadTerms || !currentUserVerified"
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
		.filter((booking) => booking.userId !== currentUser.value?.user.id)
		.map((booking) => {
			return new Date(booking.from);
		});
});
const myBookingsThisMonth = computed<Date[]>(() => {
	if (dataBookingsThisMonth.value === null) return [];

	return dataBookingsThisMonth.value
		.filter((booking) => booking.userId === currentUser.value?.user.id)
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
	immediate: false,
});

/**
 * Current User
 */

const currentUserVerified = computed(() => {
	// We want to assume the user is verified, to not flicker the alert
	if (!currentUser.value) return true;

	return currentUser.value.user.verifiedAt !== null;
});

const { data: currentUser } = await useFetch('/api/app/users/me', {
	server: false,
	onResponse: () => {
		refreshBookingsThisMonth();
	},
	onResponseError: () => {
		toast.add({
			title: 'Der skete en fejl ved hentning af brugeroplysninger',
		});
		navigateTo('/u');
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

		const res = await $fetch('/api/app/bookings', {
			method: 'POST',
			body: {
				// Formatted as 2024-12-24
				date: format(bookAsDate, 'yyyy-MM-dd'),
			},
		});

		if (res) {
			toast.add({
				title: `Du har booket fælleslokalet - ${bookAsDate.toLocaleDateString()}`,
			});

			myBookingsThisMonth.value.push(bookAsDate);
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

const subscribeToPushLoading = ref<boolean>(false);

async function subscribeToPush() {
	subscribeToPushLoading.value = true;

	if (!isSupported.value) {
		subscribeToPushLoading.value = false;
		toast.add({
			title: 'Notifikationer er ikke understøttet på denne enhed',
		});
		return;
	}

	if (!hasPermission.value) {
		const permission = await askPermission();

		if (!permission) {
			subscribeToPushLoading.value = false;
			toast.add({
				title: 'Du har ikke givet tilladelse til at vi må sende notifikationer',
			});
			return;
		}
	}

	await subscribeUserToPush();

	subscribeToPushLoading.value = false;
}
</script>

<style></style>
