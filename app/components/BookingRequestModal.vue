<template>
	<UModal
		:title="localizedReason ?? reason"
		:description="t('bookingRequest.description')"
		:dismissible="true"
		:close="true"
	>
		<template #body>
			<UAlert
				color="neutral"
				variant="subtle"
				:title="t('bookingRequest.why.title')"
				class="mb-4"
			>
				<template #description>
					{{ t('bookingRequest.why.intro') }} <br /><br />
					{{ t('bookingRequest.why.examplesIntro') }}
					<ul class="my-1">
						<li class="list-disc ml-6">
							{{ t('bookingRequest.why.example1') }}
						</li>
						<li class="list-disc ml-6">
							{{ t('bookingRequest.why.example2') }}
						</li>
					</ul>
					<br />
					{{ t('bookingRequest.why.outro') }}
				</template>
			</UAlert>

			<p>{{ t('bookingRequest.requestLine') }}</p>
			<p>
				{{ t('bookingRequest.triedToBook', { date: formattedDate }) }}
			</p>

			<USeparator class="my-4" />

			<UForm
				ref="form"
				:schema="schema"
				:state="state"
				@submit.prevent="onSubmit"
				class="w-full"
			>
				<UFormField
					:label="t('bookingRequest.reasonLabel')"
					name="requestText"
					:help="t('bookingRequest.reasonHelp')"
					class="w-full"
					required
				>
					<UTextarea
						v-model="state.requestText"
						:placeholder="t('bookingRequest.reasonPlaceholder')"
						class="w-full"
					/>
				</UFormField>

				<UAlert
					v-if="errorMessage"
					color="error"
					variant="subtle"
					:title="t('bookingRequest.errorTitle')"
					:description="errorMessage"
					icon="i-material-symbols-error-outline-rounded"
					class="mt-4"
				/>

				<UButton :loading="onSubmitLoading" type="submit" class="mt-4">{{
					t('bookingRequest.submit')
				}}</UButton>
			</UForm>
		</template>
	</UModal>
</template>

<script lang="ts" setup>
import { z } from 'zod/v4';
import type { Form, FormSubmitEvent } from '#ui/types';

const props = defineProps<{
	date: string;
	/** Raw server message — also stored as the request reason (admin-facing). */
	reason: string;
	/** Localized display text for the same message, when the server issued a key. */
	localizedReason?: string;
}>();

const { t } = useI18n();
const { formatDate } = useLocaleDate();

const formattedDate = computed(() => {
	return formatDate(new Date(props.date), {
		day: '2-digit',
		month: 'short',
		year: 'numeric',
	});
});

const emit = defineEmits<{ close: [Date] }>();

const toast = useToast();

const schema = z.object({
	requestText: z
		.string(t('common.required'))
		.min(12, t('bookingRequest.reasonMinLength')),
});

type Schema = z.output<typeof schema>;

const form = ref<Form<Schema>>();

const state = reactive<Partial<Schema>>({
	requestText: '',
});

const errorMessage = ref<string | null>(null);

const onSubmitLoading = ref<boolean>(false);

async function onSubmit(event: FormSubmitEvent<Schema>) {
	onSubmitLoading.value = true;

	form.value!.clear();

	const bookAsDate = new Date(props.date);
	const formattedBookAsDate = props.date;

	try {
		const res = await $fetch('/api/app/bookings/requests', {
			method: 'POST',
			body: {
				// Formatted as 2024-12-24
				date: formattedBookAsDate,
				requestNeededReasons: [props.reason],
				requestText: event.data.requestText,
			},
		});

		if (res) {
			toast.add({
				icon: 'i-material-symbols-check-circle-outline-rounded',
				title: t('common.success'),
				description: t('bookingRequest.requestedDescription', {
					date: formatDate(bookAsDate),
				}),
			});
			emit('close', bookAsDate);
		}
	} catch (error: any) {
		if (error.statusCode === 409) {
			errorMessage.value =
				localizeServerError(t, error) ?? t('errors.booking.slotTaken');
		} else {
			errorMessage.value =
				localizeServerError(t, error) ?? t('bookingRequest.reloadError');
		}
	}

	onSubmitLoading.value = false;
}
</script>

<style></style>
