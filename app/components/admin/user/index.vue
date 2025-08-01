<template>
	<UCard
		v-if="user"
		class="mb-4 flex flex-col flex-1"
		:ui="{
			root: 'h-dvh !mb-0',
			body: 'overflow-auto flex-1',
		}"
	>
		<template #header>
			<div class="flex items-center justify-between">
				<h3
					class="text-base font-semibold leading-6 text-neutral-900 dark:text-white"
				>
					ID: {{ user.id }}
				</h3>
				<UButton
					v-if="showClose"
					color="neutral"
					variant="ghost"
					icon="i-heroicons-x-mark-20-solid"
					class="-my-1"
					@click="emit('close')"
				/>
			</div>
		</template>

		<div class="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
			<UFormField label="Apartment ID">
				<UInput
					disabled
					:model-value="String(user.apartmentId)"
					class="mb-4 disabled:*:cursor-default"
				/>
			</UFormField>

			<UFormField label="Is Admin">
				<UInput
					disabled
					:model-value="String(user.admin)"
					class="mb-4 disabled:*:cursor-default"
				/>
			</UFormField>

			<UFormField label="Verified">
				<UInput
					disabled
					:model-value="
						user.verifiedAt
							? String(new Date(user.verifiedAt).toLocaleDateString())
							: 'Ikke verificeret'
					"
					class="mb-4 disabled:*:cursor-default"
				/>
			</UFormField>

			<UFormField label="Created At">
				<UInput
					disabled
					:model-value="String(new Date(user.createdAt).toLocaleDateString())"
					class="mb-4 disabled:*:cursor-default"
				/>
			</UFormField>

			<UFormField label="Updated At">
				<UInput
					disabled
					:model-value="String(new Date(user.updatedAt).toLocaleDateString())"
					class="mb-4 disabled:*:cursor-default"
				/>
			</UFormField>
		</div>

		<UAccordion
			:items="accordionItems"
			class="mt-4"
			:ui="{
				header:
					'bg-(--ui-color-primary-950) text-(--ui-color-primary-400) py-1.5 px-2.5 rounded-lg mb-1.5',
				trigger: 'py-0',
				body: 'relative',
			}"
		>
			<template #persons-body>
				<AdminUserPersons
					v-if="showPersons"
					:userId="userId"
					:persons="user.persons"
				/>
			</template>

			<template #logins-body>
				<AdminUserLogins
					v-if="showLogins"
					:userId="userId"
					:logins="user.logins"
				/>
			</template>

			<template #sessions-body>
				<AdminUserSessions
					v-if="showSessions"
					:userId="userId"
					:sessions="user.sessions"
				/>
			</template>

			<template #bookings-body>
				<AdminUserBookings v-if="showBookings" :userId="userId" />
			</template>

			<template #repremands-body>
				<AdminUserRepremands v-if="showRepremands" :userId="userId" />
			</template>
		</UAccordion>

		<template #footer>
			<div class="flex items-center justify-between gap-3">
				<template v-if="user.verifiedAt === null">
					<UPopover
						:content="{
							align: 'start',
							side: 'top',
						}"
					>
						<UTooltip text="Klik for at verificere bruger">
							<UButton
								variant="soft"
								color="warning"
								icon="i-material-symbols-domain-verification-off-rounded"
								:loading="verificationUpdateLoading"
							>
							</UButton>
						</UTooltip>

						<template #content>
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
									color="success"
									variant="soft"
									size="xs"
									@click="verifyUser"
									:loading="verificationUpdateLoading"
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
						<UTooltip text="Klik for at permanent slette brugeren">
							<UButton
								icon="i-material-symbols-delete-forever-outline-rounded"
								color="error"
								variant="soft"
							/>
						</UTooltip>

						<template #content>
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
						:content="{
							align: 'start',
							side: 'top',
						}"
					>
						<UTooltip text="Klik for at fjerne verificering">
							<UButton
								variant="soft"
								color="success"
								icon="i-material-symbols-domain-verification-rounded"
								:loading="verificationUpdateLoading"
							>
							</UButton>
						</UTooltip>

						<template #content>
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
									color="error"
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

const emit = defineEmits(['close', 'userDeleted']);

const {
	userId,
	showPersons,
	showLogins,
	showSessions,
	showBookings,
	showRepremands,
	showClose,
} = defineProps<{
	userId: number;
	showPersons: boolean;
	showLogins: boolean;
	showSessions: boolean;
	showBookings: boolean;
	showRepremands: boolean;
	showClose: boolean;
}>();

const user = defineModel<User>('user', { required: false, type: Object });

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

		if (!data.value) {
			fetchingUser.value = false;
			toast.add({
				icon: 'i-material-symbols-error-outline-rounded',
				title: 'Fejl!',
				description: 'Brugeren blev ikke fundet',
				actions: [
					{
						label: 'Luk',
						onClick: () => emit('close'),
					},
				],
			});
			return;
		}

		user.value = data.value as User;
	} catch (error) {
		toast.add({
			icon: 'i-material-symbols-error-outline-rounded',
			title: 'Fejl!',
			description: 'Der skete en fejl...',
			actions: [
				{
					label: 'Prøv igen',
					onClick: fetchUser,
				},
			],
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
				icon: 'i-material-symbols-check-circle-rounded',
				title: 'Success!',
				description: `Du har verificeret brugeren med ID: ${id}`,
				duration: 10000,
				actions: [
					{
						label: 'Undo',
						onClick: () => unverifyUser(),
					},
				],
			});

			await fetchUser();
		}
	} catch (error: any) {
		toast.add({
			icon: 'i-material-symbols-error-outline-rounded',
			title: 'Fejl!',
			description: 'Der skete en fejl...',
			actions: [
				{
					label: 'Prøv igen',
					onClick: verifyUser,
				},
			],
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
				icon: 'i-material-symbols-check-circle-rounded',
				title: 'Success!',
				description: `Du har fjernet verificeringen af brugeren med ID: ${id}`,
				duration: 10000,
				actions: [
					{
						label: 'Undo',
						onClick: () => verifyUser(),
					},
				],
			});

			await fetchUser();
		}
	} catch (error: any) {
		toast.add({
			icon: 'i-material-symbols-error-outline-rounded',
			title: 'Fejl!',
			description: 'Der skete en fejl...',
			actions: [
				{
					label: 'Prøv igen',
					onClick: unverifyUser,
				},
			],
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
				icon: 'i-material-symbols-check-circle-rounded',
				title: `Success!`,
				description: `Du har slettet brugeren med ID: ${id}`,
				duration: 10000,
			});

			emit('close');
			emit('userDeleted', id);
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
						onClick: deleteUser,
					},
				],
			});
		}
	}

	deleteAccountLoading.value = false;
}
</script>

<style></style>
