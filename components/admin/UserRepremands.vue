<template>
	<div
		v-if="!fetchingRepremands && repremands && repremands.length"
		class="grid grid-cols-1 md:grid-cols-2 gap-4 p-4"
	>
		<AdminUserRepremand
			v-for="repremand in repremands"
			:key="repremand.id"
			:repremand="repremand"
		/>
	</div>

	<template v-else-if="fetchingRepremands">
		<USkeleton class="h-24" />
	</template>

	<template v-else>
		<USkeleton class="h-24" />
		<UBadge
			class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
			color="gray"
		>
			Ingen Repremands!
		</UBadge>
	</template>
</template>

<script lang="ts" setup>
import type { UserRepremand } from '~/utils/types/admin';

const repremands = defineModel<UserRepremand[] | undefined>('repremands', {
	required: true,
});

const { userId } = defineProps<{
	userId: number;
}>();

const toast = useToast();

onMounted(() => {
	if (repremands.value === undefined) {
		fetchRepremands();
	}
});

const fetchingRepremands = ref(false);
async function fetchRepremands() {
	if (fetchingRepremands.value) {
		return;
	}

	fetchingRepremands.value = true;

	try {
		const data = await $fetch(`/api/admin/users/${userId}/repremands`);

		if (data === null) {
			fetchingRepremands.value = false;
			toast.add({
				title: 'Brugeren blev ikke fundet',
			});
			return;
		}

		repremands.value = data.repremands as UserRepremand[];
	} catch (error) {
		toast.add({
			title: 'Der skete en fejl ved hentning af bookings, genindlæs siden',
		});
	}

	fetchingRepremands.value = false;
}
</script>

<style></style>
