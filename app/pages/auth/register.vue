<template>
	<section
		class="lg:w-2/4 lg:px-0 px-4 mx-auto flex flex-col items-center gap-4 mt-12"
	>
		<ClientOnly>
			<!-- @vue-ignore -->
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
							{{ t('auth.register.title') }}
						</h1>
					</template>

					<h3 class="text-xl font-semibold text-(--ui-primary) mb-2">
						{{ t('auth.register.apartment') }}
					</h3>

					<p class="mb-5">
						{{ t('auth.register.apartmentDescription') }}
					</p>

					<UFormField
						:label="t('auth.register.apartment')"
						name="apartmentId"
						class="mt-3 mb-5"
						required
					>
						<ApartmentSelect v-model="state.apartmentId" />
					</UFormField>

					<hr class="border-gray-200 dark:border-gray-800 mb-5" />

					<h3 class="text-xl font-semibold text-(--ui-primary) mb-2">
						{{ t('auth.register.loginSection') }}
					</h3>

					<p class="mb-5">
						{{ t('auth.register.loginDescription') }}
					</p>

					<UFormField
						:label="t('auth.fields.email')"
						name="email"
						class="my-3"
						required
					>
						<UInput v-model="state.email" class="w-full" />
					</UFormField>

					<UFormField
						:label="t('auth.register.passwordLabel')"
						name="password"
						class="mt-3 mb-5"
						eager-validation
						required
					>
						<Password v-model="state.password" class="w-full" />
					</UFormField>

					<hr class="border-gray-200 dark:border-gray-800 mb-5" />

					<h3 class="text-xl font-semibold text-(--ui-primary) mb-2">
						{{ t('auth.register.contactSection') }}
					</h3>

					<p class="mb-5">
						{{ t('auth.register.contactDescription') }}
					</p>

					<!-- Contact Information -->
					<UFormField name="persons">
						<div class="flex flex-col gap-6">
							<template v-for="(person, index) in state.persons">
								<UFormField
									:label="t('auth.register.contactPersonNth', { n: index + 1 })"
									:name="`persons.${index}`"
								>
									<UFormField
										:label="t('auth.fields.name')"
										:name="`persons.${index}.name`"
										class="mt-3"
										required
									>
										<UInput v-model="person.name" label="Name" class="w-full" />
									</UFormField>
									<UFormField
										:label="t('auth.fields.email')"
										:name="`persons.${index}.email`"
										class="mt-3"
										required
									>
										<UInput v-model="person.email" class="w-full" />
									</UFormField>
									<UFormField
										:label="t('auth.fields.phone')"
										:name="`persons.${index}.phone`"
										class="mt-3"
										required
									>
										<UInput
											v-model="person.phone"
											label="Phone"
											class="w-full"
										/>
									</UFormField>
									<UButton
										v-if="state.persons.length > 1"
										color="error"
										variant="soft"
										@click="() => removePerson(index)"
										class="mt-5"
									>
										{{ t('auth.register.removeContactPerson') }}
									</UButton>
								</UFormField>
							</template>
						</div>
					</UFormField>

					<template v-if="state.persons.length < 2">
						<UButton
							color="success"
							variant="soft"
							@click="addPerson"
							class="mt-5 mb-5"
						>
							{{ t('auth.register.addContactPerson') }}
						</UButton>
					</template>

					<hr class="border-gray-200 dark:border-gray-800 mb-5" />

					<h3 class="text-xl font-semibold text-(--ui-primary) mb-2">
						{{ t('auth.register.consentSection') }}
					</h3>

					<p class="mb-5">
						{{ t('auth.register.consentIntro') }}
						<ULink
							:to="localePath('/privacy')"
							target="_blank"
							class="text-(--ui-primary) underline"
							>{{ t('auth.register.privacyPolicyLink') }}</ULink
						>.
					</p>

					<UFormField name="acceptedPrivacyPolicy" class="mt-3 mb-5" required>
						<UCheckbox
							v-model="state.acceptedPrivacyPolicy"
							:label="t('auth.register.consentCheckbox')"
							class="select-none"
						/>
					</UFormField>

					<template #footer>
						<div
							class="flex gap-3 flex-wrap md:flex-nowrap flex-1 justify-between"
						>
							<ULink
								:to="localePath('/auth/login')"
								class="text-neutral-500 underline hover:text-neutral-600 dark:hover:text-neutral-400"
							>
								{{ t('auth.register.hasAccount') }}
							</ULink>

							<UButton
								:loading="onSubmitLoading"
								class="md:max-w-[48%]"
								type="submit"
								block
								>{{ t('auth.register.submit') }}</UButton
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
import type { SelectMenuItem, Form, FormSubmitEvent } from '#ui/types';
import type { Apartment } from '~/utils/types/global';

definePageMeta({
	layout: 'minimal',
	middleware: 'guest-required',
});

const { t } = useI18n();
const localePath = useLocalePath();

useHead({
	title: () => t('auth.register.title'),
});

const toast = useToast();
const { hash } = useHash();

/**
 * Form
 */

const schema = z.object({
	apartmentId: z.number({
		required_error: t('common.required'),
	}),
	email: z
		.string({
			required_error: t('common.required'),
		})
		.email(t('common.invalidEmail')),
	password: z
		.string({
			required_error: t('common.required'),
		})
		.min(8, t('auth.register.passwordMinLength')),
	persons: z
		.array(
			z.object({
				name: z.string({
					required_error: t('common.required'),
				}),
				email: z
					.string({
						required_error: t('common.required'),
					})
					.email(t('common.invalidEmail')),
				phone: z
					.string({
						required_error: t('common.required'),
					})
					.min(8, t('common.phoneMinLength')),
			}),
		)
		.min(1, t('auth.register.minContactPersons'))
		.max(2, t('auth.register.maxContactPersons')),
	acceptedPrivacyPolicy: z
		.boolean({
			required_error: t('common.required'),
		})
		.refine((value) => value === true, {
			message: t('common.required'),
		}),
});

type Schema = z.output<typeof schema>;

const form = ref<Form<Schema>>();

type PartialSchema = Omit<Partial<Schema>, 'persons'> & {
	persons: {
		name: string | undefined;
		email: string | undefined;
		phone: string | undefined;
	}[];
};

const state = reactive<PartialSchema>({
	apartmentId: undefined,
	email: undefined,
	password: undefined,
	persons: [
		{
			name: undefined,
			email: undefined,
			phone: undefined,
		},
	],
	acceptedPrivacyPolicy: false,
});

const onSubmitLoading = ref<boolean>(false);

// @ts-ignore
async function onSubmit(event: FormSubmitEvent<Schema>) {
	onSubmitLoading.value = true;

	form.value!.clear();
	try {
		const passwordHash = await hash(event.data.password);

		const res = await $fetch('/api/app/auth/register', {
			method: 'POST',
			body: {
				apartmentId: event.data.apartmentId,
				email: event.data.email,
				password: passwordHash,
				persons: event.data.persons,
			},
		});

		if (res) {
			toast.add({
				icon: 'i-material-symbols-person-check',
				title: t('auth.register.accountCreated.title'),
				description: t('auth.register.accountCreated.description'),
				duration: 20000,
				actions: [
					{
						label: t('auth.register.accountCreated.action'),
						onClick: async () => {
							await navigateTo(localePath('/auth/login'));
						},
					},
				],
			});
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
		if (error.statusCode === 422) {
			form.value!.setErrors(
				error.data.errors.map((error: any) => ({
					message: error.message,
					path: error.path,
				})),
			);
		} else if (error.statusCode === 409) {
			form.value!.setErrors([
				{
					message: t('auth.register.emailInUse'),
					name: 'email',
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

/**
 * Persons
 */

function addPerson() {
	state.persons.push({
		name: undefined,
		email: undefined,
		phone: undefined,
	});
}

function removePerson(index: number) {
	state.persons.splice(index, 1);
}
</script>
