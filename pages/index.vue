<template>
	<section
		class="relative lg:px-0 px-4 flex flex-col items-center text-center gap-4 mt-6"
	>
		<video :muted="true" :autoplay="true" :loop="true" class="w-dvw rounded-lg">
			<source
				src="https://storage.hibiscusvej.dk/google-earth-video.mp4"
				type="video/mp4"
			/>
		</video>

		<section
			class="lg:absolute lg:mt-0 -bottom-16 xl:bottom-0 z-30 mt-2 bg-gray-100 dark:bg-gray-900 p-4 rounded-tl-lg rounded-tr-lg"
		>
			<h1 class="text-primary text-4xl mb-2">Velkommen til Hibiscusvej 2-30</h1>

			<p class="mb-2">
				Denne side er styret af boligens frivillige bestyrelse.<br />
			</p>
			<p>
				Hvis du har spørgsmål, er du altid velkommen til at kontakte
				<ULink
					to="mailto:hibiscusvejbestyrelse@outlook.dk"
					:external="true"
					target="_blank"
					class="text-primary underline hover:text-primary-500"
				>
					bestyrelsen</ULink
				>.
			</p>

			<p>
				Boligen har også en
				<ULink
					to="https://www.facebook.com/groups/692711287862071"
					:external="true"
					target="_blank"
					class="text-primary underline hover:text-primary-500"
				>
					Facebook-gruppe</ULink
				>, hvor der løbende bliver delt nyttig information.
			</p>
		</section>
	</section>
</template>

<script lang="ts" setup>
useHead({
	title: 'Forside',
});
</script>
