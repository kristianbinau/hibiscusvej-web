<template>
	<div class="flex mb-4">
		<UCalendar
			:key="reload"
			v-model="selectedDate"
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
	</div>
	<UTooltip
		:key="reload"
		v-if="
			isSelectedDateBooked && selectedDate && bookings[selectedDate.toString()]
		"
		text="Click to remove filter"
	>
		<UBadge class="cursor-pointer" trailing-icon="i-lucide-circle-x" @click="selectedDate = undefined" color="warning">
			Filtered By UserId: #{{ bookings[selectedDate.toString()].userId }}
		</UBadge>
	</UTooltip>
</template>

<script lang="ts" setup>
import { type DateValue, CalendarDate, today } from '@internationalized/date';
import type { Booking } from '~/utils/types/global';

const toast = useToast();

const TIMEZONE = 'Europe/Copenhagen';
const LOCALE = 'da-DK';

const maxDate = today(TIMEZONE).add({ years: 1 });

const selectedDate = ref<undefined | CalendarDate>();

const isSelectedDateBooked = computed(() => {
	if (!selectedDate.value) return false;

	const dateString = selectedDate.value.toString();
	return !!bookings.value[dateString];
});

const emit = defineEmits<{
	(e: 'update:modelValue', value: Date | null): void;
	(e: 'update:userId', value: number | null): void;
}>();

emit('update:modelValue', null);
emit('update:userId', null);

watch(selectedDate, (newValue) => {
	if (!newValue) {
		emit('update:modelValue', null);
		emit('update:userId', null);
		return;
	}

	emit('update:modelValue', newValue.toDate(TIMEZONE));
	emit('update:userId', bookings.value[newValue.toString()]?.userId ?? null);
});

// Is used to keep state of the calendar, when we force refresh.
const placeholderValue = ref<undefined | CalendarDate>();

/**
 * UCalendar Functions
 */

const reload = ref<number>(0);

onBeforeMount(async () => {
	const currentMonth = today(TIMEZONE).set({ day: 1 });
	const prevMonth = today(TIMEZONE).set({ day: 1 }).add({ months: -1 });
	const nextMonth = today(TIMEZONE).set({ day: 1 }).add({ months: 1 });

	await fetchMonth({
		year: currentMonth.year,
		month: currentMonth.month,
	});

	nextTick(() => {
		reload.value++;
	});

	await fetchMonth({
		year: prevMonth.year,
		month: prevMonth.month,
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
	const prevMonth = date.set({ day: 1 }).add({ months: -1 });
	const nextMonth = date.set({ day: 1 }).add({ months: 1 });

	await fetchMonth({
		year: thisMonth.year,
		month: thisMonth.month,
	});

	nextTick(() => {
		reload.value++;
	});

	await fetchMonth({
		year: prevMonth.year,
		month: prevMonth.month,
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
): 'info' | 'success' | 'warning' | 'error' | undefined {
	if (!booking) return undefined;

	const colors = ['info', 'success', 'warning', 'error'] as const;
	return colors[booking.userId % colors.length];
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

async function fetchMonth(
	month: { year: number; month: number },
	forceUpdate = false,
) {
	const cache = fetchCache.value.find(
		(cache) => cache.year === month.year && cache.month === month.month,
	);

	if (!forceUpdate && cache) return cache.data;

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

	if (forceUpdate) {
		const index = fetchCache.value.findIndex(
			(cache) => cache.year === month.year && cache.month === month.month,
		);
		if (index === -1) {
			fetchCache.value.push({
				year: month.year,
				month: month.month,
				data: promise,
			});
		} else {
			fetchCache.value[index].data = promise;
		}
	} else {
		fetchCache.value.push({
			year: month.year,
			month: month.month,
			data: promise,
		});
	}

	return promise;
}
</script>

<style></style>
