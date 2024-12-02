<template>
	<h1>Logged in!</h1>
	<p v-if="authUser">UserId: {{ authUser.user.id }}</p>
</template>

<script lang="ts" setup>
definePageMeta({
	layout: 'logged-in',
	middleware: 'auth-required',
});

useHead({
	title: '',
});

const { authUser } = await useUser();
</script>

<style></style>
