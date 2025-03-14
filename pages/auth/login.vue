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
						<h1 class="text-2xl font-semibold text-(--ui-primary)">Login</h1>
					</template>

					<UFormField label="Email" name="email" required>
						<UInput v-model="state.email" />
					</UFormField>

					<UFormField label="Password" name="password" class="mt-3" required>
						<Password v-model="state.password" />
					</UFormField>

					<template #footer>
						<div
							class="flex gap-3 flex-wrap md:flex-nowrap flex-1 justify-between"
						>
							<ULink
								to="/auth/register"
								class="text-neutral-500 underline hover:text-neutral-600 dark:hover:text-neutral-400"
							>
								Har du ikke en konto?
							</ULink>

							<UButton
								:loading="onSubmitLoading"
								class="md:max-w-[48%]"
								type="submit"
								block
								>Login</UButton
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
	title: 'Login',
});

const { hash } = useHash();
const toast = useToast();

const schema = z.object({
	email: z.string(),
	password: z.string(),
});

type Schema = z.output<typeof schema>;

const form = ref<Form<Schema>>();

const state = reactive<{
	email: string | undefined;
	password: string | undefined;
}>({
	email: undefined,
	password: undefined,
});

const onSubmitLoading = ref<boolean>(false);

async function onSubmit(event: FormSubmitEvent<Schema>) {
	onSubmitLoading.value = true;

	form.value!.clear();
	try {
		const passwordHash = await hash(event.data.password);

		const res = await $fetch('/api/app/auth/login', {
			method: 'POST',
			body: {
				email: event.data.email,
				password: passwordHash,
			},
		});

		if (res && 'singleUse' in res && res.singleUse === true) {
			toast.add({
				icon: 'i-material-symbols-info-outline-rounded',
				title: 'Engangskode brugt!',
				description:
					'Da du har brugt en engangskode, er du blevet videresendt for at oprette en ny adgangskode.',
				duration: 10000,
			});
			await navigateTo(`/auth/reset?loginId=${res.loginId}`);
		} else if (res && 'accessToken' in res) {
			await navigateTo('/u');
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
					path: 'email',
					message: 'Email eller kodeord er forkert',
				},
				{
					path: 'password',
					message: 'Email eller kodeord er forkert',
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
