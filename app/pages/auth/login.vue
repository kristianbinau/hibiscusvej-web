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
						<h1 class="text-2xl font-semibold text-(--ui-primary)">
							{{ t('auth.login.title') }}
						</h1>
					</template>

					<UFormField :label="t('auth.fields.email')" name="email">
						<UInput
							v-model="state.email"
							autocomplete="email"
							inputmode="email"
							class="w-full"
						/>
					</UFormField>

					<UFormField
						:label="t('auth.login.passwordLabel')"
						name="password"
						class="mt-3"
					>
						<Password v-model="state.password" class="w-full" />
					</UFormField>

					<template #footer>
						<div
							class="flex gap-3 flex-wrap md:flex-nowrap flex-1 justify-between"
						>
							<ULink
								:to="localePath('/auth/register')"
								class="text-neutral-500 underline hover:text-neutral-600 dark:hover:text-neutral-400"
							>
								{{ t('auth.login.noAccount') }}
							</ULink>

							<UButton
								:loading="onSubmitLoading"
								class="md:max-w-[48%]"
								type="submit"
								block
								>{{ t('auth.login.submit') }}</UButton
							>
						</div>
					</template>
				</UCard>
			</UForm>
		</ClientOnly>
	</section>
</template>

<script lang="ts" setup>
import { z } from 'zod/v3';
import type { Form, FormSubmitEvent } from '#ui/types';

definePageMeta({
	layout: 'minimal',
	middleware: 'guest-required',
});

const { t } = useI18n();
const localePath = useLocalePath();

useHead({
	title: () => t('auth.login.title'),
});

const { hash } = useHash();
const toast = useToast();

const schema = z.object({
	email: z.string({ required_error: t('common.required') }),
	password: z.string({ required_error: t('common.required') }),
});

type Schema = z.output<typeof schema>;

const form = ref<Form<Schema>>();

const state = reactive<Partial<Schema>>({
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
				title: t('auth.login.singleUseUsed.title'),
				description: t('auth.login.singleUseUsed.description'),
				duration: 10000,
			});
			await navigateTo(
				localePath({
					path: '/auth/reset',
					query: { loginId: res.loginId },
				}),
			);
		} else if (res && 'accessToken' in res) {
			await navigateTo(localePath('/u'));
		} else {
			toast.add({
				icon: 'i-material-symbols-error-outline-rounded',
				title: t('common.error'),
				description: t('common.errorDescription'),
				actions: [
					{
						label: t('common.retry'),
						onClick: () => onSubmit(event),
					},
				],
			});
		}
	} catch (error: any) {
		if (error.statusCode === 401) {
			form.value!.setErrors([
				{
					name: 'email',
					message: t('auth.login.wrongCredentials'),
				},
				{
					name: 'password',
					message: t('auth.login.wrongCredentials'),
				},
			]);
		} else {
			toast.add({
				icon: 'i-material-symbols-error-outline-rounded',
				title: t('common.error'),
				description: t('common.errorDescription'),
				actions: [
					{
						label: t('common.retry'),
						onClick: () => onSubmit(event),
					},
				],
			});
		}
	}

	onSubmitLoading.value = false;
}
</script>
