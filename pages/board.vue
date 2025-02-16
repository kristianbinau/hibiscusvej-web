<template>
	<section class="flex flex-col">
		<UDivider>
			<h2>Formand</h2>
		</UDivider>

		<div v-if="chairman" class="grid grid-cols-2 gap-4 p-4">
			<BoardMemberCard :member="chairman" />
		</div>

		<UDivider>
			<h2>Medlemmer</h2>
		</UDivider>

		<div v-if="members" class="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
			<BoardMemberCard v-for="member in members" :member="member" />
		</div>

		<UDivider>
			<h2>Suppleanter</h2>
		</UDivider>

		<div v-if="deputies" class="grid grid-cols-2 gap-4 p-4">
			<BoardMemberCard v-for="deputy in deputies" :member="deputy" />
		</div>
	</section>
</template>

<script lang="ts" setup>
const { data: chairman } = await useAsyncData('collection-chairman', () => {
	return queryCollection('board').where('type', '=', 'chairman').first();
});

const { data: members } = await useAsyncData('collection-members', () => {
	return queryCollection('board').where('type', '=', 'member').all();
});

const { data: deputies } = await useAsyncData('collection-deputies', () => {
	return queryCollection('board').where('type', '=', 'deputy').all();
});
</script>
