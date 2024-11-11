<template>
  <UHorizontalNavigation
    :links="links"
    class="border-b border-gray-200 dark:border-gray-800"
  />
</template>

<script lang="ts" setup>
const links = [
  [
    {
      label: "Hibiscusvej",
      labelClass: "sm:text-2xl",
      icon: "i-material-symbols-home",
      to: "/",
    },
  ],
  [
    {
      label: "Fælleslokale",
      icon: "i-material-symbols-add-home-work-rounded",
      to: "/communal",
    },
    {
      label: "Lån & Leje",
      icon: "i-material-symbols-tools-power-drill",
      to: "/borrow",
    },
  ],
];
</script>

<style></style>
