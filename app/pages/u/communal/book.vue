<template>
	<section class="sm:w-full lg:w-3/4 mx-auto pt-8 px-4 md:px-0">
		<ClientOnly>
			<UAlert
				v-if="!currentUserVerified"
				:title="t('booking.notVerified.title')"
				:description="t('booking.notVerified.description')"
				icon="i-material-symbols-edit-attributes-outline-rounded"
				color="error"
				variant="subtle"
				class="mb-6"
				:actions="[
					{
						label: t('booking.enableNotifications'),
						icon: 'i-material-symbols-notification-add-outline-rounded',
						variant: 'soft',
						color: 'error',
						onClick: subscribeToPush,
						loading: subscribeToPushLoading,
					},
				]"
			></UAlert>

			<UAlert
				v-if="currentUserWarned"
				:title="t('common.warning')"
				:description="t('booking.warned')"
				icon="i-material-symbols-warning-outline-rounded"
				color="warning"
				variant="subtle"
				class="mb-6"
			></UAlert>

			<UAlert
				v-if="currentUserBanned"
				:title="t('booking.banned.title')"
				:description="t('booking.banned.description')"
				icon="i-material-symbols-dangerous-outline-rounded"
				color="error"
				variant="subtle"
				class="mb-6"
			></UAlert>

			<div
				v-show="currentUser"
				class="flex justify-center flex-wrap md:flex-nowrap mx-auto gap-6"
			>
				<div>
					<h1 class="text-(--ui-primary) text-2xl mt-2 mb-2">
						{{ t('booking.title') }}
					</h1>
					<p>
						{{ t('booking.intro.timing') }}<br />
						{{ t('booking.intro.deletable') }} <br />
						{{ t('booking.intro.seeBookings') }}
						<ULink
							:to="localePath('/u/communal/me')"
							class="text-neutral-500 underline hover:text-neutral-600 dark:hover:text-neutral-400"
							>{{ t('nav.myBookings') }}</ULink
						>.
					</p>
					<br />
					<!-- Speaker Announcement: Added 2026/03/07 -->
					<div
						class="max-w-[368px] mt-3 p-3 bg-success-50 dark:bg-success-900/20 border border-success-200 dark:border-success-800 rounded-lg"
					>
						<div class="flex items-start gap-2">
							<UBadge
								variant="solid"
								color="success"
								size="xs"
								class="font-bold mt-0.5"
							>
								{{ t('booking.speaker.badge') }}
							</UBadge>
							<p class="text-sm">
								<strong>{{ t('booking.speaker.heading') }}</strong>
								<br />
								{{ t('booking.speaker.body') }}
								<a
									href="mailto:hibiscusvejbestyrelse@outlook.dk"
									class="text-success-600 dark:text-success-400 underline hover:text-success-700 dark:hover:text-success-300"
								>
									hibiscusvejbestyrelse@outlook.dk </a
								>{{ t('booking.speaker.bodyOutro') }}
							</p>
						</div>
					</div>
				</div>
				<div class="flex flex-col">
					<BookingCalendar
						ref="bookingCalendar"
						v-if="currentUser"
						@update:modelValue="($event: Date | null) => (date = $event)"
						:userId="currentUser.auth.user.id"
					/>

					<UCheckbox v-model="hasReadTerms" class="my-4">
						<template #label>
							<span class="select-none">
								{{ t('booking.readTerms') }}
								<ULink
									:to="localePath('/communal')"
									target="_blank"
									class="text-neutral-500 underline hover:text-neutral-600 dark:hover:text-neutral-400"
									>{{ t('booking.rulesLink') }}</ULink
								>.
							</span>
						</template>
					</UCheckbox>

					<UButton
						:loading="onSubmitLoading"
						@click="onSubmit"
						:disabled="
							date === null ||
							!hasReadTerms ||
							!currentUserVerified ||
							currentUserBanned
						"
						>{{ t('booking.submit') }}</UButton
					>
				</div>
			</div>
		</ClientOnly>
	</section>
</template>

<script lang="ts" setup>
import { format } from 'date-fns';
import { LazyBookingRequestModal } from '#components';

definePageMeta({
	layout: 'logged-in',
	middleware: 'auth-required',
});

const { t } = useI18n();
const localePath = useLocalePath();
const { formatDate } = useLocaleDate();

useHead({
	title: () => t('booking.title'),
});

const toast = useToast();
const overlay = useOverlay();

const hasReadTerms = ref(false);
const date = ref<Date | null>(null);

const bookingCalendarRef = useTemplateRef('bookingCalendar');

const modal = overlay.create(LazyBookingRequestModal);

/**
 * Current User
 */

const currentUserVerified = computed(() => {
	// We want to assume the user is verified, to not flicker the alert
	if (!currentUser.value) return true;

	return currentUser.value.user.verifiedAt !== null;
});

const currentUserBanned = computed(() => {
	if (!currentUser.value) return false;

	return currentUser.value.activeRepremands.some(
		(repremand) => repremand.type === 'ban',
	);
});

const currentUserWarned = computed(() => {
	if (!currentUser.value) return false;

	return currentUser.value.activeRepremands.some(
		(repremand) => repremand.type === 'warning',
	);
});

const { data: currentUser, refresh: currentUserRefresh } = await useFetch(
	'/api/app/users/me',
	{
		server: false,
		onResponseError: () => {
			toast.add({
				icon: 'i-material-symbols-error-outline-rounded',
				title: t('common.error'),
				description: t('common.errorDescription'),
				actions: [
					{
						label: t('common.retry'),
						onClick: () => currentUserRefresh(),
					},
				],
			});
			navigateTo(localePath('/u'));
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

	const bookAsDate = date.value;
	const formattedBookAsDate = format(bookAsDate, 'yyyy-MM-dd');

	try {
		const res = await $fetch('/api/app/bookings', {
			method: 'POST',
			body: {
				// Formatted as 2024-12-24
				date: formattedBookAsDate,
			},
		});

		if (res) {
			await bookingCalendarRef.value?.addBooking(bookAsDate);

			toast.add({
				icon: 'i-material-symbols-check-circle-outline-rounded',
				title: t('common.success'),
				description: t('booking.bookedDescription', {
					date: formatDate(bookAsDate),
				}),
			});
			refreshNuxtData(['my-bookings']);
		}
	} catch (error: any) {
		if (error.statusCode === 409) {
			toast.add({
				icon: 'i-material-symbols-error-outline-rounded',
				title: t('booking.conflictTitle'),
				description:
					localizeServerError(t, error) ?? t('errors.booking.slotTaken'),
			});
		} else {
			if (
				[
					'Max Consecutive Bookings Reached',
					'Max Weekly Bookings Reached',
					'Max Monthly Bookings Reached',
				].includes(error.data.statusMessage)
			) {
				const createdBookingRequest: Date | undefined = await modal.open({
					date: formattedBookAsDate,
					// The raw server message is kept as the stored request reason
					// (admin-facing data); the localized text is display-only.
					reason: error.data.message,
					localizedReason: localizeServerError(t, error),
				});

				if (createdBookingRequest) {
					bookingCalendarRef.value?.refetchByDate(createdBookingRequest);
					refreshNuxtData(['my-booking-requests']);
				}
			} else {
				toast.add({
					icon: 'i-material-symbols-error-outline-rounded',
					title: t('common.error'),
					description:
						localizeServerError(t, error) ?? t('common.errorDescription'),
					actions: [
						{
							label: t('common.retry'),
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
			title: t('common.warning'),
			description: t('common.notifications.unsupported'),
		});
		return;
	}

	if (!hasPermission.value) {
		const permission = await askPermission();

		if (!permission) {
			subscribeToPushLoading.value = false;
			toast.add({
				icon: 'i-material-symbols-error-outline-rounded',
				title: t('common.error'),
				description: t('common.notifications.permissionDenied'),
			});
			return;
		}
	}

	await subscribeUserToPush();

	subscribeToPushLoading.value = false;
}
</script>

<style></style>
