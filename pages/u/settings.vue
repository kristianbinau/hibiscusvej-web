<template>
	<section class="sm:w-full lg:w-3/4 mx-auto pt-8 px-4 md:px-0">
		<div class="mb-8">
			<h1 class="text-primary text-2xl mt-2 mb-2">Indstillinger</h1>
			<p>Her kan du ændre oplysninger der er tilknyttet din bruger.<br /></p>
		</div>

		<ClientOnly>
			<h2 class="text-lg mb-4">Kontaktpersoner</h2>

			<div class="flex flex-col md:flex-row gap-4">
				<UserPerson
					v-for="person in persons"
					:key="person.id"
					:person="person"
					:personIndex="getPersonIndex(person)"
					class="flex-1"
					:deleteable="savedPersonsCount > 1"
					@delete="removePerson(person)"
				/>
				<template v-if="persons.length < 2">
					<UCard
						class="flex-1 relative"
						:ui="{
							base: 'flex flex-col',
							body: { base: 'flex-1' },
						}"
					>
						<template #header>
							<USkeleton class="h-6"></USkeleton>
						</template>

						<USkeleton class="h-full min-h-32"></USkeleton>
						<UTooltip
							text="Tilføj en person"
							class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
						>
							<UButton
								icon="i-material-symbols-add-box-rounded"
								size="sm"
								color="green"
								square
								variant="solid"
								@click="addPerson"
							/>
						</UTooltip>

						<template #footer>
							<USkeleton class="h-6"></USkeleton>
						</template>
					</UCard>
				</template>
			</div>
		</ClientOnly>
	</section>
</template>

<script lang="ts" setup>
import type { MeLogin, MePerson, Me } from '~/utils/types/settings';

const toast = useToast();

definePageMeta({
	layout: 'logged-in',
	middleware: 'auth-required',
});

useHead({
	title: 'Indstillinger',
});

/**
 * Fetch
 */
const me = ref<Me | undefined>(undefined);
const fetchingMe = ref(true);

async function fetchMe() {
	fetchingMe.value = true;

	try {
		const { data } = await useFetch('/api/users/me');

		if (data.value === null) {
			fetchingMe.value = false;
			me.value = undefined;
			return;
		}

		me.value = data.value['user'];
	} catch (error) {
		toast.add({
			title: 'Der skete en fejl ved hentning af brugerdata, genindlæs siden',
		});
		fetchingMe.value = false;
	}

	fetchingMe.value = false;
}
fetchMe();

/**
 * Persons
 */

const persons = ref<MePerson[]>([]);
const fetchingPersons = ref(true);

async function fetchPersons() {
	fetchingPersons.value = true;

	try {
		const { data } = await useFetch('/api/users/me/persons');

		if (data.value === null) {
			fetchingPersons.value = false;
			persons.value = [];
			return;
		}

		persons.value = data.value['persons'];
	} catch (error) {
		toast.add({
			title: 'Der skete en fejl ved hentning af brugerdata, genindlæs siden',
		});
		fetchingPersons.value = false;
	}

	fetchingPersons.value = false;
}
fetchPersons();

function addPerson() {
	persons.value.push({
		id: 0,
		userId: me.value!.id,
		name: '',
		email: '',
		phone: '',
		createdAt: '',
		updatedAt: '',
	});
}

const savedPersonsCount = computed(
	() => persons.value.filter((person) => person.id !== 0).length,
);

function removePerson(person: MePerson) {
	const index = persons.value.indexOf(person);
	persons.value.splice(index, 1);
}

function getPersonIndex(person: MePerson) {
	return persons.value.indexOf(person) + 1;
}

/**
 * Logins
 */

const logins = ref<MeLogin[]>([]);
const fetchingLogins = ref(true);

async function fetchLogins() {
	fetchingLogins.value = true;

	try {
		const { data } = await useFetch('/api/users/me/logins');

		if (data.value === null) {
			fetchingLogins.value = false;
			logins.value = [];
			return;
		}

		logins.value = data.value['logins'];
	} catch (error) {
		toast.add({
			title: 'Der skete en fejl ved hentning af brugerdata, genindlæs siden',
		});
		fetchingLogins.value = false;
	}

	fetchingLogins.value = false;
}
fetchLogins();
</script>

<style></style>
