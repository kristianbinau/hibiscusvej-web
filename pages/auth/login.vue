<template>
	<section
		class="lg:w-2/4 lg:px-0 px-4 mx-auto flex flex-col items-center gap-4 mt-12"
	>
		<UForm
			:schema="schema"
			:state="state"
			@submit="onSubmit"
			class="md:w-3/4 w-full"
		>
			<UCard>
				<template #header>
					<h1 class="text-2xl font-semibold text-primary">Login</h1>
				</template>

				<UFormGroup label="Email" name="email">
					<UInput v-model="state.email" />
				</UFormGroup>

				<UFormGroup label="Password" name="password" class="mt-3">
					<UInput v-model="state.password" type="password" />
				</UFormGroup>

				<template #footer>
					<div class="flex gap-3 flex-wrap">
						<ULink
							to="/auth/register"
							class="text-gray-500 underline hover:text-gray-600 dark:hover:text-gray-400"
						>
							Don't have an account?
						</ULink>
						<UButton type="submit" block>Login</UButton>
					</div>
				</template>
			</UCard>
		</UForm>
	</section>
</template>

<script lang="ts" setup>
import { z } from 'zod';
import type { FormSubmitEvent } from '#ui/types';

definePageMeta({
	layout: 'minimal',
});

useHead({
	title: 'Login',
});

const schema = z.object({
	email: z.string(),
	password: z.string(),
});

type Schema = z.output<typeof schema>;

const state = reactive<{
	email: string | undefined;
	password: string | undefined;
}>({
	email: undefined,
	password: undefined,
});

async function onSubmit(event: FormSubmitEvent<Schema>) {
	const res = await $fetch('/api/auth/login', {
		method: 'POST',
		body: {
			email: event.data.email,
			password: event.data.password,
		},
	});

	console.log(res);

	// TODO: Handle response
}
</script>
