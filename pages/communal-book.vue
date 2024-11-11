<template>
  <section
    class="lg:w-2/4 px-4 mx-auto flex flex-col items-center text-center gap-4 mt-6"
  >
    <p>Booking af lokalet skal ske ved at sende navn og telefonnummer til:</p>
    <ULink
      to="mailto:hibiscusvejbestyrelse@outlook.dk"
      :external="true"
      target="_blank"
      class="text-primary underline hover:text-primary-500"
    >
      hibiscusvejbestyrelse@outlook.dk</ULink
    >
    <p>
      Bookingen er først godkendt når man har modtaget en bekræftelse via samme
      mail.
    </p>
  </section>
</template>

<script lang="ts" setup></script>

<style></style>
