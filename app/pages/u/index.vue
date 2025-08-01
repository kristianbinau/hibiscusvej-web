<template></template>

<script lang="ts" setup>
definePageMeta({
	layout: 'logged-in',
	middleware: 'auth-required',
});

useHead({
	title: '',
});
</script>

<style></style>
