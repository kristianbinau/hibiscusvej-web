<template>
	<div class="flex flex-col">
		<template v-if="status === 'pending'">
			<USkeleton class="h-24 m-4" />
		</template>

		<template v-else>
			<div class="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
				<AdminUserRepremand
					v-for="repremand in repremands"
					:key="repremand.id"
					:repremand="repremand"
					:userId="userId"
					@deleted="refresh"
				/>

				<AdminUserRepremand
					v-for="(draft, index) in drafts"
					:key="`draft-${index}`"
					:repremand="draft"
					:userId="userId"
					@cancelled="removeDraft(index)"
					@created="onCreated(index)"
				/>

				<div class="relative h-93 w-full md:w-84">
					<USkeleton class="absolute top-0 left-0 h-93 w-full md:w-84" />
					<UButton
						class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
						icon="i-material-symbols-add-2-rounded"
						variant="solid"
						color="neutral"
						@click="addDraft"
					/>
				</div>
			</div>
		</template>
	</div>
</template>

<script lang="ts" setup>
import type { UserRepremand } from '~/utils/types/admin';

const { userId } = defineProps<{
	userId: number;
}>();

const {
	data: repremands,
	status,
	refresh,
} = await useFetch(`/api/app/admin/users/${userId}/repremands`);

const drafts = ref<Partial<UserRepremand>[]>([]);

function addDraft() {
	drafts.value.push({ userId });
}

function removeDraft(index: number) {
	drafts.value.splice(index, 1);
}

async function onCreated(index: number) {
	removeDraft(index);
	await refresh();
}
</script>
