<template>
	<UModal
		title="Browser ikke understøttet"
		description="Login er ikke understøttet i din nuværende browser."
		:dismissible="false"
		:close="false"
	>
		<template #body>
			<p class="mb-4">Skift til Chrome eller Firefox for at kunne logge ind.</p>
			<p>
				Dette er grundet manglende understøttelse af sikkerhedsstandarder i din
				nuværende browser. <br />
				Af sikkerhedsmæssige årsager kan vi derfor ikke tillade login.
			</p>
		</template>

		<template #footer>
			<UButton @click="emit('close', true)" to="/">
				Tilbage til forsiden
			</UButton>
		</template>
	</UModal>
</template>

<script lang="ts" setup>
const emit = defineEmits<{ close: [boolean] }>();
</script>

<style></style>
