<template>
	<UCard class="mb-4">
		<template #header>
			<h4 class="text-sm font-semibold leading-5 text-gray-900 dark:text-white">
				Login ID: {{ login.id }}
			</h4>
		</template>

		<UFormGroup label="Email">
			<UInput
				disabled
				:model-value="login.email"
				class="mb-4 disabled:*:cursor-default"
			/>
		</UFormGroup>

		<template #footer>
			<UPopover :popper="{ placement: 'top-end' }" overlay>
				<UTooltip text="Klik for at nullstille kodeord">
					<UButton
						icon="i-material-symbols-lock-reset-rounded"
						label="Nulstil kodeord"
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
							Du er ved at nulstille kodeordet for denne bruger. <br />
							Dette kan ikke fortrydes, er du sikker?
							<br />
							<span class="italic"
								>Et nyt kodeord vil blive genereret og vist til dig.
							</span>
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
							@click="resetPassword"
							:loading="resetPasswordLoading"
							class="mt-4"
						/>
					</div>
				</template>
			</UPopover>
		</template>
	</UCard>
</template>

<script lang="ts" setup>
import type { UserLogin } from '~/utils/types/admin';

const login = defineModel<UserLogin>('login', {
	required: true,
	type: Object,
});

const toast = useToast();

const currentSessionPassword = ref<string>('');
const wrongCurrentSessionPassword = ref<boolean>(false);
const resetPasswordLoading = ref(false);
async function resetPassword() {
	if (resetPasswordLoading.value) {
		return;
	}

	resetPasswordLoading.value = true;

	try {
		const { hash } = useHash();

		const passwordHash = await hash(currentSessionPassword.value);

		const data = await $fetch(
			`/api/app/admin/users/${login.value.userId}/reset-password`,
			{
				method: 'POST',
				body: {
					loginId: login.value.id,
					currentSessionPassword: passwordHash,
				},
			},
		);

		if (data === null) {
			toast.add({
				title: 'Der opstod en fejl under nulstilling af kodeordet',
			});
		}

		toast.remove(`reset-password-${login.value.id}`);
		toast.remove(`reset-password-copied-${login.value.id}`);
		toast.add({
			id: `reset-password-${login.value.id}`,
			title: 'Kodeord nulstillet!',
			description: `Dette er det nye kodeord: "${data.newPassword}", husk at kopiere det!`,
			timeout: 0,
			actions: [
				{
					label: 'Kopiér kodeord',
					color: 'green',
					click: () => {
						navigator.clipboard.writeText(data.newPassword);
						toast.add({
							id: `reset-password-copied-${login.value.id}`,
							title: 'Kodeord kopieret!',
							description: 'Informer brugeren om det nye kodeord.',
						});
					},
				},
			],
		});

		currentSessionPassword.value = '';
	} catch (error: any) {
		toast.add({
			title: 'Der opstod en fejl under nulstilling af kodeordet',
		});
	}

	resetPasswordLoading.value = false;
}
</script>

<style></style>
