<template>
	<UModal
		:title="'Håndter booking anmodning'"
		:description="`Håndter booking anmodning for ${formattedDate}`"
		:dismissible="true"
		:close="true"
	>
		<template #body>
			<p>
				Tag en beslutning. Har brugeren en <strong>berettiget</strong> grund til
				at få sin booking godkendt?
			</p>

			<USeparator class="my-4" />

			<p class="mb-2 text-sm">Brugerens Kalender:</p>
			<BookingCalendar
				ref="calendar"
				:userId="bookingRequest.userId"
				class="pointer-events-none p-2 mt-4 bg-(--ui-bg) rounded-lg border border-(--ui-border)"
			/>

			<p class="mt-4 mb-2 text-sm">Anmodning Nødvendig:</p>
			<UChatMessage
				id="user-message"
				role="user"
				variant="soft"
				:ui="{ container: 'pb-0' }"
				:parts="[
					{
						type: 'text',
						text: bookingRequest.requestNeededReasons ?? 'Ingen grund givet.',
					},
				]"
			/>

			<p class="mt-4 mb-2 text-sm">Besked fra Brugeren:</p>
			<UChatMessage
				id="user-message"
				role="user"
				variant="soft"
				:ui="{ container: 'pb-0' }"
				:parts="[
					{
						type: 'text',
						text: bookingRequest.requestText ?? 'Ingen besked givet.',
					},
				]"
			/>

			<USeparator class="my-4" />

			<UForm
				ref="form"
				:schema="schema"
				:state="state"
				@submit.prevent="onSubmit"
				class="w-full"
			>
				<UFormField
					label="Beslutning"
					name="permitted"
					class="w-full mt-3 mb-5"
					required
				>
					<URadioGroup v-model="state.permitted" :items="items" />
				</UFormField>

				<UFormField
					label="Forklaring"
					name="handledText"
					hint="Angiv en forklaring for din beslutning"
					class="w-full"
				>
					<UTextarea
						v-model="state.handledText"
						placeholder="Det lyder rimeligt fordi... Eller Det kan jeg desværre ikke godkende fordi..."
						class="w-full"
					/>
				</UFormField>

				<UAlert
					v-if="errorMessage"
					color="error"
					variant="subtle"
					title="Fejl"
					:description="errorMessage"
					icon="i-material-symbols-error-outline-rounded"
					class="mt-4"
				/>

				<UButton :loading="onSubmitLoading" type="submit" class="mt-4">
					Håndter Anmodning
				</UButton>
			</UForm>
		</template>
	</UModal>
</template>

<script lang="ts" setup>
import { z } from 'zod/v4';
import type { Form, FormSubmitEvent, RadioGroupItem } from '#ui/types';
import type { BookingRequest } from '~/utils/types/admin';
import { BookingCalendar } from '#components';

const props = defineProps<{
	bookingRequest: BookingRequest;
}>();

const formattedDate = computed(() => {
	return new Date(props.bookingRequest.fromTimestamp).toLocaleDateString(
		'da-DK',
		{
			day: '2-digit',
			month: 'short',
			year: 'numeric',
		},
	);
});

const emit = defineEmits<{ close: [Date] }>();

const toast = useToast();

const schema = z.object({
	permitted: z.boolean(
		'Tag stilling til om bookingen skal godkendes, eller ej.',
	),
	handledText: z.string().max(500).optional(),
});

type Schema = z.output<typeof schema>;

const form = ref<Form<Schema>>();

const state = reactive<Partial<Schema>>({
	permitted: undefined,
	handledText: '',
});

const items = ref<RadioGroupItem[]>([
	{
		label: 'Godkendt',
		description: 'Brugeren har en berettiget grund.',
		value: true,
	},
	{
		label: 'Afvist',
		description: 'Brugeren har ikke en berettiget grund.',
		value: false,
	},
]);

const errorMessage = ref<string | null>(null);

const onSubmitLoading = ref<boolean>(false);

async function onSubmit(event: FormSubmitEvent<Schema>) {
	onSubmitLoading.value = true;

	form.value!.clear();

	try {
		const res = await $fetch(
			`/api/app/admin/bookings/requests/${props.bookingRequest.id}/handle`,
			{
				method: 'POST',
				body: {
					permitted: event.data.permitted,
					handledText: event.data.handledText,
				},
			},
		);

		if (res) {
			toast.add({
				icon: 'i-material-symbols-check-circle-outline-rounded',
				title: 'Success!',
				description: 'Booking anmodning blev håndteret',
			});

			emit('close', new Date(props.bookingRequest.fromTimestamp));
		}
	} catch (error) {
		errorMessage.value = 'Der skete en fejl... Prøv igen senere.';
		toast.add({
			icon: 'i-material-symbols-error-outline-rounded',
			title: 'Fejl!',
			description: 'Der skete en fejl... Prøv igen senere.',
		});
	}

	onSubmitLoading.value = false;
}

/**
 * Calendar
 */

const calendarRef = useTemplateRef<typeof BookingCalendar>('calendar');

watch(
	[() => props.bookingRequest, calendarRef],
	() => {
		if (calendarRef.value) {
			calendarRef.value.navigateToDate(
				new Date(props.bookingRequest.fromTimestamp),
			);
		}
	},
	{ immediate: true },
);
</script>

<style></style>
