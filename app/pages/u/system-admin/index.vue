<template>
	<section class="sm:w-full lg:w-3/4 mx-auto pt-8 px-4 md:px-0">
		<div class="mb-8">
			<h1 class="text-(--ui-primary) text-2xl mt-2 mb-2">System Admin</h1>
		</div>
	</section>
</template>

<script lang="ts" setup>
definePageMeta({
	layout: 'logged-in-system-admin',
	middleware: 'system-admin-required',
});

useHead({
	title: 'System Admin',
});
</script>
