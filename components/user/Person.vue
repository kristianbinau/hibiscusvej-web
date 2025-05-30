<template>
	<UForm ref="form" :schema="schema" :state="state" @submit.prevent="onSubmit">
		<UCard
			:ui="{
				body: 'flex flex-col gap-3',
				footer: 'flex gap-3',
			}"
		>
			<template #header>
				<div class="flex items-center justify-between">
					<h3
						class="text-base font-semibold leading-6 text-neutral-900 dark:text-white"
					>
						<template v-if="isCreated">
							{{
								personIndex
									? `${personIndex}. Kontaktperson`
									: `Kontaktperson ID: ${person.id}`
							}}
						</template>
						<template v-else> Uoprettet Konktaktperson </template>
					</h3>
				</div>
			</template>

			<UFormField label="Name" name="name" required>
				<UInput v-model="state.name" class="w-full" />
			</UFormField>

			<UFormField label="Email" name="email" required>
				<UInput v-model="state.email" class="w-full" />
			</UFormField>

			<UFormField label="Phone" name="phone" required>
				<UInput v-model="state.phone" class="w-full" />
			</UFormField>

			<template #footer>
				<template v-if="isCreated">
					<UButton
						v-if="deleteable"
						@click="onDelete"
						:loading="onDeleteLoading"
						color="error"
						variant="soft"
						class="flex-1"
						block
						>Slet Person</UButton
					>

					<UButton
						:loading="onSubmitLoading"
						:disabled="!hasChanges"
						color="success"
						type="submit"
						class="flex-1"
						block
						>Gem Ændringer</UButton
					>
				</template>

				<template v-else>
					<UButton
						@click="onDelete"
						color="error"
						variant="soft"
						class="flex-1"
						block
						>Fjern Person</UButton
					>

					<UButton
						:loading="onSubmitLoading"
						color="success"
						type="submit"
						class="flex-1"
						block
						>Opret Person</UButton
					>
				</template>
			</template>
		</UCard>
	</UForm>
</template>

<script lang="ts" setup>
import { z } from 'zod';
import type { Form, FormSubmitEvent } from '#ui/types';
import type { MePerson } from '~/utils/types/settings';

const emit = defineEmits(['delete']);

const person = defineModel<MePerson>('person', {
	required: true,
	type: Object,
});

const props = defineProps<{
	personIndex?: number;
	readOnly?: boolean;
	deleteable?: boolean;
}>();

const toast = useToast();

const schema = z.object({
	name: z.string({
		required_error: 'Påkrævet',
	}),
	email: z
		.string({
			required_error: 'Påkrævet',
		})
		.email('Ugyldig email'),
	phone: z
		.string({
			required_error: 'Påkrævet',
		})
		.min(8, 'Telefonnummeret skal være mindst 8 tegn'),
});

type Schema = z.output<typeof schema>;

const form = ref<Form<Schema>>();

const state = reactive<{
	name: string | undefined;
	email: string | undefined;
	phone: string | undefined;
}>({
	name: person.value.name ?? undefined,
	email: person.value.email ?? undefined,
	phone: person.value.phone ?? undefined,
});

const isCreated = computed(() => person.value.id !== 0);

const onSubmitLoading = ref<boolean>(false);

async function onSubmit(event: FormSubmitEvent<Schema>) {
	onSubmitLoading.value = true;

	form.value!.clear();
	try {
		if (!isCreated.value) {
			await createPerson(event);
		} else {
			await updatePerson(event);
		}
	} catch (error: any) {
		if (error.statusCode === 422) {
			form.value!.setErrors(
				error.data.errors.map((error: any) => ({
					// Map validation errors to { path: string, message: string }
					message: error.message,
					path: error.path,
				})),
			);
		} else {
			toast.add({
				icon: 'i-material-symbols-error-outline-rounded',
				title: 'Fejl!',
				description: 'Der skete en fejl...',
			});
		}
	}

	onSubmitLoading.value = false;
}

const onDeleteLoading = ref<boolean>(false);

async function onDelete() {
	if (person.value.id === 0) {
		emit('delete');
		return;
	}

	onDeleteLoading.value = true;

	try {
		const res = await $fetch(`/api/app/users/me/persons/${person.value.id}`, {
			method: 'DELETE',
		});

		if (res) {
			toast.add({
				icon: 'i-material-symbols-check-circle-outline-rounded',
				title: 'Success!',
				description: 'Kontaktpersonen blev slettet',
			});
		}

		emit('delete');
	} catch (error: any) {
		toast.add({
			icon: 'i-material-symbols-error-outline-rounded',
			title: 'Fejl!',
			description: 'Der skete en fejl...',
			actions: [
				{
					label: 'Prøv igen',
					onClick: onDelete,
				},
			],
		});
	}

	onDeleteLoading.value = false;
}

async function createPerson(event: FormSubmitEvent<Schema>) {
	const res = await $fetch(`/api/app/users/me/persons`, {
		method: 'POST',
		body: {
			name: event.data.name,
			email: event.data.email,
			phone: event.data.phone,
		},
	});

	if (res) {
		const resPerson = res['person'];

		person.value.id = resPerson.id;
		person.value.name = resPerson.name;
		person.value.email = resPerson.email;
		person.value.phone = resPerson.phone;
		person.value.createdAt = resPerson.createdAt;
		person.value.updatedAt = resPerson.updatedAt;

		toast.add({
			icon: 'i-material-symbols-check-circle-outline-rounded',
			title: 'Success!',
			description: 'Kontaktpersonen blev oprettet',
		});
	}
}

async function updatePerson(event: FormSubmitEvent<Schema>) {
	if (person.value.id === 0) {
		return;
	}

	const res = await $fetch(`/api/app/users/me/persons/${person.value.id}`, {
		method: 'PATCH',
		body: {
			name: event.data.name,
			email: event.data.email,
			phone: event.data.phone,
		},
	});

	if (res) {
		person.value.name = event.data.name;
		person.value.email = event.data.email;
		person.value.phone = event.data.phone;

		toast.add({
			icon: 'i-material-symbols-check-circle-outline-rounded',
			title: 'Success!',
			description: 'Kontaktpersonen blev opdateret',
		});
	}
}

const hasChanges = computed(() => {
	return (
		state.name !== person.value.name ||
		state.email !== person.value.email ||
		state.phone !== person.value.phone
	);
});
</script>

<style></style>
