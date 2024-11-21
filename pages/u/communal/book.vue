<template>
  <div>
    <h1>Book</h1>
  </div>
</template>

<script lang="ts" setup>
definePageMeta({
	layout: 'logged-in',
	middleware: 'auth-required',
});
</script>

<style>

</style>