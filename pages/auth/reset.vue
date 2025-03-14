<template>
	<section
		class="lg:w-2/4 lg:px-0 px-4 mx-auto flex flex-col items-center gap-4 mt-12"
	>
		<ClientOnly>
			<UForm
				ref="form"
				:schema="schema"
				:state="state"
				@submit.prevent="onSubmit"
				class="md:w-3/4 w-full"
			>
				<UCard>
					<template #header>
						<h1 class="text-2xl font-semibold text-(--ui-primary)">Ny adgangskode</h1>
					</template>

					<p class="mb-5">
						Indtast engangskoden du har modtaget og vælg en ny adgangskode.
					</p>

					<UFormField
						label="Engangskode"
						name="singleUsePassword"
						class="mt-3"
						required
					>
						<Password v-model="state.singleUsePassword" />
					</UFormField>

					<UFormField
						label="Ny adgangskode"
						name="newPassword"
						class="mt-3"
						required
					>
						<Password v-model="state.newPassword" />
					</UFormField>

					<template #footer>
						<div
							class="flex gap-3 flex-wrap md:flex-nowrap flex-1 justify-between"
						>
							<UButton
								:loading="onSubmitLoading"
								class="md:max-w-[48%] ml-auto"
								type="submit"
								block
								>Ændre adgangskode</UButton
							>
						</div>
					</template>
				</UCard>
			</UForm>
		</ClientOnly>
	</section>
</template>

<script lang="ts" setup>
import { z } from 'zod';
import type { Form, FormSubmitEvent } from '#ui/types';

definePageMeta({
	layout: 'minimal',
	middleware: 'guest-required',
});

useHead({
	title: 'Ny adgangskode',
});

definePageMeta({
	validate: async (route) => {
		// Validate loginId
		return (
			typeof route.query.loginId === 'string' &&
			/^\d+$/.test(route.query.loginId)
		);
	},
});

const { query } = useRoute();

const loginId = Number(query.loginId);

const { hash } = useHash();
const toast = useToast();

const schema = z
	.object({
		singleUsePassword: z.string(),
		newPassword: z.string(),
	})
	.refine((value) => value.newPassword !== value.singleUsePassword, {
		message: 'Engangskode må ikke bruges som ny adgangskode',
		path: ['newPassword'],
	});

type Schema = z.output<typeof schema>;

const form = ref<Form<Schema>>();

const state = reactive<{
	singleUsePassword: string | undefined;
	newPassword: string | undefined;
}>({
	singleUsePassword: undefined,
	newPassword: undefined,
});

const onSubmitLoading = ref<boolean>(false);
async function onSubmit(event: FormSubmitEvent<Schema>) {
	onSubmitLoading.value = true;

	form.value!.clear();
	try {
		const singleUseHash = await hash(event.data.singleUsePassword);
		const newHash = await hash(event.data.newPassword);

		const res = await $fetch('/api/app/auth/reset-password', {
			method: 'POST',
			body: {
				loginId: loginId,
				singleUsePassword: singleUseHash,
				newPassword: newHash,
			},
		});

		if (res) {
			toast.add({
				icon: 'i-material-symbols-check-circle-outline-rounded',
				title: 'Adgangskode ændret!',
				description: 'Du kan nu logge ind med din nye adgangskode.',
			});

			await navigateTo('/auth/login');
		} else {
			toast.add({
				icon: 'i-material-symbols-error-outline-rounded',
				title: 'Fejl!',
				description: 'Der skete en fejl...',
				actions: [
					{
						label: 'Prøv igen',
						onClick:() => onSubmit(event),
					},
				],
			});
		}
	} catch (error: any) {
		if (error.statusCode === 401) {
			form.value!.setErrors([
				{
					path: 'singleUsePassword',
					message: 'Kodeord er forkert',
				},
			]);
		} else {
			toast.add({
				icon: 'i-material-symbols-error-outline-rounded',
				title: 'Fejl!',
				description: 'Der skete en fejl...',
				actions: [
					{
						label: 'Prøv igen',
						onClick:() => onSubmit(event),
					},
				],
			});
		}
	}

	onSubmitLoading.value = false;
}
</script>
