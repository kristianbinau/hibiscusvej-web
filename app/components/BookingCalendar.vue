<template>
	<UCalendar
		:key="reload"
		v-model="selectedDate"
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
import { type DateValue, CalendarDate, today } from '@internationalized/date';
import type { Booking } from '~/utils/types/global';

const toast = useToast();

const TIMEZONE = 'Europe/Copenhagen';
const LOCALE = 'da-DK';

const minDate = today(TIMEZONE);
const maxDate = today(TIMEZONE).add({ years: 1 });

const selectedDate = ref<undefined | CalendarDate>();

const emit = defineEmits<{
	(e: 'update:modelValue', value: Date | null): void;
}>();

defineExpose({ addBooking });

emit('update:modelValue', null);

watch(selectedDate, (newValue) => {
	if (!newValue) {
		emit('update:modelValue', null);
		return;
	}

	const booking = bookings.value[newValue.toString()];
	if (booking) {
		// If the date is booked, set the value to undefined
		selectedDate.value = undefined;

		if (booking.userId === userId) {
			toast.add({
				icon: 'i-material-symbols-warning-outline-rounded',
				title: 'Advarsel!',
				description: 'Du har allerede en booking den dag',
			});
		} else {
			toast.add({
				icon: 'i-material-symbols-warning-outline-rounded',
				title: 'Advarsel!',
				description: 'Der er allerede en booking den dag',
			});
		}
	}

	emit('update:modelValue', newValue.toDate(TIMEZONE));
});

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
		} else if (fetchCache.value[index]) {
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

async function addBooking(date: Date) {
	selectedDate.value = undefined;

	const year = date.getFullYear();
	const month = date.getMonth() + 1;

	await fetchMonth({ year, month }, true);

	nextTick(() => {
		reload.value++;
	});
}
</script>

<style></style>
