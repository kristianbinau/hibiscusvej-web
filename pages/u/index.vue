<template>
	<div>
		<h1>Logged in!</h1>
    <p v-if="authUser">UserId: {{ authUser.user.id }}</p>
	</div>
</template>

<script lang="ts" setup>
import type { InternalApi } from 'nitropack';
type UserResponse = InternalApi['/api/auth/user']['get'];

definePageMeta({
	layout: 'logged-in',
});

const authUser = ref<UserResponse | null>(null);

async function fetchUser() {
	const { data } = await useFetch('/api/auth/user');

	if (data.value === null) return;

	authUser.value = data.value;
}
fetchUser();
</script>

<style></style>
