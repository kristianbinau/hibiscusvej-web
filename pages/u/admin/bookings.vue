<template></template>

<script lang="ts" setup>
definePageMeta({
	layout: 'logged-in-admin',
	middleware: 'admin-required',
});

useHead({
	title: 'Admin: Bookings',
});
</script>

<style></style>
