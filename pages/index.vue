<template>
  <section
    class="lg:w-2/4 lg:px-0 px-4 mx-auto flex flex-col items-center text-center gap-4 mt-6"
  >
    <h1 class="text-primary text-4xl mb-2">Velkommen til Hibiscusvej</h1>

    <p>
      Denne side er styret af boligens frivillige bestyrelse.<br />
      Informationer omkring boligen, leje af lokale og lån af udstyr kan findes
      under de tilsvarende menu punkter.
    </p>
    <p>
      Hop ind på vores

      <ULink
        to="https://www.facebook.com/groups/692711287862071"
        :external="true"
        target="_blank"
        class="text-primary underline hover:text-primary-500"
        >facebook gruppe</ULink
      >
      for at komme i kontakt med resten af boligen.
    </p>

    <p>
      Bestyrelsen kan kontaktes via mail:

      <ULink
        to="mailto:hibiscusvejbestyrelse@outlook.dk"
        :external="true"
        target="_blank"
        class="text-primary underline hover:text-primary-500"
      >
        hibiscusvejbestyrelse@outlook.dk</ULink
      >
    </p>
  </section>
</template>

<script lang="ts" setup>

</script>

<style></style>
