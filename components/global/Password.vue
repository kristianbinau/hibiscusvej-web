<template>
	<UInput
		v-model="model"
		:type="visible ? 'text' : 'password'"
		:ui="{ icon: { trailing: { pointer: '' } } }"
		:model-modifiers="{ trim: true }"
	>
		<template #trailing>
			<UIcon
				v-if="!visible"
				@click.stop.prevent="toggleVisibility"
				class="cursor-pointer"
				name="i-material-symbols-visibility-off-outline-rounded"
			/>
			<UIcon
				v-else
				@click.stop.prevent="toggleVisibility"
				class="cursor-pointer"
				name="i-material-symbols-visibility-outline-rounded"
			/>
		</template>
	</UInput>
</template>

<script lang="ts" setup>
const model = defineModel<string>();

const visible = ref<boolean>(false);
function toggleVisibility() {
	visible.value = !visible.value;
}
</script>

<style></style>
