<template>
	<div
		class="w-full flex flex-col rounded-lg overflow-hidden bg-(--ui-bg-elevated)"
	>
		<header class="flex p-4">
			<h1>Januar 2025</h1>
			<div class="ml-auto">// Date switcher</div>
		</header>

		<section class="overflow-auto flex flex-col flex-auto h-128">
			<div
				class="sticky top-0 z-10 bg-(--ui-bg-elevated) text-(--ui-primary) weekly-header py-2 border-b-2 border-(--ui-border-accented) drop-shadow-lg"
			>
				<div></div>
				<template v-for="zonedDay in weekDays">
					<div
						class="text-center text-(--ui-text-muted) border-x border-(--ui-border-muted)"
					>
						{{ formatZonedDateToWeekdayName(zonedDay) }}
						<b class="text-(--ui-primary)">{{ zonedDay.day }}</b>
					</div>
				</template>
			</div>

			<div class="relative weekly-grid bg-(--ui-bg-muted) my-2">
				<template v-for="hour in 24">
					<div class="text-center text-(--ui-text-dimmed)">
						{{ hour.toFixed().padStart(2, '0') }}:00
					</div>

					<template v-for="day in 7">
						<div
							class="border-r border-b border-(--ui-border-muted)"
							:class="{
								'border-l': day === 1,
								'border-t': hour === 1,
							}"
							@click="handleHourClick(day, hour)"
						></div>
					</template>
				</template>

				<ol
					class="absolute top-0 left-0 right-0 bottom-0 weekly-grid pointer-events-none"
				>
					<li
						v-for="event in events"
						:key="event.id"
						:style="{
							gridColumnStart:
								getDayOfWeek(toCalendarDate(event.startZonedDate), LOCALE) + 1,
							gridColumnEnd:
								getDayOfWeek(toCalendarDate(event.endZonedDate), LOCALE) + 2,
							gridRowStart: event.startZonedDate.hour,
							gridRowEnd: event.endZonedDate.hour + 1,
						}"
						class="bg-blue-50 dark:bg-blue-200 text-blue-700 rounded m-1.5 p-2 text-sm cursor-pointer"
					>
						<strong>{{ event.title }}</strong>
						<p class="text-xs">
							{{ event.startZonedDate.hour }}:00 -
							{{ event.endZonedDate.hour }}:00
						</p>
					</li>
				</ol>
			</div>
		</section>
	</div>
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
	ZonedDateTime,
	CalendarDate,
	CalendarDateTime,
	startOfWeek,
	endOfWeek,
	now,
	DateFormatter,
	toCalendarDate,
	getDayOfWeek,
} from '@internationalized/date';
import { id } from 'date-fns/locale';

const TIMEZONE = 'Europe/Copenhagen';
const LOCALE = 'da-DK';

const selectedWeekStart = ref<ZonedDateTime>(
	startOfWeek(now(TIMEZONE), LOCALE),
);
const weekDays = computed<ZonedDateTime[]>(() => {
	const days = [];
	for (let i = 0; i < 7; i++) {
		days.push(selectedWeekStart.value.add({ days: i }));
	}
	return days;
});

// Example event data
const events = computed(() => {
	return [...unsavedEvent.value];
});

/**
 * Selection Handling!
 */
const selectedStart = ref<ZonedDateTime | null>(null);
const selectedEnd = ref<ZonedDateTime | null>(null);

const unsavedEvent = computed(() => {
	if (selectedStart.value === null) {
		return [];
	}

	return [
		{
			id: 'unsaved',
			title: 'Unsaved Event',
			startZonedDate: selectedStart.value,
			endZonedDate: selectedEnd.value ?? selectedStart.value,
		},
	];
});

function handleHourClick(day: number, hour: number) {
	const clickedZonedDate = fromWeekDayAndHourToZonedDateTime(day, hour);

	console.log('Clicked:', clickedZonedDate.toString());

	if (selectedStart.value === null) {
		handleSelectStart(clickedZonedDate);
	} else if (selectedEnd.value === null) {
		handleSelectEnd(clickedZonedDate);
	} else {
		selectedStart.value = null;
		selectedEnd.value = null;

		handleSelectStart(clickedZonedDate);
	}
}

function handleSelectStart(date: ZonedDateTime) {
	selectedStart.value = date;
}

function handleSelectEnd(date: ZonedDateTime) {
	selectedEnd.value = date;
}

/**
 * Utils
 */

function fromWeekDayAndHourToZonedDateTime(weekday: number, hour: number) {
	return selectedWeekStart.value
		.add({ days: weekday })
		.set({ hour, minute: 0 });
}

function formatZonedDateToWeekdayName(date: ZonedDateTime) {
	const weekdays = [
		'Mandag',
		'Tirsdag',
		'Onsdag',
		'Torsdag',
		'Fredag',
		'Lørdag',
		'Søndag',
	];
	return weekdays[getDayOfWeek(toCalendarDate(date), LOCALE)] || 'Ukendt';
}
</script>

<style scoped>
@reference "assets/css/main.css";

.weekly-header {
	display: grid;
	grid-template-columns: 4rem repeat(7, 1fr);
	@apply pr-2;
}

.weekly-grid {
	display: grid;
	grid-template-columns: 4rem repeat(7, 1fr);
	grid-template-rows: repeat(24, 4rem);
	@apply mr-2;
}
</style>
