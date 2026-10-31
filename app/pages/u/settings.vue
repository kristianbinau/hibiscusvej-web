<template>
	<section class="sm:w-full lg:w-3/4 mx-auto pt-8 px-4 md:px-0">
		<div class="mb-8">
			<h1 class="text-(--ui-primary) text-2xl mt-2 mb-2">
				{{ t('settings.title') }}
			</h1>
			<p>{{ t('settings.description') }}<br /></p>
		</div>

		<ClientOnly>
			<hr class="border-gray-200 dark:border-gray-800 mb-5" />

			<h2 class="text-lg">{{ t('settings.persons.heading') }}</h2>
			<p class="text-sm mb-5">
				{{ t('settings.persons.description1') }}<br />
				{{ t('settings.persons.description2') }}
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
							:text="t('settings.persons.addTooltip')"
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

			<h2 class="text-lg mt-8">{{ t('settings.notifications.heading') }}</h2>
			<p class="text-sm mb-5">
				{{ t('settings.notifications.description1') }}<br />
				{{ t('settings.notifications.description2') }}
			</p>

			<div class="flex flex-col md:flex-row gap-4">
				<UTooltip :text="t('settings.notifications.enableTooltip')">
					<UButton
						icon="i-material-symbols-notification-add-outline-rounded"
						:label="t('settings.notifications.enable')"
						color="success"
						variant="soft"
						class="flex-1"
						@click="subscribeToPush()"
						:loading="subscribeToPushLoading"
						block
					/>
				</UTooltip>

				<UTooltip :text="t('settings.notifications.disableTooltip')">
					<UButton
						icon="i-material-symbols-notifications-off-outline-rounded"
						:label="t('settings.notifications.disable')"
						color="error"
						variant="soft"
						class="flex-1"
						@click="unsubscribeToPush()"
						:loading="unsubscribeToPushLoading"
						block
					/>
				</UTooltip>

				<UPopover
					:content="{
						align: 'start',
						side: 'top',
					}"
				>
					<UTooltip
						class="w-full"
						:text="t('settings.notifications.disableAllTooltip')"
					>
						<UButton
							icon="i-material-symbols-notifications-off-rounded"
							:label="t('settings.notifications.disableAll')"
							color="error"
							variant="soft"
							class="flex-1"
							:loading="unsubscribeToPushEverywhereLoading"
							block
						/>
					</UTooltip>

					<template #content>
						<div class="p-4">
							<h3 class="text-sm font-semibold mb-2">
								{{ t('common.warning') }}
							</h3>
							<p class="text-xs">
								{{ t('settings.notifications.disableAllWarning1') }} <br />
								{{ t('settings.notifications.disableAllWarning2') }}
							</p>

							<UButton
								:label="t('common.confirm')"
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

			<h2 class="text-lg mt-8">{{ t('settings.language.heading') }}</h2>
			<p class="text-sm mb-5">
				{{ t('settings.language.description') }}
			</p>

			<div class="flex flex-col md:flex-row gap-4">
				<ULocaleSelect
					:locales="uiLocales"
					:model-value="locale"
					:disabled="switching"
					class="flex-1 max-w-xs"
					@update:model-value="
						(value: string) => switchLanguage(value as LocaleCode)
					"
				/>
			</div>

			<hr class="border-gray-200 dark:border-gray-800 mt-10 mb-5" />

			<h2 class="text-lg mt-8">{{ t('settings.actions.heading') }}</h2>
			<p class="text-sm mb-5">
				{{ t('settings.actions.description1') }}<br />
				{{ t('settings.actions.description2') }}
			</p>

			<div class="flex flex-col md:flex-row gap-4">
				<UPopover
					:content="{
						align: 'start',
						side: 'top',
					}"
				>
					<UTooltip
						class="w-full"
						:text="t('settings.actions.logoutEverywhereTooltip')"
					>
						<UButton
							icon="i-material-symbols-key-off-outline-rounded"
							:label="t('settings.actions.logoutEverywhere')"
							color="error"
							variant="soft"
							class="flex-1"
							block
						/>
					</UTooltip>

					<template #content>
						<div class="p-4">
							<h3 class="text-sm font-semibold mb-2">
								{{ t('common.warning') }}
							</h3>
							<p class="text-xs">
								{{ t('settings.actions.logoutEverywhereWarning1') }} <br />
								{{ t('settings.actions.logoutEverywhereWarning2') }}
							</p>

							<UButton
								:label="t('common.confirm')"
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

				<UPopover
					:content="{
						align: 'start',
						side: 'top',
					}"
				>
					<UTooltip
						class="w-full"
						:text="t('settings.actions.deleteUserTooltip')"
					>
						<UButton
							icon="i-material-symbols-delete-forever-outline-rounded"
							:label="t('settings.actions.deleteUser')"
							color="error"
							variant="soft"
							class="flex-1"
							block
						/>
					</UTooltip>

					<template #content>
						<div class="p-4">
							<h3 class="text-sm font-semibold mb-2">
								{{ t('common.warning') }}
							</h3>
							<p class="text-xs">
								{{ t('settings.actions.deleteUserWarning1') }} <br />
								{{ t('settings.actions.deleteUserWarning2') }}
								<br />
								<span class="italic">
									{{ t('settings.actions.deleteUserBookingsNote') }}
								</span>
							</p>

							<UFormField
								class="mt-4"
								:label="t('settings.actions.passwordLabel')"
								:help="t('settings.actions.passwordHelp')"
								:error="
									wrongCurrentSessionPassword &&
									t('settings.actions.wrongPassword')
								"
								size="xs"
							>
								<UInput
									size="xs"
									type="password"
									v-model="currentSessionPassword"
								/>
							</UFormField>

							<UButton
								:label="t('common.confirm')"
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
import { da as daUiLocale, en as enUiLocale } from '@nuxt/ui/locale';
import type { MeLogin, MePerson, Me } from '~/utils/types/settings';
import type { LocaleCode } from '#shared/constants';

const { t, locale } = useI18n();
const { switchLanguage, switching } = useLanguageSwitch();

const uiLocales = [daUiLocale, enUiLocale];

const toast = useToast();

definePageMeta({
	layout: 'logged-in',
	middleware: 'auth-required',
});

useHead({
	title: () => t('settings.title'),
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

		if (!data.value) {
			fetchingMe.value = false;
			me.value = undefined;
			return;
		}

		me.value = data.value['user'];
	} catch (error) {
		toast.add({
			icon: 'i-material-symbols-error-outline-rounded',
			title: t('common.error'),
			description: t('common.errorDescription'),
			actions: [
				{
					label: t('common.reloadPage'),
					onClick: () => reloadNuxtApp(),
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

		if (!data.value) {
			fetchingPersons.value = false;
			persons.value = [];
			return;
		}

		persons.value = data.value['persons'];
	} catch (error) {
		toast.add({
			icon: 'i-material-symbols-error-outline-rounded',
			title: t('common.error'),
			description: t('common.errorDescription'),
			actions: [
				{
					label: t('common.reloadPage'),
					onClick: () => reloadNuxtApp(),
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

		if (!data.value) {
			fetchingLogins.value = false;
			logins.value = [];
			return;
		}

		logins.value = data.value['logins'];
	} catch (error) {
		toast.add({
			icon: 'i-material-symbols-error-outline-rounded',
			title: t('common.error'),
			description: t('common.errorDescription'),
			actions: [
				{
					label: t('common.reloadPage'),
					onClick: () => reloadNuxtApp(),
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
	if (subscribeToPushLoading.value) return;

	subscribeToPushLoading.value = true;

	if (!isSupported.value) {
		subscribeToPushLoading.value = false;
		toast.add({
			icon: 'i-material-symbols-warning-outline-rounded',
			title: t('common.warning'),
			description: t('common.notifications.unsupported'),
		});
		return;
	}

	if (!hasPermission.value) {
		const permission = await askPermission();

		if (!permission) {
			subscribeToPushLoading.value = false;
			toast.add({
				icon: 'i-material-symbols-error-outline-rounded',
				title: t('common.error'),
				description: t('common.notifications.permissionDenied'),
			});
			return;
		}
	}

	await subscribeUserToPush();

	subscribeToPushLoading.value = false;
}

const unsubscribeToPushLoading = ref<boolean>(false);

async function unsubscribeToPush() {
	if (unsubscribeToPushLoading.value) return;

	unsubscribeToPushLoading.value = true;

	try {
		const subscription = await getSubscription();

		if (!subscription) {
			toast.add({
				icon: 'i-material-symbols-info-outline-rounded',
				title: t('settings.infoTitle'),
				description: t('settings.notifications.notSubscribedHere'),
			});
			unsubscribeToPushLoading.value = false;
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
				title: t('settings.successTitle'),
				description: t('settings.notifications.unsubscribedHere'),
			});
		}
	} catch (error: any) {
		toast.add({
			icon: 'i-material-symbols-error-outline-rounded',
			title: t('common.error'),
			description: t('common.errorDescription'),
			actions: [
				{
					label: t('common.retry'),
					onClick: unsubscribeToPush,
				},
			],
		});
	}

	unsubscribeToPushLoading.value = false;
}

const unsubscribeToPushEverywhereLoading = ref<boolean>(false);

async function unsubscribeToPushEverywhere() {
	if (unsubscribeToPushEverywhereLoading.value) return;

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
				title: t('settings.successTitle'),
				description: t('settings.notifications.unsubscribedEverywhere'),
			});
		}
	} catch (error: any) {
		toast.add({
			icon: 'i-material-symbols-error-outline-rounded',
			title: t('common.error'),
			description: t('common.errorDescription'),
			actions: [
				{
					label: t('common.retry'),
					onClick: unsubscribeToPushEverywhere,
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
				title: t('settings.successTitle'),
				description: t('settings.accountDeleted'),
			});
		}
	} catch (error: any) {
		if (error.status === 401) {
			wrongCurrentSessionPassword.value = true;
		} else {
			toast.add({
				icon: 'i-material-symbols-error-outline-rounded',
				title: t('common.error'),
				description: t('common.errorDescription'),
				actions: [
					{
						label: t('common.retry'),
						onClick: deleteAccount,
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
			title: t('common.error'),
			description: t('common.errorDescription'),
			actions: [
				{
					label: t('common.reloadPage'),
					onClick: () => reloadNuxtApp(),
				},
			],
		});
	}

	logoutEverywhereLoading.value = false;
}
</script>

<style></style>
