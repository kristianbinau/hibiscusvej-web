<template>
	<h1>
		Velkommen Administator, dette er under udvikling
	</h1>
</template>

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
