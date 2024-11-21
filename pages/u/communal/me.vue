<template>
  <div>
    <h1>My bookings</h1>
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