<template>
	<section
		class="lg:w-2/4 lg:px-0 px-4 mx-auto flex flex-col items-center gap-4 mt-12"
	>
		<UForm
			:schema="schema"
			:state="state"
			@submit="onSubmit"
			class="md:w-3/4 w-full"
		>
			<UCard>
				<template #header>
					<h1 class="text-2xl font-semibold text-primary">
						Registér - {{ activeTabName }}
					</h1>
				</template>

				<template v-if="activeTab === 0">
					<p class="mb-3">
						Vi har brug for at vide hvilken lejlighed du bor i. Når du har
						oprettet din konto vil Afdelingsbestyrelsen verificere den
						indtastede information.
					</p>

					<hr class="border-gray-200 dark:border-gray-800" />

					<UFormGroup label="Lejlighed" name="apartment" class="mt-3">
						<UInputMenu
							v-model="state.apartmentId"
							:options="apartments"
							value-attribute="id"
							option-attribute="address"
						/>
					</UFormGroup>
				</template>

				<template v-else-if="activeTab === 1">
					<p class="mb-3">
						Vi har brug for login informationer, så du kan logge ind på din
						konto. Din adgangskoden bliver krypteret før den bliver sendt til
						vores servere.
					</p>

					<hr class="border-gray-200 dark:border-gray-800" />

					<UFormGroup label="Email" name="email" class="mt-3">
						<UInput v-model="state.email" />
					</UFormGroup>

					<UFormGroup label="Kodeord" name="password" class="mt-3">
						<UInput v-model="state.password" type="password" />
					</UFormGroup>
				</template>

				<template v-else-if="activeTab === 2">
					<p class="mb-3">
						Vi har brug for kontaktinformationer på alle beboere i lejligheden.
						Det er vigtigt at vi har korrekte informationer, så vi kan kontakte
						jer.
					</p>

					<hr class="border-gray-200 dark:border-gray-800" />

					<!-- Contact Information -->
					<div class="flex flex-col gap-6 my-3">
						<template v-for="(person, index) in state.persons">
							<UFormGroup
								:label="`Person ${index + 1}`"
								:name="`person-${index}`"
							>
								<UFormGroup label="Navn" name="name">
									<UInput v-model="person.name" label="Name" />
								</UFormGroup>
								<UFormGroup label="Email" name="email" class="mt-3">
									<UInput v-model="person.email" />
								</UFormGroup>
								<UFormGroup label="Telefon" name="phone" class="mt-3">
									<UInput v-model="person.phone" label="Phone" />
								</UFormGroup>
								<UButton
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

					<template v-if="state.persons.length < 2">
						<hr class="border-gray-200 dark:border-gray-800" />

						<UButton
							color="emerald"
							variant="soft"
							@click="addPerson"
							class="mt-3"
						>
							Tilføj kontaktperson
						</UButton>
					</template>
				</template>

				<template #footer>
					<div
						class="flex gap-3 flex-wrap md:flex-nowrap flex-1 justify-between"
					>
						<template v-if="activeTab === 0">
							<ULink
								to="/auth/login"
								class="text-gray-500 underline hover:text-gray-600 dark:hover:text-gray-400"
							>
								Har du allerede en konto?
							</ULink>

							<UButton class="md:max-w-[48%]" @click="nextTab" block
								>Næste</UButton
							>
						</template>

						<template v-if="activeTab === 1">
							<UButton
								variant="outline"
								class="md:max-w-[48%]"
								@click="prevTab"
								block
								>Forrige</UButton
							>
							<UButton class="md:max-w-[48%]" @click="nextTab" block
								>Næste</UButton
							>
						</template>

						<template v-if="activeTab === 2">
							<UButton
								variant="outline"
								class="md:max-w-[48%]"
								@click="prevTab"
								block
								>Forrige</UButton
							>
							<UButton class="md:max-w-[48%]" type="submit" block
								>Registér</UButton
							>
						</template>
					</div>
				</template>
			</UCard>
		</UForm>
	</section>
</template>

<script lang="ts" setup>
import { z } from 'zod';
import type { FormSubmitEvent } from '#ui/types';

definePageMeta({
	layout: 'minimal',
});

useHead({
	title: 'Registér',
});

/**
 * Form
 */

const schema = z.object({
	apartmentId: z.number(),
	email: z.string().email('Invalid email'),
	password: z.string().min(8, 'Must be at least 8 characters'),
	persons: z
		.array(
			z.object({
				name: z.string(),
				email: z.string().email('Invalid email'),
				phone: z.string(),
			}),
		)
		.min(1, 'Must have at least 1 person')
		.max(2, 'Must have at most 2 persons'),
});

type Schema = z.output<typeof schema>;

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
	persons: [],
});

async function onSubmit(event: FormSubmitEvent<Schema>) {
	try {
		const res = await $fetch('/api/auth/register', {
			method: 'POST',
			body: {
				apartmentId: event.data.apartmentId,
				email: event.data.email,
				password: event.data.password,
				persons: event.data.persons,
			},
		});

		console.log(res);
	} catch (error) {
		console.log(error);
	}
}

/**
 * Tabs
 */

const tabs = ref([
	{
		name: 'Lejlighed',
	},
	{
		name: 'Login',
	},
	{
		name: 'Kontakt',
	},
]);
const activeTab = ref(0);

const activeTabName = computed(() => tabs.value[activeTab.value].name);

function nextTab() {
	if (activeTab.value === tabs.value.length - 1) return;

	activeTab.value += 1;
}

function prevTab() {
	if (activeTab.value === 0) return;

	activeTab.value -= 1;
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
