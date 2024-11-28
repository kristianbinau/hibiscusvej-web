<template>
	<section class="w-3/4 mx-auto pt-5">
		<h1 class="text-2xl text-center mb-2"></h1>

		<div class="w-3/4 mx-auto rounded-lg bg-gray-200 dark:bg-gray-800">
			<VCalendarDatePicker
				v-model="date"
				:disabled-dates="disabledDates"
				mode="date"
				is-dark="system"
				borderless
				transparent
				expanded
			/>
		</div>

		<DatePicker />
	</section>
</template>

<script lang="ts" setup>
import { DatePicker as VCalendarDatePicker } from 'v-calendar';
import 'v-calendar/style.css';

definePageMeta({
	layout: 'logged-in',
	middleware: 'auth-required',
});

const date = ref(new Date());

const disabledDates = ref([
	{
		repeat: {
			weekdays: [4],
		},
	},
]);
</script>

<style></style>
