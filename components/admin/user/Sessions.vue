<template>
	<div v-if="sessions.length" class="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
		<AdminUserSession
			v-for="session in sessions"
			:key="session.id"
			:session="session"
		/>
	</div>

	<template v-else>
		<USkeleton class="h-24" />
		<UBadge
			class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
			color="gray"
		>
			Ingen Sessions!
		</UBadge>
	</template>
</template>

<script lang="ts" setup>
import type { UserSession } from '~/utils/types/admin';

const sessions = defineModel<UserSession[]>('sessions', {
	required: true,
	type: Array,
});

const { userId } = defineProps<{
	userId: number;
}>();

const toast = useToast();
</script>

<style></style>
