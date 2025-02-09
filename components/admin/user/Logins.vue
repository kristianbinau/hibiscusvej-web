<template>
	<div v-if="logins.length" class="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
		<AdminUserLogin v-for="login in logins" :key="login.id" :login="login" />
	</div>

	<template v-else>
		<USkeleton class="h-24" />
		<UBadge
			class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
			color="red"
		>
			Ingen Logins! Brugeren kan ikke bruges..
		</UBadge>
	</template>
</template>

<script lang="ts" setup>
import type { UserLogin } from '~/utils/types/admin';

const logins = defineModel<UserLogin[]>('logins', {
	required: true,
	type: Array,
});

const { userId } = defineProps<{
	userId: number;
}>();

const toast = useToast();
</script>

<style></style>
