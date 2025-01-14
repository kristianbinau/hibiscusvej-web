<template>
	<UCard
		class="mb-4"
		:ui="{
			header: { base: 'flex items-center justify-between' },
			body: { base: 'flex flex-col gap-4' },
			footer: { base: 'flex' },
		}"
	>
		<template #header>
			<h4 class="text-sm font-semibold leading-5 text-gray-900 dark:text-white">
				Repremand ID: {{ repremand.id }}
			</h4>
			<UBadge
				v-if="editMode"
				label="Unsaved"
				variant="subtle"
				size="xs"
				color="amber"
				icon="i-material-symbols-warning-outline-rounded"
			/>
		</template>

		<template v-if="editMode">
			<UForm
				ref="form"
				:schema="schema"
				:state="state"
				class="flex flex-col gap-4"
			>
				<UFormGroup label="Type">
					<UInput :model-value="repremand.type" />
				</UFormGroup>
				<UFormGroup label="Reason">
					<UInput :model-value="repremand.reason" />
				</UFormGroup>
				<UFormGroup label="Expires At">
					<UInput
						:model-value="
							repremand.expiresAt
								? new Date(repremand.expiresAt).toLocaleDateString()
								: 'Never'
						"
					/>
				</UFormGroup>
				<UFormGroup label="Created At">
					<UInput
						disabled
						:model-value="new Date(repremand.createdAt).toLocaleString()"
						class="disabled:*:cursor-default"
					/>
				</UFormGroup>
			</UForm>
		</template>

		<template v-else>
			<UFormGroup label="Type">
				<UInput
					disabled
					:model-value="repremand.type"
					class="disabled:*:cursor-default"
				/>
			</UFormGroup>
			<UFormGroup label="Reason">
				<UInput
					disabled
					:model-value="repremand.reason"
					class="disabled:*:cursor-default"
				/>
			</UFormGroup>
			<UFormGroup label="Expires At">
				<UInput
					disabled
					:model-value="
						repremand.expiresAt
							? new Date(repremand.expiresAt).toLocaleDateString()
							: 'Never'
					"
					class="disabled:*:cursor-default"
				/>
			</UFormGroup>
			<UFormGroup label="Created At">
				<UInput
					disabled
					:model-value="new Date(repremand.createdAt).toLocaleString()"
					class="disabled:*:cursor-default"
				/>
			</UFormGroup>
		</template>

		<template #footer>
			<template v-if="editMode">
				<UTooltip text="Cancel">
					<UButton
						variant="soft"
						color="amber"
						icon="i-material-symbols-cancel-outline-rounded"
						@click="disableEditMode"
					/>
				</UTooltip>

				<UTooltip text="Gem" class="ml-3">
					<UButton
						variant="soft"
						color="green"
						icon="i-material-symbols-save-as-outline-rounded"
						@click="saveRepremand"
					/>
				</UTooltip>
			</template>
			<template v-else>
				<UPopover
					:popper="{ placement: 'top-start' }"
					:ui="{ base: '' }"
					overlay
				>
					<UTooltip text="Klik for at permanent slette">
						<UButton
							icon="i-material-symbols-delete-forever-outline-rounded"
							color="red"
							variant="soft"
						/>
					</UTooltip>

					<template #panel>
						<div class="p-4">
							<h3 class="text-sm font-semibold mb-2">Advarsel!</h3>
							<p class="text-xs">
								Du er ved at slette denne repremand. <br />
								Dette kan ikke fortrydes, og alt data vil blive slettet.
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
								@click="deleteRepremand"
								:loading="deleteRepremandLoading"
								class="mt-4"
							/>
						</div>
					</template>
				</UPopover>

				<UTooltip text="Redigér" class="ml-3">
					<UButton
						variant="soft"
						color="green"
						icon="i-material-symbols-edit-document-outline-rounded"
						@click="enableEditMode"
					/>
				</UTooltip>
			</template>
		</template>
	</UCard>
</template>

<script lang="ts" setup>
import { z } from 'zod';
import type { Form, FormSubmitEvent } from '#ui/types';
import type { UserRepremand } from '~/utils/types/admin';

const repremand = defineModel<UserRepremand>('repremand', {
	required: true,
	type: Object,
});

const toast = useToast();

/**
 * EDIT
 */

const editMode = ref<boolean>(false);

function enableEditMode() {
	editMode.value = true;
}

function disableEditMode() {
	state.type = repremand.value.type;
	state.reason = repremand.value.reason;
	state.expiresAt = repremand.value.expiresAt
		? new Date(repremand.value.expiresAt)
		: undefined;

	editMode.value = false;
}

const schema = z.object({
	type: z.enum(['warning', 'ban'], {
		required_error: 'Påkrævet',
	}),
	reason: z.string({
		required_error: 'Påkrævet',
	}),
	expiresAt: z.date().optional(),
});

type Schema = z.output<typeof schema>;

const form = ref<Form<Schema>>();

const state = reactive<{
	type: 'warning' | 'ban' | undefined;
	reason: string | undefined;
	expiresAt: Date | undefined;
}>({
	type: repremand.value.type ?? undefined,
	reason: repremand.value.reason ?? undefined,
	expiresAt: repremand.value.expiresAt
		? new Date(repremand.value.expiresAt)
		: undefined,
});

const saveRepremandLoading = ref<boolean>(false);

async function saveRepremand(event: FormSubmitEvent<Schema>) {
	saveRepremandLoading.value = true;

	form.value!.clear();
	try {
		// TODO: Update repremand

		toast.add({
			title: 'Repremand opdateret',
		});

		repremand.value.type = state.type!;
		repremand.value.reason = state.reason!;
		repremand.value.expiresAt = state.expiresAt
			? state.expiresAt.toISOString()
			: null;

		disableEditMode();
	} catch (error: any) {
		if (error.statusCode === 422) {
			form.value!.setErrors(
				error.data.errors.map((error: any) => ({
					// Map validation errors to { path: string, message: string }
					message: error.message,
					path: error.path,
				})),
			);
		} else {
			toast.add({
				title: 'Der skete en fejl ved opdatering, prøv igen',
			});
		}
	}

	saveRepremandLoading.value = false;
}

/**
 * DELETE
 */

const currentSessionPassword = ref<string>('');
const wrongCurrentSessionPassword = ref<boolean>(false);
const deleteRepremandLoading = ref<boolean>(false);

const { hash } = useHash();

async function deleteRepremand() {
	deleteRepremandLoading.value = true;
	wrongCurrentSessionPassword.value = false;

	try {
		const id = repremand.value.id;
		const passwordHash = await hash(currentSessionPassword.value);

		const res = await $fetch(`/api/admin/repremands/${id}/delete`, {
			method: 'POST',
			body: {
				currentSessionPassword: passwordHash,
			},
		});

		if (res) {
			currentSessionPassword.value = '';

			toast.add({
				title: `Du har slettet repremand med ID: ${id}`,
				timeout: 10000,
			});
		}
	} catch (error: any) {
		if (error.status === 401) {
			wrongCurrentSessionPassword.value = true;
		} else {
			toast.add({
				title: 'Der skete en fejl ved sletning af repremand',
			});
		}
	}

	deleteRepremandLoading.value = false;
}
</script>

<style></style>
