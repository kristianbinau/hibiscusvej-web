<template>
	<div
		v-if="status === 'success' && repremands && repremands.length"
		class="grid grid-cols-1 md:grid-cols-2 gap-4 p-4"
	>
		<AdminUserRepremand
			v-for="repremand in repremands"
			:key="repremand.id"
			:repremand="repremand"
		/>
	</div>

	<template v-else-if="status === 'pending'">
		<USkeleton class="h-24" />
	</template>

	<template v-else>
		<USkeleton class="h-24" />
		<div
			class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex gap-2"
		>
			<UBadge color="neutral">Ingen Repremands!</UBadge>
			<UBadge color="neutral" icon="i-material-symbols-add-2-rounded" />
		</div>
	</template>
</template>

<script lang="ts" setup>
const { userId } = defineProps<{
	userId: number;
}>();

const { data: repremands, status } = await useFetch(
	`/api/app/admin/users/${userId}/repremands`,
);
</script>

<style></style>
