<template>
	<UCard class="mb-4 last:mb-0">
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
	</UCard>
</template>

<script lang="ts" setup>
import type { UserLogin } from '~/utils/types/admin';

const login = defineModel<UserLogin>('login', {
	required: true,
	type: Object,
});

const toast = useToast();
</script>

<style></style>
