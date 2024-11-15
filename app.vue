<template>
  <div
    class="flex flex-col items-center bg-gray-100 dark:bg-gray-900 min-h-dvh"
  >
    <NuxtRouteAnnouncer />
    <header class="md:container md:px-0 sm:px-3 px-1 w-full">
      <Navigation />
    </header>

    <main class="md:container w-full md:px-0 sm:px-3 px-1 mb-12">
      <NuxtPage />
    </main>

    <footer class="md:container w-full md:px-0 sm:px-3 px-1 mt-auto mb-10">
      <Links />
    </footer>
  </div>
  
  <ClientOnly>
    <ServiceWorker />
  </ClientOnly>
</template>

<script setup lang="ts">
useHead({
  titleTemplate: (titleChunk) => {
    return titleChunk ? `${titleChunk} - Hibiscusvej` : "Hibiscusvej";
  },
  meta: [
    {
      name: "Hibiscusvej Afdelingsbestyrelse",
      content: "Informationer omkring studieboligerne ved Hibiscusvej",
    },
    {
      name: "apple-mobile-web-app-title",
      content: "Hibiscusvej",
    },
  ],
  link: [
    {
      rel: "icon",
      type: "image/png",
      href: "/favicon-96x96.png",
      sizes: "96x96",
    },
    {
      rel: "icon",
      type: "image/svg+xml",
      href: "/favicon.svg",
    },
    {
      rel: "shortcut icon",
      href: "/favicon.ico",
    },
    {
      rel: "apple-touch-icon",
      sizes: "180x180",
      href: "/apple-touch-icon.png",
    },
    {
      rel: "apple-touch-icon",
      sizes: "180x180",
      href: "/apple-touch-icon.png",
    },
    {
      rel: "manifest",
      href: "/site.webmanifest",
    },
  ],
});
</script>
