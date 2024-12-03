<template></template>

<script lang="ts" setup>
definePageMeta({
	layout: 'logged-in-admin',
	middleware: 'admin-required',
});

useHead({
	title: 'Admin: Users',
});
</script>

<style></style>
