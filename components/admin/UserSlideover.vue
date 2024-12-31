<template>
	
</template>

<script lang="ts" setup>
import type { Booking, User } from '~/utils/types/admin';

const { userId, showPersons, showLogins, showSessions, showBookings } =
	defineProps<{
		userId: number;
		showPersons: boolean;
		showLogins: boolean;
		showSessions: boolean;
		showBookings: boolean;
	}>();

const user = defineModel<User>('user', { required: false, type: Object });
const bookings = defineModel<Booking[]>('bookings', {
	required: false,
	type: Array,
});
</script>

<style></style>
