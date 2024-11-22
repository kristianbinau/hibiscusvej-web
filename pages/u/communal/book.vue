<template>
	<div>
		<h1>Book</h1>
    <DatePicker v-model="date" :disabled-dates="disabledDates" mode="date" is-dark="system" borderless transparent expanded/>
	</div>
</template>

<script lang="ts" setup>
import { Calendar, DatePicker } from 'v-calendar';
import 'v-calendar/style.css';

definePageMeta({
	layout: 'logged-in',
	middleware: 'auth-required',
});

const date = ref(new Date());

const disabledDates = ref([
  {
    repeat: {
      weekdays: [4, 5],
    },
  },
]);
</script>

<style></style>
