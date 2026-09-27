<template></template>

<script lang="ts" setup>
definePageMeta({
	layout: 'logged-in-admin',
	middleware: 'admin-required',
});

useHead({
	title: 'Admin',
});
</script>

<style></style>
