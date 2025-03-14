<template>
	<section class="sm:w-full lg:w-3/4 mx-auto pt-8 px-4 md:px-0">
		<div class="mb-8">
			<h1 class="text-(--ui-primary) text-2xl mt-2 mb-2">Indstillinger</h1>
			<p>Her kan du ændre oplysninger der er tilknyttet din bruger.<br /></p>
		</div>

		<ClientOnly>
			<hr class="border-gray-200 dark:border-gray-800 mb-5" />

			<h2 class="text-lg">Kontaktpersoner</h2>
			<p class="text-sm mb-5">
				Tilføj eller fjern personer der er tilknyttet din bruger.<br />
				Minimum én person skal være tilknyttet, max 2 personer.
			</p>

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
							root: 'flex flex-col',
							body: 'flex-1',
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
								color="success"
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

			<h2 class="text-lg mt-8">Notificationer</h2>
			<p class="text-sm mb-5">
				Aktiver notifikationer for at modtage beskeder fra os.<br />
				Dette kan være opdateringer omkring din bruger, bookinger eller andet.
			</p>

			<div class="flex flex-col md:flex-row gap-4">
				<UTooltip text="Klik for at aktivere notifikationer på denne enhed">
					<UButton
						icon="i-material-symbols-notification-add-outline-rounded"
						label="Aktiver"
						color="success"
						variant="soft"
						class="flex-1"
						@click="subscribeToPush()"
						:loading="subscribeToPushLoading"
						block
					/>
				</UTooltip>

				<UTooltip text="Klik for at deaktivere notifikationer på denne enhed">
					<UButton
						icon="i-material-symbols-notifications-off-outline-rounded"
						label="Deaktiver"
						color="error"
						variant="soft"
						class="flex-1"
						@click="unsubscribeToPush()"
						:loading="unsubscribeToPushLoading"
						block
					/>
				</UTooltip>

				<UPopover :popper="{ placement: 'top-start' }" overlay>
					<UTooltip
						class="w-full"
						text="Klik for at deaktivere notifikationer på alle enheder"
					>
						<UButton
							icon="i-material-symbols-notifications-off-rounded"
							label="Deaktiver alle"
							color="error"
							variant="soft"
							class="flex-1"
							:loading="unsubscribeToPushEverywhereLoading"
							block
						/>
					</UTooltip>

					<template #panel>
						<div class="p-4">
							<h3 class="text-sm font-semibold mb-2">Advarsel!</h3>
							<p class="text-xs">
								Du er ved at deaktivere notifikationer på alle enheder. <br />
								Dette vil medføre, at du ikke længere modtager notifikationer.
							</p>

							<UButton
								label="Godkend"
								icon="i-material-symbols-check-circle-rounded"
								color="error"
								variant="soft"
								size="xs"
								@click="unsubscribeToPushEverywhere()"
								:loading="unsubscribeToPushEverywhereLoading"
								class="mt-4"
							/>
						</div>
					</template>
				</UPopover>
			</div>

			<hr class="border-gray-200 dark:border-gray-800 mt-10 mb-5" />

			<h2 class="text-lg mt-8">Handlinger</h2>
			<p class="text-sm mb-5">
				Foretag handlinger der påvirker din bruger.<br />
				Disse handlinger kan ikke fortrydes.
			</p>

			<div class="flex flex-col md:flex-row gap-4">
				<UPopover :popper="{ placement: 'top-start' }" overlay>
					<UTooltip class="w-full" text="Klik for at logge ud på alle enheder">
						<UButton
							icon="i-material-symbols-key-off-outline-rounded"
							label="Log ud på alle enheder"
							color="error"
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
								color="error"
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
					<UTooltip
						class="w-full"
						text="Klik for at permanent slette din bruger"
					>
						<UButton
							icon="i-material-symbols-delete-forever-outline-rounded"
							label="Slet bruger"
							color="error"
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

							<UFormField
								class="mt-4"
								label="Adgangskode"
								help="Indtast din adgangskode for at bekræfte."
								:error="wrongCurrentSessionPassword && 'Forkert adgangskode!'"
								size="xs"
							>
								<UInput
									size="xs"
									type="password"
									v-model="currentSessionPassword"
								/>
							</UFormField>

							<UButton
								label="Godkend"
								icon="i-material-symbols-check-circle-rounded"
								color="error"
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
		const { data } = await useFetch('/api/app/users/me');

		if (data.value === null) {
			fetchingMe.value = false;
			me.value = undefined;
			return;
		}

		me.value = data.value['user'];
	} catch (error) {
		toast.add({
			icon: 'i-material-symbols-error-outline-rounded',
			title: 'Fejl!',
			description: 'Der skete en fejl...',
			actions: [
				{
					label: 'Genindlæs siden',
					onClick:() => reloadNuxtApp(),
				},
			],
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
		const { data } = await useFetch('/api/app/users/me/persons');

		if (data.value === null) {
			fetchingPersons.value = false;
			persons.value = [];
			return;
		}

		persons.value = data.value['persons'];
	} catch (error) {
		toast.add({
			icon: 'i-material-symbols-error-outline-rounded',
			title: 'Fejl!',
			description: 'Der skete en fejl...',
			actions: [
				{
					label: 'Genindlæs siden',
					onClick:() => reloadNuxtApp(),
				},
			],
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
		const { data } = await useFetch('/api/app/users/me/logins');

		if (data.value === null) {
			fetchingLogins.value = false;
			logins.value = [];
			return;
		}

		logins.value = data.value['logins'];
	} catch (error) {
		toast.add({
			icon: 'i-material-symbols-error-outline-rounded',
			title: 'Fejl!',
			description: 'Der skete en fejl...',
			actions: [
				{
					label: 'Genindlæs siden',
					onClick:() => reloadNuxtApp(),
				},
			],
		});
		fetchingLogins.value = false;
	}

	fetchingLogins.value = false;
}
fetchLogins();

/**
 * Push Notifications
 */
const {
	isSupported,
	hasPermission,
	askPermission,
	subscribeUserToPush,
	getSubscription,
} = usePush();

const subscribeToPushLoading = ref<boolean>(false);

async function subscribeToPush() {
	subscribeToPushLoading.value = true;

	if (!isSupported.value) {
		subscribeToPushLoading.value = false;
		toast.add({
			icon: 'i-material-symbols-warning-outline-rounded',
			title: 'Advarel!',
			description: 'Notifikationer er ikke understøttet på denne enhed',
		});
		return;
	}

	if (!hasPermission.value) {
		const permission = await askPermission();

		if (!permission) {
			subscribeToPushLoading.value = false;
			toast.add({
				icon: 'i-material-symbols-error-outline-rounded',
				title: 'Fejl!',
				description:
					'Du har ikke givet tilladelse til at vi må sende notifikationer',
			});
			return;
		}
	}

	await subscribeUserToPush();

	subscribeToPushLoading.value = false;
}

const unsubscribeToPushLoading = ref<boolean>(false);

async function unsubscribeToPush() {
	unsubscribeToPushLoading.value = true;

	try {
		const subscription = await getSubscription();

		if (!subscription) {
			toast.add({
				icon: 'i-material-symbols-info-outline-rounded',
				title: 'Info!',
				description: 'Du modtager ikke notifikationer på denne enhed',
			});
			return;
		}

		const res = await $fetch('/api/app/push/unsubscribe', {
			method: 'POST',
			body: {
				subscription: subscription.toJSON(),
			},
		});

		if (res) {
			toast.add({
				icon: 'i-material-symbols-check-circle-outline-rounded',
				title: 'Succes!',
				description: 'Du modtager ikke længere notifikationer på denne enhed',
			});
		}
	} catch (error: any) {
		toast.add({
			icon: 'i-material-symbols-error-outline-rounded',
			title: 'Fejl!',
			description: 'Der skete en fejl...',
			actions: [
				{
					label: 'Prøv igen',
					onClick:unsubscribeToPush,
				},
			],
		});
	}

	unsubscribeToPushLoading.value = false;
}

const unsubscribeToPushEverywhereLoading = ref<boolean>(false);

async function unsubscribeToPushEverywhere() {
	unsubscribeToPushEverywhereLoading.value = true;

	try {
		const res = await $fetch('/api/app/push/unsubscribe', {
			method: 'POST',
			query: {
				everywhere: true,
			},
		});

		if (res) {
			toast.add({
				icon: 'i-material-symbols-check-circle-outline-rounded',
				title: 'Succes!',
				description: 'Du modtager ikke længere notifikationer på nogen enheder',
			});
		}
	} catch (error: any) {
		toast.add({
			icon: 'i-material-symbols-error-outline-rounded',
			title: 'Fejl!',
			description: 'Der skete en fejl...',
			actions: [
				{
					label: 'Prøv igen',
					onClick:unsubscribeToPushEverywhere,
				},
			],
		});
	}

	unsubscribeToPushEverywhereLoading.value = false;
}

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

		const res = await $fetch('/api/app/users/me/delete', {
			method: 'POST',
			body: {
				currentSessionPassword: passwordHash,
			},
		});

		if (res) {
			await logoutEverywhere();

			toast.add({
				icon: 'i-material-symbols-check-circle-outline-rounded',
				title: 'Succes!',
				description: 'Din bruger blev slettet, og du er blevet logget ud.',
			});
		}
	} catch (error: any) {
		if (error.status === 401) {
			wrongCurrentSessionPassword.value = true;
		} else {
			toast.add({
				icon: 'i-material-symbols-error-outline-rounded',
				title: 'Fejl!',
				description: 'Der skete en fejl...',
				actions: [
					{
						label: 'Prøv igen',
						onClick:deleteAccount,
					},
				],
			});
		}
	}

	deleteAccountLoading.value = false;
}

const logoutEverywhereLoading = ref<boolean>(false);

async function logoutEverywhere() {
	logoutEverywhereLoading.value = true;

	try {
		const res = await $fetch('/api/app/auth/logout', {
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
			icon: 'i-material-symbols-error-outline-rounded',
			title: 'Fejl!',
			description: 'Der skete en fejl...',
			actions: [
				{
					label: 'Genindlæs siden',
					onClick:() => reloadNuxtApp(),
				},
			],
		});
	}

	logoutEverywhereLoading.value = false;
}
</script>

<style></style>
