<template>
  <section class="markdown-content">
    <ContentDoc />
  </section>
</template>

<script lang="ts" setup></script>

<style>
section.markdown-content {
  @apply lg:w-3/4 px-4 mx-auto gap-4;
}

section.markdown-content h1:not(.markdown-exclude) {
  @apply text-primary text-4xl mt-5 mb-4;
}

section.markdown-content h2:not(.markdown-exclude) {
  @apply text-primary text-2xl mt-5 mb-4;
}

section.markdown-content h3:not(.markdown-exclude) {
  @apply text-primary text-xl mt-5 mb-4;
}

section.markdown-content h4:not(.markdown-exclude) {
  @apply text-primary text-lg mt-5 mb-4;
}

section.markdown-content h5:not(.markdown-exclude) {
  @apply text-primary text-base mt-5 mb-4;
}

section.markdown-content h6:not(.markdown-exclude) {
  @apply text-primary text-sm mt-5 mb-4;
}

section.markdown-content h1:not(.markdown-exclude) a,
section.markdown-content h2:not(.markdown-exclude) a,
section.markdown-content h3:not(.markdown-exclude) a,
section.markdown-content h4:not(.markdown-exclude) a,
section.markdown-content h5:not(.markdown-exclude) a,
section.markdown-content h6:not(.markdown-exclude) a {
  @apply no-underline;
}

section.markdown-content p:not(.markdown-exclude) {
  @apply text-gray-700 dark:text-gray-300 mb-3;
}

section.markdown-content a:not(.markdown-exclude) {
  @apply text-primary underline hover:text-primary-500;
}

section.markdown-content ul:not(.markdown-exclude) {
  @apply list-disc list-outside ml-3 mb-3 [&_ul]:list-[revert];
}

section.markdown-content ol:not(.markdown-exclude) {
  @apply list-decimal list-outside mb-3;
}

section.markdown-content li:not(.markdown-exclude) {
  @apply text-gray-700 dark:text-gray-300 mb-3;
}

section.markdown-content img:not(.markdown-exclude) {
  @apply mx-auto my-4;
}
</style>
