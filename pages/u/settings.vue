<template>
	<section class="sm:w-full lg:w-3/4 mx-auto pt-8 px-4 md:px-0">
		<div class="mb-8">
			<h1 class="text-primary text-2xl mt-2 mb-2">Indstillinger</h1>
			<p>
				Her kan du ændre oplysninger der er tilknyttet din bruger.<br />
			</p>
		</div>

		<ClientOnly>
			<UForm>

			</UForm>
		</ClientOnly>
	</section>
</template>

<script lang="ts" setup>

definePageMeta({
	layout: 'logged-in',
	middleware: 'auth-required',
});

useHead({
	title: 'Indstillinger',
});


/**
 * Fetch Bookings
 */
const me = ref<User>([]);
const fetchingMe = ref(true);

async function fetchMe() {
	fetchingMe.value = true;

	try {
		const { data } = await useFetch('/api/bookings/me');

		if (data.value === null) {
			fetchingMe.value = false;
			me.value = [];
			return;
		}

		me.value = data.value;
	} catch (error) {
		toast.add({
			title: 'Der skete en fejl ved hentning af bookings, genindlæs siden',
		});
		fetchingMe.value = false;
	}

	fetchingMe.value = false;
}
fetchMe();
</script>

<style></style>
