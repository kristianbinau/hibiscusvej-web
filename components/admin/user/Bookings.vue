<template>
	<div
		v-if="status === 'success' && bookings && bookings.length"
		class="grid grid-cols-1 md:grid-cols-2 gap-4 p-4"
	>
		<AdminUserBooking
			v-for="booking in bookings"
			:key="booking.id"
			:booking="booking"
		/>
	</div>

	<template v-else-if="status === 'pending'">
		<USkeleton class="h-24" />
	</template>

	<template v-else>
		<USkeleton class="h-24" />
		<UBadge
			class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
			color="neutral"
		>
			Ingen Bookings!
		</UBadge>
	</template>
</template>

<script lang="ts" setup>
const { userId } = defineProps<{
	userId: number;
}>();

const { data: bookings, status } = await useFetch(
	`/api/app/admin/users/${userId}/bookings`,
);
</script>

<style></style>
