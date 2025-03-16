<template>
	<div class="flex flex-col min-h-dvh">
		<NuxtRouteAnnouncer />

		<UApp>
			<NuxtLayout>
				<NuxtPage />
			</NuxtLayout>
		</UApp>
	</div>

	<ClientOnly>
		<ServiceWorker />
	</ClientOnly>
</template>

<script setup lang="ts">
useHead({
	titleTemplate: (titleChunk) => {
		return titleChunk ? `${titleChunk} - Hibiscusvej 2-30` : 'Hibiscusvej 2-30';
	},
	meta: [
		{
			name: 'apple-mobile-web-app-title',
			content: 'Hibiscusvej 2-30',
		},
		{
			name: 'description',
			content: 'Informationer omkring studieboligerne ved Hibiscusvej',
		},
	],
	htmlAttrs: {
		lang: 'da',
	},
	link: [
		{
			rel: 'icon',
			type: 'image/png',
			href: '/favicon-96x96.png',
			sizes: '96x96',
		},
		{
			rel: 'icon',
			type: 'image/svg+xml',
			href: '/favicon.svg',
		},
		{
			rel: 'shortcut icon',
			href: '/favicon.ico',
		},
		{
			rel: 'apple-touch-icon',
			sizes: '180x180',
			href: '/apple-touch-icon.png',
		},
		{
			rel: 'apple-touch-icon',
			sizes: '180x180',
			href: '/apple-touch-icon.png',
		},
		{
			rel: 'manifest',
			href: '/site.webmanifest',
		},
	],
});
</script>