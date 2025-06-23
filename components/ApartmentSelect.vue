<template>
	<USelectMenu
		v-model="selected"
		:items="apartments"
		valueKey="id"
		class="w-full"
		:disabled="loading"
		:loading="loading"
		:placeholder="loading ? 'Indlæser...' : 'Vælg lejlighed'"
	/>
</template>

<script lang="ts" setup>
import { computed } from 'vue';
import type { Apartment } from '~/utils/types/global';

const selected = defineModel<number | undefined>();

const { data: apartmentsData, pending: loading } = useFetch(
	'/api/app/apartments',
);
const apartments = computed<{ id: number; label: string }[]>(() => {
	if (!apartmentsData.value) {
		return [];
	}

	return apartmentsData.value.map((apartment: Apartment) => {
		let address = `${apartment.street} ${apartment.number}`;
		if (apartment.floor && apartment.door) {
			address += `, ${apartment.floor}, ${apartment.door}`;
		}
		return {
			id: apartment.id,
			label: address,
		};
	});
});

function getLabelById(id: number): string | undefined {
	const found = apartments.value.find((a) => a.id === id);
	return found?.label;
}

defineExpose({ apartments, getLabelById });
</script>
