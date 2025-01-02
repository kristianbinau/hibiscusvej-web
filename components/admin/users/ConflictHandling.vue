<template>
	<UAlert
		v-if="usersWithDuplicateApartments.length > 0"
		title="Flere brugere har samme lejlighed"
		description="Der er flere brugere med samme lejlighed. Klik for at løse."
		icon="i-material-symbols-apartment-rounded"
		color="red"
		variant="subtle"
		class="mb-6 cursor-pointer select-none"
		@click="isOpenApartmentConfict = true"
	/>

	<AdminUsersConflictApartment
		v-if="usersWithDuplicateApartments.length > 0"
		v-model="isOpenApartmentConfict"
		:conflicting="usersWithDuplicateApartments"
		:apartments="props.apartments"
	/>

	<UAlert
		v-if="usersWithDuplicatePersons.length > 0"
		title="Flere brugere har samme person"
		description="Der er flere brugere med samme person. Klik for at løse."
		icon="i-material-symbols-person-rounded"
		color="red"
		variant="subtle"
		class="mb-6 cursor-pointer select-none"
		@click="isOpenPersonConfict = true"
	></UAlert>

	<AdminUsersConflictPerson
		v-if="usersWithDuplicatePersons.length > 0"
		v-model="isOpenPersonConfict"
		:conflicting="usersWithDuplicatePersons"
	/>
</template>

<script lang="ts" setup>
import type { Apartment, User } from '~/utils/types/admin';

const props = defineProps<{
	users: User[];
	apartments: Apartment[];
}>();

/**
 * Apartment conflicts
 */

const isOpenApartmentConfict = ref(false);
const usersWithDuplicateApartments: Ref<
	{
		apartmentId: number;
		users: User[];
	}[]
> = computed(() => {
	const usersWithDuplicateApartments = props.users.reduce(
		(acc, user) => {
			const existing = acc.find(
				(item) => item.apartmentId === user.apartmentId,
			);

			if (existing) {
				existing.users.push(user);
			} else {
				acc.push({
					apartmentId: user.apartmentId,
					users: [user],
				});
			}

			return acc;
		},
		[] as { apartmentId: number; users: User[] }[],
	);

	return usersWithDuplicateApartments.filter((item) => item.users.length > 1);
});

/**
 * Person conflicts
 */

const isOpenPersonConfict = ref(false);
const usersWithDuplicatePersons: Ref<
	{
		users: User[];
	}[]
> = computed(() => {
	const usersWithDuplicatePersons = props.users.reduce(
		(acc, user) => {
			const existing = acc.find((item) =>
				item.users.some((existingUser) =>
					existingUser.persons.some((existingPerson) =>
						user.persons.some(
							(person) =>
								person.email === existingPerson.email ||
								person.phone === existingPerson.phone,
						),
					),
				),
			);

			if (existing) {
				existing.users.push(user);
			} else {
				acc.push({
					users: [user],
				});
			}

			return acc;
		},
		[] as { users: User[] }[],
	);

	const withoutDuplicateApartments = usersWithDuplicatePersons.filter(
		(item) =>
			!usersWithDuplicateApartments.value.some((duplicateApartments) => {
				return item.users.some(
					(user) => user.apartmentId === duplicateApartments.apartmentId,
				);
			}),
	);

	return withoutDuplicateApartments.filter((item) => item.users.length > 1);
});
</script>

<style></style>
