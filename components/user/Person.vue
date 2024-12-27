<template>
	<UForm ref="form" :schema="schema" :state="state" @submit.prevent="onSubmit">
		<UCard
			:ui="{
				body: { base: 'flex flex-col gap-3' },
				footer: { base: 'flex gap-3' },
			}"
		>
			<template #header>
				<div class="flex items-center justify-between">
					<h3
						class="text-base font-semibold leading-6 text-gray-900 dark:text-white"
					>
						<template v-if="isCreated">
							{{ personIndex ? `${personIndex}. Kontaktperson` : `Kontaktperson ID: ${person.id}` }} </template
						>
						<template v-else> Uoprettet Konktaktperson </template>
					</h3>
				</div>
			</template>

			<UFormGroup label="Name" name="name" required>
				<UInput v-model="state.name" />
			</UFormGroup>

			<UFormGroup label="Email" name="email" required>
				<UInput v-model="state.email" />
			</UFormGroup>

			<UFormGroup label="Phone" name="phone" required>
				<UInput v-model="state.phone" />
			</UFormGroup>

			<template #footer>
				<template v-if="isCreated">
					<UButton
						v-if="deleteable"
						@click="onDelete"
						color="red"
						variant="soft"
						class="flex-1"
						block
						>Slet Person</UButton
					>

					<UButton
						:disabled="!hasChanges"
						color="green"
						type="submit"
						class="flex-1"
						block
						>Gem Ændringer</UButton
					>
				</template>

				<template v-else>
					<UButton
						@click="onDelete"
						color="red"
						variant="soft"
						class="flex-1"
						block
						>Fjern Person</UButton
					>

					<UButton color="green" type="submit" class="flex-1" block
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

async function onSubmit(event: FormSubmitEvent<Schema>) {
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
				title: 'Der skete en fejl ved opdatering af kontaktpersonen',
			});
		}
	}
}

async function onDelete() {
	if (person.value.id === 0) {
		emit('delete');
		return;
	}

	try {
		const res = await $fetch(`/api/users/me/persons/${person.value.id}`, {
			method: 'DELETE',
		});

		if (res) {
			toast.add({
				title: 'Kontaktpersonen blev slettet',
			});
		}

		emit('delete');
	} catch (error: any) {
		toast.add({
			title: 'Der skete en fejl ved sletning af kontaktpersonen',
		});
	}
}

async function createPerson(event: FormSubmitEvent<Schema>) {
	const res = await $fetch(`/api/users/me/persons`, {
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
			title: 'Kontaktpersonen blev oprettet',
		});
	}
}

async function updatePerson(event: FormSubmitEvent<Schema>) {
	if (person.value.id === 0) {
		return;
	}

	const res = await $fetch(`/api/users/me/persons/${person.value.id}`, {
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
			title: 'Kontaktpersonen blev opdateret',
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
