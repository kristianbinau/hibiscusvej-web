<template>
	<div
		v-if="!fetchingBookings && bookings && bookings.length"
		class="grid grid-cols-1 md:grid-cols-2 gap-4 p-4"
	>
		<AdminUserBooking
			v-for="booking in bookings"
			:key="booking.id"
			:booking="booking"
		/>
	</div>

	<template v-else-if="fetchingBookings">
		<USkeleton class="h-24" />
	</template>

	<template v-else>
		<USkeleton class="h-24" />
		<UBadge
			class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
			color="gray"
		>
			Ingen Bookings!
		</UBadge>
	</template>
</template>

<script lang="ts" setup>
import type { Booking } from '~/utils/types/admin';

const bookings = defineModel<Booking[] | undefined>('bookings', {
	required: true,
});

const { userId } = defineProps<{
	userId: number;
}>();

const toast = useToast();

onMounted(() => {
	if (bookings.value === undefined) {
		fetchBookings();
	}
});

const fetchingBookings = ref(false);
async function fetchBookings() {
	if (fetchingBookings.value) {
		return;
	}

	fetchingBookings.value = true;

	try {
		const data = await $fetch(`/api/app/admin/users/${userId}/bookings`);

		if (data === null) {
			fetchingBookings.value = false;
			toast.add({
				icon: 'i-material-symbols-error-outline-rounded',
				title: 'Fejl!',
				description: 'Der skete en fejl...',
				actions: [
					{
						label: 'Prøv igen',
						click: fetchBookings,
					},
				],
			});
			return;
		}

		bookings.value = data.bookings as Booking[];
	} catch (error) {
		toast.add({
			icon: 'i-material-symbols-error-outline-rounded',
			title: 'Fejl!',
			description: 'Der skete en fejl...',
			actions: [
				{
					label: 'Prøv igen',
					click: fetchBookings,
				},
			],
		});
	}

	fetchingBookings.value = false;
}
</script>

<style></style>
