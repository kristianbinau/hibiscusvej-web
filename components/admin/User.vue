<template>
	<UCard
		v-if="user"
		class="mb-4 flex flex-col flex-1"
		:ui="{
			base: 'h-dvh !mb-0',
			body: { base: 'overflow-auto flex-1' },
			ring: '',
			divide: 'divide-y divide-gray-100 dark:divide-gray-800',
		}"
	>
		<template #header>
			<div class="flex items-center justify-between">
				<h3
					class="text-base font-semibold leading-6 text-gray-900 dark:text-white"
				>
					ID: {{ user.id }}
				</h3>
			</div>
		</template>

		<div class="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
			<UFormGroup label="Apartment ID">
				<UInput
					disabled
					:model-value="String(user.apartmentId)"
					class="mb-4 disabled:*:cursor-default"
				/>
			</UFormGroup>

			<UFormGroup label="Is Admin">
				<UInput
					disabled
					:model-value="String(user.admin)"
					class="mb-4 disabled:*:cursor-default"
				/>
			</UFormGroup>

			<UFormGroup label="Verified">
				<UInput
					disabled
					:model-value="
						user.verifiedAt
							? String(new Date(user.verifiedAt).toLocaleDateString())
							: 'Ikke verificeret'
					"
					class="mb-4 disabled:*:cursor-default"
				/>
			</UFormGroup>

			<UFormGroup label="Created At">
				<UInput
					disabled
					:model-value="String(new Date(user.createdAt).toLocaleDateString())"
					class="mb-4 disabled:*:cursor-default"
				/>
			</UFormGroup>

			<UFormGroup label="Updated At">
				<UInput
					disabled
					:model-value="String(new Date(user.updatedAt).toLocaleDateString())"
					class="mb-4 disabled:*:cursor-default"
				/>
			</UFormGroup>
		</div>

		<UAccordion
			:items="accordionItems"
			class="mt-4"
			:ui="{ item: { base: 'relative' } }"
		>
			<template #persons>
				<AdminUserPersons
					v-if="showPersons"
					:userId="userId"
					:persons="user.persons"
				/>
			</template>

			<template #logins>
				<AdminUserLogins
					v-if="showLogins"
					:userId="userId"
					:logins="user.logins"
				/>
			</template>

			<template #sessions>
				<AdminUserSessions
					v-if="showSessions"
					:userId="userId"
					:sessions="user.sessions"
				/>
			</template>

			<template #bookings>
				<AdminUserBookings
					v-if="showBookings"
					:userId="userId"
					:bookings="bookings"
				/>
			</template>

			<template #repremands>
				<AdminUserRepremands
					v-if="showRepremands"
					:userId="userId"
					:repremands="repremands"
				/>
			</template>
		</UAccordion>

		<template #footer>
			<div class="flex items-center justify-end gap-3">
				<template v-if="user.verifiedAt === null">
					<UPopover
						class="mr-auto"
						:popper="{ placement: 'top-start' }"
						overlay
					>
						<UTooltip text="Klik for at verificere bruger">
							<UButton
								variant="soft"
								color="amber"
								icon="i-material-symbols-domain-verification-off-rounded"
								:loading="verificationUpdateLoading"
							>
							</UButton>
						</UTooltip>

						<template #panel>
							<div class="p-4">
								<p class="text-xs">
									Du er ved at verificere denne bruger. <br />
									Ved at verificere brugeren, godkender du brugeren adgang til
									systemet.
									<br />
									<span class="italic">Brugeren vil blive underrettet.</span>
								</p>

								<UButton
									label="Godkend"
									icon="i-material-symbols-check-circle-rounded"
									color="green"
									variant="soft"
									size="xs"
									@click="verifyUser"
									:loading="verificationUpdateLoading"
									class="mt-4"
								/>
							</div>
						</template>
					</UPopover>

					<UPopover :popper="{ placement: 'top-end' }" overlay>
						<UTooltip text="Klik for at permanent slette brugeren">
							<UButton
								icon="i-material-symbols-delete-forever-outline-rounded"
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
									Du er ved at slette denne bruger. <br />
									Dette kan ikke fortrydes, og alt data vil blive slettet.
									<br />
									<span class="italic"
										>Fremtidige bookinger vil blive annulleret.</span
									>
								</p>

								<UFormGroup
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
								</UFormGroup>

								<UButton
									label="Godkend"
									icon="i-material-symbols-check-circle-rounded"
									color="red"
									variant="soft"
									size="xs"
									@click="deleteUser"
									:loading="deleteAccountLoading"
									class="mt-4"
								/>
							</div>
						</template>
					</UPopover>
				</template>

				<template v-else>
					<UPopover
						class="mr-auto"
						:popper="{ placement: 'top-start' }"
						overlay
					>
						<UTooltip text="Klik for at fjerne verificering">
							<UButton
								variant="soft"
								color="green"
								icon="i-material-symbols-domain-verification-rounded"
								:loading="verificationUpdateLoading"
							>
							</UButton>
						</UTooltip>

						<template #panel>
							<div class="p-4">
								<h3 class="text-sm font-semibold mb-2">Advarsel!</h3>
								<p class="text-xs">
									Du er ved fjerne verificering af denne bruger. <br />
									Ved at fjerne verificeringen, fjerner du brugerens adgang til
									systemet.
								</p>

								<UButton
									label="Godkend"
									icon="i-material-symbols-check-circle-rounded"
									color="red"
									variant="soft"
									size="xs"
									@click="unverifyUser"
									:loading="verificationUpdateLoading"
									class="mt-4"
								/>
							</div>
						</template>
					</UPopover>
				</template>
			</div>
		</template>
	</UCard>
</template>

<script lang="ts" setup>
import type { Booking, User, UserRepremand } from '~/utils/types/admin';

const emit = defineEmits(['close']);

const {
	userId,
	showPersons,
	showLogins,
	showSessions,
	showBookings,
	showRepremands,
} = defineProps<{
	userId: number;
	showPersons: boolean;
	showLogins: boolean;
	showSessions: boolean;
	showBookings: boolean;
	showRepremands: boolean;
}>();

const user = defineModel<User>('user', { required: false, type: Object });
const bookings = defineModel<Booking[]>('bookings', {
	required: false,
	type: Array,
});
const repremands = defineModel<UserRepremand[]>('repremands', {
	required: false,
	type: Array,
});

const toast = useToast();

const accordionItems = computed(() => {
	const items = [];

	if (showPersons) {
		items.push({
			label: 'Persons',
			icon: 'i-material-symbols-person',
			slot: 'persons',
		});
	}

	if (showLogins) {
		items.push({
			label: 'Logins',
			icon: 'i-material-symbols-passkey',
			slot: 'logins',
		});
	}

	if (showSessions) {
		items.push({
			label: 'Sessions',
			icon: 'i-material-symbols-security-rounded',
			slot: 'sessions',
		});
	}

	if (showBookings) {
		items.push({
			label: 'Bookings',
			icon: 'i-material-symbols-calendar-clock-outline-rounded',
			slot: 'bookings',
		});
	}

	if (showRepremands) {
		items.push({
			label: 'Repremands',
			icon: 'i-material-symbols-warning-outline-rounded',
			slot: 'repremands',
		});
	}

	return items;
});

/**
 * Fetch Missing
 */

onMounted(() => {
	if (user.value === undefined) {
		fetchUser();
	}
});

const fetchingUser = ref(false);
async function fetchUser() {
	if (fetchingUser.value) {
		return;
	}

	fetchingUser.value = true;

	try {
		const { data } = await useFetch(`/api/app/admin/users/${userId}`, {
			server: false,
		});

		if (data.value === null) {
			fetchingUser.value = false;
			toast.add({
				title: 'Brugeren blev ikke fundet',
			});
			return;
		}

		user.value = data.value as User;
	} catch (error) {
		toast.add({
			title: 'Der skete en fejl ved hentning af brugeren, genindlæs siden',
		});
	}

	fetchingUser.value = false;
}

/**
 * Actions
 */

const verificationUpdateLoading = ref<boolean>(false);

async function verifyUser() {
	if (verificationUpdateLoading.value) return;

	verificationUpdateLoading.value = true;

	await new Promise((resolve) => setTimeout(resolve, 500));

	try {
		const id = userId;

		const res = await $fetch('/api/app/admin/users/verify', {
			method: 'POST',
			body: {
				userIds: [id],
			},
		});

		if (res) {
			toast.remove(`user-unverified-${id}`);
			toast.add({
				id: `user-verified-${id}`,
				title: `Du har verificeret brugeren med ID: ${id}`,
				timeout: 10000,
				actions: [
					{
						label: 'Undo',
						click: () => unverifyUser(),
					},
				],
			});

			await fetchUser();
		}
	} catch (error: any) {
		toast.add({
			title: 'Der skete en fejl ved verificering af bruger',
		});
	}

	verificationUpdateLoading.value = false;
}

async function unverifyUser() {
	if (verificationUpdateLoading.value) return;

	verificationUpdateLoading.value = true;

	await new Promise((resolve) => setTimeout(resolve, 500));

	try {
		const id = userId;

		const res = await $fetch('/api/app/admin/users/unverify', {
			method: 'POST',
			body: {
				userIds: [id],
			},
		});

		if (res) {
			toast.remove(`user-verified-${id}`);
			toast.add({
				id: `user-unverified-${id}`,
				title: `Du har fjernet verificeringen af brugeren med ID: ${id}`,
				timeout: 10000,
				actions: [
					{
						label: 'Undo',
						click: () => verifyUser(),
					},
				],
			});

			await fetchUser();
		}
	} catch (error: any) {
		toast.add({
			title: 'Der skete en fejl ved fjernelse af verificering af bruger',
		});
	}

	verificationUpdateLoading.value = false;
}

const currentSessionPassword = ref<string>('');
const wrongCurrentSessionPassword = ref<boolean>(false);
const deleteAccountLoading = ref<boolean>(false);

const { hash } = useHash();

async function deleteUser() {
	deleteAccountLoading.value = true;
	wrongCurrentSessionPassword.value = false;

	try {
		const id = userId;
		const passwordHash = await hash(currentSessionPassword.value);

		const res = await $fetch(`/api/app/admin/users/${userId}/delete`, {
			method: 'POST',
			body: {
				currentSessionPassword: passwordHash,
			},
		});

		if (res) {
			currentSessionPassword.value = '';

			toast.add({
				title: `Du har slettet brugeren med ID: ${id}`,
				timeout: 10000,
			});

			emit('close');
		}
	} catch (error: any) {
		if (error.status === 401) {
			wrongCurrentSessionPassword.value = true;
		} else {
			toast.add({
				title: 'Der skete en fejl ved sletning af bruger',
			});
		}
	}

	deleteAccountLoading.value = false;
}
</script>

<style></style>
