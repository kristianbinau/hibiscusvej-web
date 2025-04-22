<template>
	<UCalendar
		:key="reload"
		v-model="value"
		:min-value="minDate"
		:max-value="maxDate"
		:year-controls="false"
		v-model:placeholder="placeholderValue"
		@update:placeholder="(placeholder: any) => handleMonthChange(placeholder)"
	>
		<template #day="{ day }">
			<UChip
				v-if="bookings[day.toString()]"
				:color="getColorByBooking(bookings[day.toString()])"
			>
				{{ day.day }}
			</UChip>
		</template>
	</UCalendar>
</template>

<script lang="ts" setup>
import { getCurrentInstance } from 'vue'
import {
	createDateRange,
	createDecade,
	createMonth,
	createYear,
	createYearRange,
	getDaysInMonth,
	hasTime,
	isAfter,
	isAfterOrSame,
	isBefore,
	isBeforeOrSame,
	isBetween,
	isBetweenInclusive,
	isCalendarDateTime,
	isZonedDateTime,
	parseStringToDateValue,
	toDate,
} from 'reka-ui/date';

import {
	type Calendar,
	type DateValue,
	ZonedDateTime,
	CalendarDate,
	CalendarDateTime,
	startOfWeek,
	endOfWeek,
	today,
	DateFormatter,
	toCalendarDate,
	getDayOfWeek,
} from '@internationalized/date';
import type { Booking } from '~/utils/types/global';

const TIMEZONE = 'Europe/Copenhagen';
const LOCALE = 'da-DK';

const minDate = today(TIMEZONE);
const maxDate = today(TIMEZONE).add({ years: 1 });

const value = ref<undefined | CalendarDate>();

// Is used to keep state of the calendar, when we force refresh.
const placeholderValue = ref<undefined | CalendarDate>();

const { userId } = defineProps<{
	userId: number;
}>();

/**
 * UCalendar Functions
 */

const reload = ref<number>(0);

onBeforeMount(async () => {
	const currentMonth = today(TIMEZONE).set({ day: 1 });
	const nextMonth = today(TIMEZONE).set({ day: 1 }).add({ months: 1 });

	await fetchMonth({
		year: currentMonth.year,
		month: currentMonth.month,
	});

	nextTick(() => {
		reload.value++;
	});

	await fetchMonth({
		year: nextMonth.year,
		month: nextMonth.month,
	});

	nextTick(() => {
		reload.value++;
	});
});

async function handleMonthChange(date: DateValue) {
	const thisMonth = date.set({ day: 1 });
	const nextMonth = date.set({ day: 1 }).add({ months: 1 });

	await fetchMonth({
		year: thisMonth.year,
		month: thisMonth.month,
	});

	nextTick(() => {
		reload.value++;
	});

	await fetchMonth({
		year: nextMonth.year,
		month: nextMonth.month,
	});

	nextTick(() => {
		reload.value++;
	});
}

function getColorByBooking(
	booking?: DayBooking,
): 'success' | 'error' | undefined {
	console.log('getColorByBooking', booking);

	if (!booking) return undefined;

	if (booking.userId === userId) {
		return 'success';
	} else {
		return 'error';
	}
}

/**
 * Bookings
 */

type DayBooking = {
	id: number;
	date: CalendarDate;
	userId: number;
};

const bookings = computed<Record<string, DayBooking>>(() => {
	const bookings: Record<string, DayBooking> = {};

	fetchCache.value.forEach((month) => {
		month.data.then((data) => {
			data.forEach((booking) => {
				bookings[booking.date.toString()] = booking;
			});
		});
	});

	return bookings;
});

const fetchCache = ref<
	{
		year: number;
		month: number;
		data: Promise<DayBooking[]>;
	}[]
>([]);

async function fetchMonth(month: { year: number; month: number }) {
	const cache = fetchCache.value.find(
		(cache) => cache.year === month.year && cache.month === month.month,
	);

	if (cache) return cache.data;

	const promise = new Promise<DayBooking[]>((resolve) => {
		$fetch<Booking[]>('/api/app/bookings', {
			params: {
				year: month.year,
				month: month.month,
			},
		}).then((data) => {
			if (!data) resolve([]);

			const bookingsThisMonth = data.map((booking) => {
				const date = new Date(booking.from);

				return {
					id: booking.id,
					date: new CalendarDate(
						date.getFullYear(),
						date.getMonth() + 1,
						date.getDate(),
					),
					userId: booking.userId,
				};
			});

			resolve(bookingsThisMonth);
		});
	});

	fetchCache.value.push({
		year: month.year,
		month: month.month,
		data: promise,
	});

	return promise;
}
</script>

<style></style>
