<template></template>

<script lang="ts" setup>
// Admin pages are excluded from localization: no /en/* route is generated.
defineI18nRoute(false);

definePageMeta({
	layout: 'logged-in-system-admin',
	middleware: 'system-admin-required',
});

useHead({
	title: 'System Admin',
});
</script>
