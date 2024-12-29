<template>
	<section class="sm:w-full lg:w-3/4 mx-auto pt-8 px-4 md:px-0">
		<div class="mb-8">
			<h1 class="text-primary text-2xl mt-2 mb-2">Indstillinger</h1>
			<p>Her kan du ændre oplysninger der er tilknyttet din bruger.<br /></p>
		</div>

		<ClientOnly>
			<hr class="border-gray-200 dark:border-gray-800 mb-5" />

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

			<hr class="border-gray-200 dark:border-gray-800 mt-10 mb-5" />

			<h2 class="text-lg mt-8 mb-4">Handlinger</h2>

			<div class="flex flex-col md:flex-row gap-4">
				<UPopover :popper="{ placement: 'top-start' }" overlay>
					<UTooltip text="Klik for at logge ud på alle enheder">
						<UButton
							icon="i-material-symbols-key-off-outline-rounded"
							label="Log ud på alle enheder"
							color="red"
							variant="soft"
							class="flex-1"
							block
						/>
					</UTooltip>

					<template #panel>
						<div class="p-4">
							<h3 class="text-sm font-semibold mb-2">Advarsel!</h3>
							<p class="text-xs">
								Du er ved at logge ud på alle enheder. <br />
								Dette vil medføre, at du skal logge ind igen på alle enheder.
							</p>

							<UButton
								label="Godkend"
								icon="i-material-symbols-check-circle-rounded"
								color="red"
								variant="soft"
								size="xs"
								@click="logoutEverywhere"
								:loading="logoutEverywhereLoading"
								class="mt-4"
							/>
						</div>
					</template>
				</UPopover>

				<UPopover :popper="{ placement: 'top-start' }" overlay>
					<UTooltip text="Klik for at permanent slette din bruger">
						<UButton
							icon="i-material-symbols-delete-outline-rounded"
							label="Slet bruger"
							color="red"
							variant="soft"
							class="flex-1"
							block
						/>
					</UTooltip>

					<template #panel>
						<div class="p-4">
							<h3 class="text-sm font-semibold mb-2">Advarsel!</h3>
							<p class="text-xs">
								Du er ved at slette din bruger. <br />
								Dette kan ikke fortrydes, og alle dine data vil blive slettet.
								<br />
								<span class="italic"
									>Fremtidige bookinger vil blive annulleret.</span
								>
							</p>

							<UFormGroup
								class="mt-4"
								label="Adgangskode"
								help="Vi skal bruge din adgangskode for at bekræfte handlingen"
								:error="wrongCurrentSessionPassword && 'Forkert adgangskode'"
								size="xs"
							>
								<UInput
									size="xs"
									type="password"
									v-model="currentSessionPassword"
								/>
							</UFormGroup>

							<UButton
								label="Godkend"
								icon="i-material-symbols-check-circle-rounded"
								color="red"
								variant="soft"
								size="xs"
								@click="deleteAccount"
								:loading="deleteAccountLoading"
								class="mt-4"
							/>
						</div>
					</template>
				</UPopover>
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

/**
 * Account Actions
 */
const currentSessionPassword = ref<string>('');
const wrongCurrentSessionPassword = ref<boolean>(false);
const deleteAccountLoading = ref<boolean>(false);

const { hash } = useHash();

async function deleteAccount() {
	deleteAccountLoading.value = true;
	wrongCurrentSessionPassword.value = false;

	try {
		const passwordHash = await hash(currentSessionPassword.value);

		const res = await $fetch('/api/users/me', {
			method: 'DELETE',
			body: {
				currentSessionPassword: passwordHash,
			},
		});

		if (res) {
			await logoutEverywhere();

			toast.add({
				title: 'Din bruger blev slettet, og du er blevet logget ud.',
			});
		}
	} catch (error: any) {
		if (error.status === 401) {
			wrongCurrentSessionPassword.value = true;
		} else {
			toast.add({
				title: 'Der skete en fejl ved sletning af brugeren',
			});
		}
	}

	deleteAccountLoading.value = false;
}

const logoutEverywhereLoading = ref<boolean>(false);

async function logoutEverywhere() {
	logoutEverywhereLoading.value = true;

	try {
		const res = await $fetch('/api/auth/logout', {
			method: 'POST',
			query: {
				everywhere: true,
			},
		});

		if (res) {
			await navigateTo('/');
		}
	} catch (error) {
		toast.add({
			title: 'Der skete en fejl ved logout, genindlæs siden',
		});
	}

	logoutEverywhereLoading.value = false;
}
</script>

<style></style>
