<template>
	<div>
		<h1>Logged in!</h1>
		<p v-if="authUser">UserId: {{ authUser.user.id }}</p>
	</div>
</template>

<script lang="ts" setup>
definePageMeta({
	layout: 'logged-in',
	middleware: 'auth-required',
});

const { authUser } = await useUser();
</script>

<style></style>
