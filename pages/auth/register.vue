<template>
	<section
		class="lg:w-2/4 lg:px-0 px-4 mx-auto flex flex-col items-center gap-4 mt-12"
	>
		<ClientOnly>
			<UForm
				ref="form"
				:schema="schema"
				:state="state"
				@submit.prevent="onSubmit"
				class="md:w-3/4 w-full"
			>
				<UCard>
					<template #header>
						<h1 class="text-2xl font-semibold text-(--ui-primary)">Registér</h1>
					</template>

					<h3 class="text-xl font-semibold text-(--ui-primary) mb-2">Lejlighed</h3>

					<p class="mb-5">
						Vi har brug for at vide hvilken lejlighed du bor i. Når du har
						oprettet din konto vil Afdelingsbestyrelsen verificere de indtastede
						informationer.
					</p>

					<UFormField
						label="Lejlighed"
						name="apartmentId"
						class="mt-3 mb-5"
						required
					>
						<USelectMenu
							v-model="state.apartmentId"
							:items="apartments"
							value-attribute="id"
							option-attribute="address"
						/>
					</UFormField>

					<hr class="border-gray-200 dark:border-gray-800 mb-5" />

					<h3 class="text-xl font-semibold text-(--ui-primary) mb-2">Login</h3>

					<p class="mb-5">
						Vi har brug for login informationer, så du kan logge ind på din
						konto. Din adgangskoden bliver krypteret før den bliver sendt til
						vores servere.
					</p>

					<UFormField label="Email" name="email" class="my-3" required>
						<UInput v-model="state.email" />
					</UFormField>

					<UFormField
						label="Kodeord"
						name="password"
						class="mt-3 mb-5"
						eager-validation
						required
					>
						<Password v-model="state.password" />
					</UFormField>

					<hr class="border-gray-200 dark:border-gray-800 mb-5" />

					<h3 class="text-xl font-semibold text-(--ui-primary) mb-2">Kontakt</h3>

					<p class="mb-5">
						Vi har brug for kontaktinformationer på alle beboere i lejligheden.
						Det er vigtigt at vi har korrekte informationer, så vi kan kontakte
						jer.
					</p>

					<!-- Contact Information -->
					<UFormField name="persons">
						<div class="flex flex-col gap-6">
							<template v-for="(person, index) in state.persons">
								<UFormField
									:label="`${index + 1}. kontaktperson`"
									:name="`persons.${index}`"
								>
									<UFormField
										label="Navn"
										:name="`persons.${index}.name`"
										class="mt-3"
										required
									>
										<UInput v-model="person.name" label="Name" />
									</UFormField>
									<UFormField
										label="Email"
										:name="`persons.${index}.email`"
										class="mt-3"
										required
									>
										<UInput v-model="person.email" />
									</UFormField>
									<UFormField
										label="Telefon"
										:name="`persons.${index}.phone`"
										class="mt-3"
										required
									>
										<UInput v-model="person.phone" label="Phone" />
									</UFormField>
									<UButton
										v-if="state.persons.length > 1"
										color="error"
										variant="soft"
										@click="() => removePerson(index)"
										class="mt-5"
									>
										Fjern kontaktperson
									</UButton>
								</UFormField>
							</template>
						</div>
					</UFormField>

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

					<hr class="border-gray-200 dark:border-gray-800 mb-5" />

					<h3 class="text-xl font-semibold text-(--ui-primary) mb-2">Samtykke</h3>

					<p class="mb-5">
						Vi har brug for dit samtykke til at behandle dine informationer i
						overstemmelse med vores
						<ULink to="/privacy" target="_blank" class="text-(--ui-primary) underline"
							>privatlivspolitik</ULink
						>.
					</p>

					<UFormField name="acceptedPrivacyPolicy" class="mt-3 mb-5" required>
						<UCheckbox
							v-model="state.acceptedPrivacyPolicy"
							label="Jeg giver samtykke til at mine informationer bliver behandlet i henhold til privatlivspolitikken"
							class="select-none"
						/>
					</UFormField>

					<template #footer>
						<div
							class="flex gap-3 flex-wrap md:flex-nowrap flex-1 justify-between"
						>
							<ULink
								to="/auth/login"
								class="text-neutral-500 underline hover:text-neutral-600 dark:hover:text-neutral-400"
							>
								Har du allerede en konto?
							</ULink>

							<UButton
								:loading="onSubmitLoading"
								class="md:max-w-[48%]"
								type="submit"
								block
								>Registér</UButton
							>
						</div>
					</template>
				</UCard>
			</UForm>
		</ClientOnly>
	</section>
</template>

<script lang="ts" setup>
import { z } from 'zod';
import type { Form, FormSubmitEvent } from '#ui/types';
import type { Apartment } from '~/utils/types/global';

definePageMeta({
	layout: 'minimal',
	middleware: 'guest-required',
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
				phone: z
					.string({
						required_error: 'Påkrævet',
					})
					.min(8, 'Telefonnummeret skal være mindst 8 tegn'),
			}),
		)
		.min(1, 'Det skal være mindst 1 kontaktperson')
		.max(2, 'Det kan maksimalt være 2 kontaktpersoner'),
	acceptedPrivacyPolicy: z
		.boolean({
			required_error: 'Påkrævet',
		})
		.refine((value) => value === true, {
			message: 'Påkrævet',
		}),
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
	acceptedPrivacyPolicy: boolean;
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
	acceptedPrivacyPolicy: false,
});

const onSubmitLoading = ref<boolean>(false);

async function onSubmit(event: FormSubmitEvent<Schema>) {
	onSubmitLoading.value = true;

	form.value!.clear();
	try {
		const passwordHash = await hash(event.data.password);

		const res = await $fetch('/api/app/auth/register', {
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
				icon: 'i-material-symbols-person-check',
				title: 'Konto oprettet',
				description: 'Skal vi tage dig til login siden?',
				duration: 20000,
				actions: [
					{
						label: 'Ja, før mig til login siden',
						onClick:async () => {
							await navigateTo('/auth/login');
						},
					},
				],
			});
		} else {
			toast.add({
				icon: 'i-material-symbols-error-outline-rounded',
				title: 'Fejl!',
				description: 'Der skete en fejl...',
				actions: [
					{
						label: 'Prøv igen',
						onClick:() => onSubmit(event),
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
		} else {
			toast.add({
				icon: 'i-material-symbols-error-outline-rounded',
				title: 'Fejl!',
				description: 'Der skete en fejl...',
				actions: [
					{
						label: 'Prøv igen',
						onClick:() => onSubmit(event),
					},
				],
			});
		}
	}

	onSubmitLoading.value = false;
}

/**
 * Apartments
 */
const apartments = ref<{ id: number; address: string }[]>([]);

async function fetchApartments() {
	const { data } = await useFetch('/api/app/apartments');

	if (data.value === null) return;

	apartments.value = data.value.map((apartment: Apartment) => {
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
