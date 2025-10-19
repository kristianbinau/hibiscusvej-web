<template>
	<UModal
		:title="reason"
		description="Den booking du har forsøgt at lave er ikke automatisk tilladt."
		:dismissible="true"
		:close="true"
	>
		<template #body>
			<UAlert color="neutral" variant="subtle" title="Hvorfor?" class="mb-4">
				<template #description>
					Bestyrelsen har oplevet, at der bliver foretaget bookinger uden hensyn
					til andre brugere. <br /><br />
					Eksempelvis at brugere foretager..
					<ul class="my-1">
						<li class="list-disc ml-6">
							Reservationer for at kunne sove længe og først gøre rent sent på
							eftermiddagen.
						</li>
						<li class="list-disc ml-6">
							Reservationer af hele weekender, hvor lokalet kun benyttes én dag.
						</li>
					</ul>
					<br />
					Derfor skal nogle bookinger nu godkendes manuelt af bestyrelsen for at
					sikre, at alle får en fair chance for at bruge fælleslokalet.
				</template>
			</UAlert>

			<p>Anmod om at få din booking godkendt manuelt.</p>
			<p>
				Du har forsøgt at booke fælleslokalet d.
				<strong>{{ formattedDate }}</strong
				>.
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
					label="Årsag"
					name="requestText"
					help="Angiv årsagen for din booking"
					class="w-full"
					required
				>
					<UTextarea
						v-model="state.requestText"
						placeholder="Jeg har brug for at booke fælleslokalet fordi..."
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

				<UButton :loading="onSubmitLoading" type="submit" class="mt-4"
					>Anmod om godkendelse</UButton
				>
			</UForm>
		</template>
	</UModal>
</template>

<script lang="ts" setup>
import { z } from 'zod/v4';
import type { Form, FormSubmitEvent } from '#ui/types';

const props = defineProps<{
	date: string;
	reason: string;
}>();

const formattedDate = computed(() => {
	return new Date(props.date).toLocaleDateString('da-DK', {
		day: '2-digit',
		month: 'short',
		year: 'numeric',
	});
});

const emit = defineEmits<{ close: [Date] }>();

const toast = useToast();

const schema = z.object({
	requestText: z
		.string('Påkrævet')
		.min(12, 'Angiv venligst en mere udførlig årsag'),
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
				title: 'Success!',
				description: `Du har anmodet om en booking - ${bookAsDate.toLocaleDateString()}`,
			});
			emit('close', bookAsDate);
		}
	} catch (error: any) {
		if (error.statusCode === 409) {
			errorMessage.value =
				error.data.message || 'Der er allerede en booking i det tidsrum';
		} else {
			if (error.data.message) {
				errorMessage.value = error.data.message;
			} else {
				errorMessage.value = 'Der skete en fejl, prøv at genindlæse siden.';
			}
		}
	}

	onSubmitLoading.value = false;
}
</script>

<style></style>
