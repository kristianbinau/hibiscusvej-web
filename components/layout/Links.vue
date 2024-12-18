<template>
	<section>
		<hr class="border-gray-200 dark:border-gray-800" />

		<div class="flex justify-between mt-4 px-2">
			<div class="flex flex-col gap-2">
				<ULink
					to="https://www.abodense.dk/dept/0128/index"
					:external="true"
					target="_blank"
					class="text-gray-500 underline hover:text-gray-600 dark:hover:text-gray-400"
				>
					Gartnerbyen
				</ULink>
				<ULink
					to="mailto:hibiscusvejbestyrelse@outlook.dk"
					:external="true"
					target="_blank"
					class="text-gray-500 underline hover:text-gray-600 dark:hover:text-gray-400"
				>
					hibiscusvejbestyrelse@outlook.dk
				</ULink>

				<ULink
					to="/privacy"
					class="text-gray-500 underline hover:text-gray-600 dark:hover:text-gray-400"
				>
					Privatlivspolitik
				</ULink>
			</div>

			<div>
				<ULink
					to="https://www.facebook.com/groups/692711287862071"
					:external="true"
					target="_blank"
					class="text-gray-500 underline hover:text-gray-600 dark:hover:text-gray-400"
				>
					<UIcon name="i-mdi-facebook-box" class="w-8 h-8" />
				</ULink>
			</div>
		</div>
	</section>
</template>

<script lang="ts" setup></script>

<style></style>
