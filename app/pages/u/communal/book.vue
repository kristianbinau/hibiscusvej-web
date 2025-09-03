<template>
	<section class="sm:w-full lg:w-3/4 mx-auto pt-8 px-4 md:px-0">
		<ClientOnly>
			<UAlert
				v-if="!currentUserVerified"
				title="Din konto er ikke verificeret!"
				description="Du kan ikke booke fælleslokalet før din konto er verificeret. Bestyrelsen vil verificere din konto hurtigst muligt."
				icon="i-material-symbols-edit-attributes-outline-rounded"
				color="error"
				variant="subtle"
				class="mb-6"
				:actions="[
					{
						label: 'Aktiver notifikationer',
						icon: 'i-material-symbols-notification-add-outline-rounded',
						variant: 'soft',
						color: 'error',
						onClick: subscribeToPush,
						loading: subscribeToPushLoading,
					},
				]"
			></UAlert>

			<div
				v-show="currentUser"
				class="flex justify-center flex-wrap md:flex-nowrap mx-auto gap-6"
			>
				<div>
					<h1 class="text-(--ui-primary) text-2xl mt-2 mb-2">
						Book fælleslokalet
					</h1>
					<p>
						Hver booking er fra kl. 10:00 til kl. 10:00 dagen efter.<br />
						Du kan fjerne din booking indtil før den starter. <br />
						Dine bookinger kan ses under
						<ULink
							to="/u/communal/me"
							class="text-neutral-500 underline hover:text-neutral-600 dark:hover:text-neutral-400"
							>Mine bookinger</ULink
						>.
					</p>
				</div>
				<div class="flex flex-col">
					<BookingCalendar
						ref="bookingCalendar"
						v-if="currentUser"
						@update:modelValue="($event: Date) => (date = $event)"
						:userId="currentUser.auth.user.id"
					/>

					<UCheckbox v-model="hasReadTerms" class="my-4">
						<template #label>
							<span class="select-none">
								Jeg har læst og accepteret
								<ULink
									to="/communal"
									target="_blank"
									class="text-neutral-500 underline hover:text-neutral-600 dark:hover:text-neutral-400"
									>reglerne</ULink
								>.
							</span>
						</template>
					</UCheckbox>

					<UButton
						:loading="onSubmitLoading"
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
import { format } from 'date-fns';

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

const bookingCalendarRef = useTemplateRef('bookingCalendar');

/**
 * Current User
 */

const currentUserVerified = computed(() => {
	// We want to assume the user is verified, to not flicker the alert
	if (!currentUser.value) return true;

	return currentUser.value.user.verifiedAt !== null;
});

const { data: currentUser, refresh: currentUserRefresh } = await useFetch(
	'/api/app/users/me',
	{
		server: false,
		onResponseError: () => {
			toast.add({
				icon: 'i-material-symbols-error-outline-rounded',
				title: 'Fejl!',
				description: 'Der skete en fejl...',
				actions: [
					{
						label: 'Prøv igen',
						onClick: () => currentUserRefresh(),
					},
				],
			});
			navigateTo('/u');
		},
	},
);

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
			await bookingCalendarRef.value?.addBooking(bookAsDate);

			toast.add({
				icon: 'i-material-symbols-check-circle-outline-rounded',
				title: 'Success!',
				description: `Du har booket fælleslokalet - ${bookAsDate.toLocaleDateString()}`,
			});
		}
	} catch (error: any) {
		if (error.statusCode === 409) {
			toast.add({
				icon: 'i-material-symbols-error-outline-rounded',
				title: 'Mislykkes!',
				description: 'Der er allerede en booking i det tidsrum',
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
							onClick: onSubmit,
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
							onClick: onSubmit,
						},
					],
				});
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
			icon: 'i-material-symbols-warning-outline-rounded',
			title: 'Advarsel!',
			description: 'Notifikationer er ikke understøttet på denne enhed',
		});
		return;
	}

	if (!hasPermission.value) {
		const permission = await askPermission();

		if (!permission) {
			subscribeToPushLoading.value = false;
			toast.add({
				icon: 'i-material-symbols-error-outline-rounded',
				title: 'Fejl!',
				description:
					'Du har ikke givet tilladelse til at vi må sende notifikationer',
			});
			return;
		}
	}

	await subscribeUserToPush();

	subscribeToPushLoading.value = false;
}
</script>

<style></style>
