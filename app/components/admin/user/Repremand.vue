<template>
	<UCard
		class="mb-4"
		:ui="{
			header: 'flex items-center justify-between',
			body: 'flex flex-col gap-4',
			footer: 'flex',
		}"
	>
		<template #header>
			<h4
				class="text-sm font-semibold leading-5 text-neutral-900 dark:text-white"
			>
				{{ repremand.id ? `Repremand ID: ${repremand.id}` : 'New Repremand' }}
			</h4>
			<UBadge
				v-if="editMode"
				label="Unsaved"
				variant="subtle"
				size="xs"
				color="warning"
				icon="i-material-symbols-warning-outline-rounded"
			/>
		</template>

		<template v-if="editMode">
			<UForm
				id="repremand-form"
				ref="form"
				:schema="schema"
				:state="state"
				class="flex flex-col gap-4"
				@submit="saveRepremand"
			>
				<UFormField label="Type" name="type">
					<USelect
						v-model="state.type"
						:items="['ban', 'warning']"
						placeholder="Vælg type..."
						class="w-full h-8.5"
					/>
				</UFormField>
				<UFormField label="Reason" name="reason">
					<UInput
						v-model="state.reason"
						placeholder="Årsag..."
						class="w-full"
					/>
				</UFormField>
				<UFormField label="Expires At" name="expiresAt">
					<UInput type="date" v-model="expiresAtString" class="w-full h-8.5" />
				</UFormField>
			</UForm>
		</template>

		<template v-else>
			<UFormField label="Type">
				<UInput
					disabled
					:model-value="repremand.type"
					class="w-full disabled:*:cursor-default"
				/>
			</UFormField>
			<UFormField label="Reason">
				<UInput
					disabled
					:model-value="repremand.reason"
					class="w-full disabled:*:cursor-default"
				/>
			</UFormField>
			<UFormField label="Expires At">
				<UInput
					disabled
					:model-value="
						repremand.expiresAt
							? new Date(repremand.expiresAt).toLocaleDateString()
							: 'Never'
					"
					class="w-full disabled:*:cursor-default"
				/>
			</UFormField>
		</template>

		<template #footer>
			<template v-if="editMode">
				<UTooltip text="Cancel">
					<UButton
						variant="soft"
						color="warning"
						icon="i-material-symbols-cancel-outline-rounded"
						@click="handleCancel"
					/>
				</UTooltip>

				<UTooltip text="Gem" class="ml-3">
					<UButton
						type="submit"
						form="repremand-form"
						variant="soft"
						color="success"
						icon="i-material-symbols-save-as-outline-rounded"
						:loading="saveRepremandLoading"
					/>
				</UTooltip>
			</template>
			<template v-else>
				<UPopover
					:content="{
						align: 'start',
						side: 'top',
					}"
				>
					<UTooltip text="Klik for at permanent slette">
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
								Du er ved at slette denne repremand. <br />
								Dette kan ikke fortrydes, og alt data vil blive slettet.
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
						color="success"
						icon="i-material-symbols-edit-document-outline-rounded"
						@click="enableEditMode"
					/>
				</UTooltip>
			</template>
		</template>
	</UCard>
</template>

<script lang="ts" setup>
import { z } from 'zod/v3';
import type { Form, FormSubmitEvent } from '#ui/types';
import type { UserRepremand } from '~/utils/types/admin';

const props = defineProps<{
	userId: number;
}>();

const emit = defineEmits<{
	deleted: [];
	cancelled: [];
	created: [];
}>();

const repremand = defineModel<Partial<UserRepremand>>('repremand', {
	required: true,
	type: Object,
});

const toast = useToast();

const isCreating = computed(() => !repremand.value.id);

/**
 * EDIT
 */

const editMode = ref<boolean>(isCreating.value);

function enableEditMode() {
	editMode.value = true;
}

function disableEditMode() {
	state.type = repremand.value.type;
	state.reason = repremand.value.reason ?? '';
	state.expiresAt = repremand.value.expiresAt
		? new Date(repremand.value.expiresAt)
		: undefined;

	editMode.value = false;
}

function handleCancel() {
	if (isCreating.value) {
		emit('cancelled');
	} else {
		disableEditMode();
	}
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
	reason: string;
	expiresAt: Date | undefined;
}>({
	type: repremand.value.type ?? undefined,
	reason: repremand.value.reason ?? '',
	expiresAt: repremand.value.expiresAt
		? new Date(repremand.value.expiresAt)
		: undefined,
});

const expiresAtString = computed({
	get() {
		return state.expiresAt ? state.expiresAt.toISOString().slice(0, 10) : '';
	},
	set(val: string) {
		state.expiresAt = val ? new Date(val) : undefined;
	},
});

const saveRepremandLoading = ref<boolean>(false);

async function saveRepremand(event: FormSubmitEvent<Schema>) {
	saveRepremandLoading.value = true;

	form.value!.clear();
	try {
		if (!isCreating.value) {
			await $fetch(`/api/app/admin/repremands/${repremand.value.id}`, {
				method: 'PATCH',
				body: {
					type: event.data.type,
					reason: event.data.reason,
					expiresAt: event.data.expiresAt
						? event.data.expiresAt.toISOString().slice(0, 10)
						: undefined,
				},
			});

			repremand.value.type = event.data.type;
			repremand.value.reason = event.data.reason;
			repremand.value.expiresAt = event.data.expiresAt
				? event.data.expiresAt.toISOString()
				: null;

			toast.add({
				icon: 'i-material-symbols-check-circle-outline-rounded',
				title: 'Success!',
				description: 'Repremand er blevet opdateret!',
			});

			disableEditMode();
		} else {
			const res = await $fetch(
				`/api/app/admin/users/${props.userId}/repremands`,
				{
					method: 'POST',
					body: {
						type: event.data.type,
						reason: event.data.reason,
						expiresAt: event.data.expiresAt
							? event.data.expiresAt.toISOString().slice(0, 10)
							: undefined,
					},
				},
			);

			Object.assign(repremand.value, res.repremand);

			toast.add({
				icon: 'i-material-symbols-check-circle-outline-rounded',
				title: 'Success!',
				description: 'Repremand er blevet oprettet!',
			});

			editMode.value = false;
			emit('created');
		}
	} catch (error: any) {
		if (error.statusCode === 422) {
			form.value!.setErrors(
				error.data.errors.map((error: any) => ({
					message: error.message,
					path: error.path,
				})),
			);
		} else {
			toast.add({
				icon: 'i-material-symbols-error-outline-rounded',
				title: 'Fejl!',
				description: 'Der opstod en fejl...',
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

		const res = await $fetch(`/api/app/admin/repremands/${id}/delete`, {
			method: 'POST',
			body: {
				currentSessionPassword: passwordHash,
			},
		});

		if (res) {
			currentSessionPassword.value = '';

			toast.add({
				icon: 'i-material-symbols-check-circle-outline-rounded',
				title: 'Success!',
				description: `Du har slettet repremand med ID: ${id}`,
				duration: 10000,
			});

			emit('deleted');
		}
	} catch (error: any) {
		if (error.status === 401) {
			wrongCurrentSessionPassword.value = true;
		} else {
			toast.add({
				icon: 'i-material-symbols-error-outline-rounded',
				title: 'Fejl!',
				description: 'Der opstod en fejl...',
				actions: [
					{
						label: 'Prøv igen',
						onClick: deleteRepremand,
					},
				],
			});
		}
	}

	deleteRepremandLoading.value = false;
}
</script>

<style></style>
