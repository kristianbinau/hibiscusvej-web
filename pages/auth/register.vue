<template>
	<section
		class="lg:w-2/4 lg:px-0 px-4 mx-auto flex flex-col items-center gap-4 mt-12"
	>
		<UForm
			ref="form"
			:schema="schema"
			:state="state"
			@submit.prevent="onSubmit"
			class="md:w-3/4 w-full"
		>
			<UCard>
				<template #header>
					<h1 class="text-2xl font-semibold text-primary">Registér</h1>
				</template>

				<h3 class="text-xl font-semibold text-primary mb-2">Lejlighed</h3>

				<p class="mb-5">
					Vi har brug for at vide hvilken lejlighed du bor i. Når du har
					oprettet din konto vil Afdelingsbestyrelsen verificere de indtastede
					informationer.
				</p>

				<UFormGroup
					label="Lejlighed"
					name="apartmentId"
					class="mt-3 mb-5"
					required
				>
					<USelectMenu
						v-model="state.apartmentId"
						:options="apartments"
						value-attribute="id"
						option-attribute="address"
					/>
				</UFormGroup>

				<hr class="border-gray-200 dark:border-gray-800 mb-5" />

				<h3 class="text-xl font-semibold text-primary mb-2">Login</h3>

				<p class="mb-5">
					Vi har brug for login informationer, så du kan logge ind på din konto.
					Din adgangskoden bliver krypteret før den bliver sendt til vores
					servere.
				</p>

				<UFormGroup label="Email" name="email" class="my-3" required>
					<UInput v-model="state.email" />
				</UFormGroup>

				<UFormGroup
					label="Kodeord"
					name="password"
					class="mt-3 mb-5"
					eager-validation
					required
				>
					<UInput v-model="state.password" type="password" />
				</UFormGroup>

				<hr class="border-gray-200 dark:border-gray-800 mb-5" />

				<h3 class="text-xl font-semibold text-primary mb-2">Kontakt</h3>

				<p class="mb-5">
					Vi har brug for kontaktinformationer på alle beboere i lejligheden.
					Det er vigtigt at vi har korrekte informationer, så vi kan kontakte
					jer.
				</p>

				<!-- Contact Information -->
				<UFormGroup name="persons">
					<div class="flex flex-col gap-6">
						<template v-for="(person, index) in state.persons">
							<UFormGroup
								:label="`${index + 1}. kontaktperson`"
								:name="`persons.${index}`"
							>
								<UFormGroup
									label="Navn"
									:name="`persons.${index}.name`"
									class="mt-3"
									required
								>
									<UInput v-model="person.name" label="Name" />
								</UFormGroup>
								<UFormGroup
									label="Email"
									:name="`persons.${index}.email`"
									class="mt-3"
									required
								>
									<UInput v-model="person.email" />
								</UFormGroup>
								<UFormGroup
									label="Telefon"
									:name="`persons.${index}.phone`"
									class="mt-3"
									required
								>
									<UInput v-model="person.phone" label="Phone" />
								</UFormGroup>
								<UButton
									v-if="state.persons.length > 1"
									color="red"
									variant="soft"
									@click="() => removePerson(index)"
									class="mt-5"
								>
									Fjern kontaktperson
								</UButton>
							</UFormGroup>
						</template>
					</div>
				</UFormGroup>

				<template v-if="state.persons.length < 2">
					<UButton
						color="emerald"
						variant="soft"
						@click="addPerson"
						class="mt-5 mb-5"
					>
						Tilføj kontaktperson
					</UButton>
				</template>

				<template #footer>
					<div
						class="flex gap-3 flex-wrap md:flex-nowrap flex-1 justify-between"
					>
						<ULink
							to="/auth/login"
							class="text-gray-500 underline hover:text-gray-600 dark:hover:text-gray-400"
						>
							Har du allerede en konto?
						</ULink>

						<UButton class="md:max-w-[48%]" type="submit" block
							>Registér</UButton
						>
					</div>
				</template>
			</UCard>
		</UForm>
	</section>
</template>

<script lang="ts" setup>
import { z } from 'zod';
import type { Form, FormSubmitEvent } from '#ui/types';

definePageMeta({
	layout: 'minimal',
	middleware: 'guest-required',
});

defineRouteRules({
	prerender: true,
});

useHead({
	title: 'Registér',
});

const toast = useToast();
const { hash } = useHash();

/**
 * Form
 */

const schema = z.object({
	apartmentId: z.number({
		required_error: 'Påkrævet',
	}),
	email: z
		.string({
			required_error: 'Påkrævet',
		})
		.email('Ugyldig email'),
	password: z
		.string({
			required_error: 'Påkrævet',
		})
		.min(8, 'Kodeord skal være mindst 8 tegn'),
	persons: z
		.array(
			z.object({
				name: z.string({
					required_error: 'Påkrævet',
				}),
				email: z
					.string({
						required_error: 'Påkrævet',
					})
					.email('Ugyldig email'),
				phone: z.string({
					required_error: 'Påkrævet',
				}).min(8, 'Telefonnummeret skal være mindst 8 tegn'),
			}),
		)
		.min(1, 'Det skal være mindst 1 kontaktperson')
		.max(2, 'Det kan maksimalt være 2 kontaktpersoner'),
});

type Schema = z.output<typeof schema>;

const form = ref<Form<Schema>>();

const state = reactive<{
	apartmentId: number | undefined;
	email: string | undefined;
	password: string | undefined;
	persons: {
		name: string | undefined;
		email: string | undefined;
		phone: string | undefined;
	}[];
}>({
	apartmentId: undefined,
	email: undefined,
	password: undefined,
	persons: [
		{
			name: undefined,
			email: undefined,
			phone: undefined,
		},
	],
});

async function onSubmit(event: FormSubmitEvent<Schema>) {
	form.value!.clear();
	try {
		const passwordHash = await hash(event.data.password);

		const res = await $fetch('/api/auth/register', {
			method: 'POST',
			body: {
				apartmentId: event.data.apartmentId,
				email: event.data.email,
				password: passwordHash,
				persons: event.data.persons,
			},
		});

		if (res) {
			toast.add({
				title: 'Konto oprettet',
				description: 'Skal vi tage dig til login siden?',
				icon: 'i-material-symbols-person-check',
				timeout: 20000,
				actions: [
					{
						label: 'Ja, før mig til login siden',
						click: async () => {
							await navigateTo('/auth/login');
						},
					},
				],
			});
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
		} else if (error.statusCode === 409) {
			form.value!.setErrors([
				{
					message: 'Email er allerede i brug',
					path: 'email',
				},
			]);
		}
	}
}

/**
 * Apartments
 */
const apartments = ref<{ id: number; address: string }[]>([]);

async function fetchApartments() {
	const { data } = await useFetch('/api/apartments');

	if (data.value === null) return;

	apartments.value = data.value.map((apartment) => {
		let address = `${apartment.street} ${apartment.number}`;
		if (apartment.floor && apartment.door) {
			address += `, ${apartment.floor}, ${apartment.door}`;
		}

		return {
			id: apartment.id,
			address,
		};
	});
}

/**
 * Persons
 */

function addPerson() {
	state.persons.push({
		name: undefined,
		email: undefined,
		phone: undefined,
	});
}

function removePerson(index: number) {
	state.persons.splice(index, 1);
}
fetchApartments();
</script>
