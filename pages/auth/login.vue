<template>
	<section
		class="lg:w-2/4 lg:px-0 px-4 mx-auto flex flex-col items-center gap-4 mt-12"
	>
		<UForm
			ref="form"
			:schema="schema"
			:state="state"
			@submit.prevent="onSubmit"
			class="md:w-3/4 w-full"
		>
			<UCard>
				<template #header>
					<h1 class="text-2xl font-semibold text-primary">Login</h1>
				</template>

				<UFormGroup label="Email" name="email" required>
					<UInput v-model="state.email" />
				</UFormGroup>

				<UFormGroup label="Password" name="password" class="mt-3" required>
					<UInput v-model="state.password" type="password" />
				</UFormGroup>

				<template #footer>
					<div
						class="flex gap-3 flex-wrap md:flex-nowrap flex-1 justify-between"
					>
						<ULink
							to="/auth/register"
							class="text-gray-500 underline hover:text-gray-600 dark:hover:text-gray-400"
						>
							Har du ikke en konto?
						</ULink>

						<UButton class="md:max-w-[48%]" type="submit" block>Login</UButton>
					</div>
				</template>
			</UCard>
		</UForm>
	</section>
</template>

<script lang="ts" setup>
import { z } from 'zod';
import type { Form, FormSubmitEvent } from '#ui/types';

definePageMeta({
	layout: 'minimal',
	middleware: 'guest-required',
});

defineRouteRules({
	prerender: true,
});

useHead({
	title: 'Login',
});

const { hash } = useHash();

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

async function onSubmit(event: FormSubmitEvent<Schema>) {
	form.value!.clear();
	try {
		const passwordHash = await hash(event.data.password);

		const res = await $fetch('/api/auth/login', {
			method: 'POST',
			body: {
				email: event.data.email,
				password: passwordHash,
			},
		});

		if (res) {
			await navigateTo('/u');
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
		}
	}
}
</script>
