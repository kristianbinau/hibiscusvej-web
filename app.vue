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
  ],
});
</script>
