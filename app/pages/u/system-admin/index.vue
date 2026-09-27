<template></template>

<script lang="ts" setup>
definePageMeta({
	layout: 'logged-in-system-admin',
	middleware: 'system-admin-required',
});

useHead({
	title: 'System Admin',
});
</script>
