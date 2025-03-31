<template>
	<UCalendar
		v-model="value"
		:min-value="minDate"
		:max-value="maxDate"
		:year-controls="false"
	/>
</template>

<script lang="ts" setup>
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

const TIMEZONE = 'Europe/Copenhagen';
const LOCALE = 'da-DK';

const minDate = today(TIMEZONE);
const maxDate = today(TIMEZONE).add({ years: 1 });

const value = ref<undefined | CalendarDate>();
</script>

<style></style>
