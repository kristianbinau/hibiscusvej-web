<template></template>

<script lang="ts" setup>
// Admin pages are excluded from localization: no /en/* route is generated.
defineI18nRoute(false);

definePageMeta({
	layout: 'logged-in-admin',
	middleware: 'admin-required',
});

useHead({
	title: 'Admin',
});
</script>

<style></style>
