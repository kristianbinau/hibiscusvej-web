<template>
	<section class="sm:w-full lg:w-3/4 mx-auto pt-8 px-4 md:px-0">
		<div class="mb-8">
			<h1 class="text-(--ui-primary) text-2xl mt-2 mb-2">Audit Logs</h1>
			<p>Seneste 100 admin handlinger.</p>
		</div>

		<ClientOnly>
			<UTable :loading="fetching" :data="rows" :columns="columns">
				<template #createdAt-cell="{ row }">
					{{
						new Date(row.getValue('createdAt')).toLocaleDateString('da-DK', {
							year: 'numeric',
							month: 'short',
							day: 'numeric',
							hour: '2-digit',
							minute: '2-digit',
						})
					}}
				</template>

				<template #actionType-cell="{ row }">
					<UBadge
						:color="getActionColor(row.getValue('actionType'))"
						variant="soft"
						size="sm"
					>
						{{ row.getValue('actionType') }}
					</UBadge>
				</template>
			</UTable>
		</ClientOnly>
	</section>
</template>

<script lang="ts" setup>
import type { TableColumn } from '@nuxt/ui';

definePageMeta({
	layout: 'logged-in-system-admin',
	middleware: 'system-admin-required',
});

useHead({
	title: 'System Admin: Audit Logs',
});

type LogRow = {
	id: number;
	userId: number;
	email: string | null;
	action: string;
	actionType: string;
	actionTarget: string;
	createdAt: Date;
};

const columns: TableColumn<LogRow>[] = [
	{
		accessorKey: 'id',
		header: 'ID',
	},
	{
		accessorKey: 'email',
		header: 'Admin',
	},
	{
		accessorKey: 'actionType',
		header: 'Handling',
	},
	{
		accessorKey: 'actionTarget',
		header: 'Mål',
	},
	{
		accessorKey: 'createdAt',
		header: 'Tidspunkt',
	},
];

const rows = ref<LogRow[]>([]);
const fetching = ref(true);

async function fetch() {
	fetching.value = true;

	try {
		const { data } = await useFetch('/api/app/system-admin/logs');

		if (!data.value) {
			fetching.value = false;
			return;
		}

		rows.value = data.value.logs.map((log) => {
			const separator = ': ';
			const idx = log.action.indexOf(separator);
			const actionType = idx === -1 ? log.action : log.action.slice(0, idx);
			const actionTarget =
				idx === -1 ? '' : log.action.slice(idx + separator.length);

			return {
				id: log.id,
				userId: log.userId,
				email: log.email,
				action: log.action,
				actionType: actionType,
				actionTarget: actionTarget,
				createdAt: new Date(log.createdAt),
			};
		});
	} catch {
		rows.value = [];
	}

	fetching.value = false;
}
fetch();

function getActionColor(
	actionType: string,
): 'error' | 'success' | 'warning' | 'neutral' {
	if (actionType.includes('Delete') || actionType.includes('Demote'))
		return 'error';
	if (actionType.includes('UnVerify')) return 'warning';
	if (actionType.includes('Promote') || actionType.includes('Verify'))
		return 'success';
	return 'neutral';
}
</script>
