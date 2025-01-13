<template>
	<div v-if="persons.length" class="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
		<AdminUserPerson
			v-for="person in persons"
			:key="person.id"
			:person="person"
		/>
	</div>

	<template v-else>
		<USkeleton class="h-24" />
		<UBadge
			class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
			color="red"
		>
			Ingen Kontaktpersoner! Det er et krav at have mindst én..
		</UBadge>
	</template>
</template>

<script lang="ts" setup>
import type { UserPerson } from '~/utils/types/admin';

const persons = defineModel<UserPerson[]>('persons', {
	required: true,
	type: Array,
});

const { userId } = defineProps<{
	userId: number;
}>();

const toast = useToast();
</script>

<style></style>
