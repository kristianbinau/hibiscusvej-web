<template>
	<section class="sm:w-full lg:w-3/4 mx-auto pt-8 px-4 md:px-0">
		<div class="mb-8">
			<h1 class="text-(--ui-primary) text-2xl mt-2 mb-2">
				{{ t('booking.request.title') }}
			</h1>
			<p>
				{{ t('booking.request.description1') }}<br />
				{{ t('booking.request.description2') }}
			</p>
		</div>

		<ClientOnly>
			<UTable
				v-model:expanded="expanded"
				v-model:column-visibility="columnVisibility"
				:data="rows"
				:columns="columns"
				:ui="{ tr: 'data-[expanded=true]:bg-elevated/50' }"
			>
				<template #handledAt-cell="{ row }">
					<UBadge
						v-if="row.getValue<boolean | null>('permitted') === null"
						:label="t('booking.request.pending')"
						color="warning"
					/>

					<UBadge
						v-else-if="row.getValue<boolean>('permitted')"
						:label="t('booking.request.approved')"
						color="success"
					/>
					<UBadge v-else :label="t('booking.request.rejected')" color="error" />
				</template>

				<template #id-cell="{ row }">
					<UTooltip :text="t('booking.request.deleteTooltip')">
						<UButton
							size="md"
							:label="t('booking.request.delete')"
							color="error"
							variant="soft"
							:disabled="
								isAfter(now, row.getValue<Date>('date')) ||
								row.getValue<Date | null>('handledAt') !== null
							"
							@click="deleteBookingRequest(row.getValue('id'))"
							:loading="deleteBookingRequestLoading"
						/>
					</UTooltip>
				</template>

				<template #expanded="{ row }">
					<div class="flex flex-col gap-4">
						<UFormField :label="t('booking.request.yourReason')">
							<p>{{ row.getValue('requestText') }}</p>
						</UFormField>

						<UFormField :label="t('booking.request.adminDecision')">
							<UBadge
								v-if="row.getValue<boolean | null>('permitted') === null"
								:label="t('booking.request.pending')"
								color="warning"
							/>

							<UBadge
								v-else-if="row.getValue<boolean>('permitted')"
								:label="t('booking.request.approved')"
								color="success"
							/>
							<UBadge
								v-else
								:label="t('booking.request.rejected')"
								color="error"
							/>
						</UFormField>

						<UFormField
							v-if="row.getValue<string | null>('handledText') !== null"
							:label="t('booking.request.adminExplanation')"
						>
							<p>
								{{ displayHandledText(row.getValue('handledText')) }}
							</p>
						</UFormField>
					</div>
				</template>
			</UTable>
		</ClientOnly>
	</section>
</template>

<script lang="ts" setup>
import { h, resolveComponent } from 'vue';
import type { InternalApi } from 'nitropack';
import type { TableColumn } from '@nuxt/ui';
type MyBookingRequestsApiResponse =
	InternalApi['/api/app/bookings/requests/me']['get'];

import { isAfter } from 'date-fns';
import { AUTO_CLOSE_HANDLED_TEXT } from '#shared/constants';

const UButton = resolveComponent('UButton');
const UBadge = resolveComponent('UBadge');

definePageMeta({
	layout: 'logged-in',
	middleware: 'auth-required',
});

const { t } = useI18n();
const { formatDate } = useLocaleDate();

useHead({
	title: () => t('nav.myBookings'),
});

const toast = useToast();

type MyBookingRequestRow = {
	date: Date;
	createdAt: Date;
	requestText: string | null;
	handledText: string | null;
	handledAt: Date | null;
	permitted: boolean | null;
	id: number;
};

/**
 * Render the persisted `handledText` for residents. The server-written
 * auto-close text (`AUTO_CLOSE_HANDLED_TEXT`) is replaced by its localized
 * counterpart; anything else is admin-entered free text (UGC) and is shown
 * raw, exactly as persisted.
 */
function displayHandledText(handledText: string | null): string {
	if (handledText === AUTO_CLOSE_HANDLED_TEXT) {
		return t('booking.request.autoClosed');
	}

	return handledText ?? '';
}

const columns: TableColumn<MyBookingRequestRow>[] = [
	{
		id: 'expand',
		cell: ({ row }) =>
			h(UButton, {
				color: 'neutral',
				variant: 'ghost',
				icon: 'i-lucide-chevron-down',
				square: true,
				'aria-label': 'Expand',
				ui: {
					leadingIcon: [
						'transition-transform',
						row.getIsExpanded() ? 'duration-200 rotate-180' : '',
					],
				},
				onClick: () => row.toggleExpanded(),
			}),
	},
	{
		accessorKey: 'handledAt',
		header: t('booking.request.status'),
	},
	{
		accessorKey: 'date',
		header: t('common.date'),
		cell: ({ row }) => formatDate(row.getValue<Date>('date')),
	},
	{
		accessorKey: 'createdAt',
		header: t('common.createdAt'),
		cell: ({ row }) => formatDate(row.getValue<Date>('createdAt')),
	},
	{
		accessorKey: 'id',
		header: t('common.actions'),
	},
	{
		accessorKey: 'handledText',
		header: t('booking.request.handledText'),
	},
	{
		accessorKey: 'requestText',
		header: t('booking.request.requestText'),
	},
	{
		accessorKey: 'permitted',
		header: t('booking.request.permitted'),
	},
];

const rows = computed<MyBookingRequestRow[]>(() => {
	return (
		myBookingRequests.value?.map((booking) => ({
			date: new Date(booking.fromTimestamp),
			requestText: booking.requestText,
			handledText: booking.handledText,
			permitted: booking.permitted,
			createdAt: new Date(booking.createdAt),
			handledAt: booking.handledAt ? new Date(booking.handledAt) : null,
			id: booking.id,
		})) || []
	);
});

const expanded = ref({});

const columnVisibility = ref({
	handledText: false,
	requestText: false,
	permitted: false,
});

const now = ref(new Date());

/**
 * Fetch Booking Requests
 */

const { data: myBookingRequests } = useNuxtData<MyBookingRequestsApiResponse>(
	'my-booking-requests',
);

/**
 * Delete Bookings
 */

const deleteBookingRequestLoading = ref<boolean>(false);

async function deleteBookingRequest(id: number) {
	deleteBookingRequestLoading.value = true;

	try {
		const res = await $fetch(`/api/app/bookings/requests/${id}`, {
			method: 'DELETE',
		});

		if (res) {
			await refreshNuxtData(['my-booking-requests']);

			toast.add({
				icon: 'i-material-symbols-check-circle-outline-rounded',
				title: t('common.success'),
				description: t('booking.request.deleted'),
			});
		}
	} catch (error) {
		toast.add({
			icon: 'i-material-symbols-error-outline-rounded',
			title: t('common.error'),
			description: t('common.errorDescription'),
			actions: [
				{
					label: t('common.retry'),
					onClick: () => deleteBookingRequest(id),
				},
			],
		});
	}

	deleteBookingRequestLoading.value = false;
}
</script>

<style></style>
