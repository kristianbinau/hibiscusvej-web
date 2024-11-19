<template>
		<header class="md:container md:px-0 sm:px-3 px-1 w-full">
			<Navigation />
		</header>

		<main class="md:container w-full md:px-0 sm:px-3 px-1 mb-12">
			<slot />
		</main>

		<footer class="md:container w-full md:px-0 sm:px-3 px-1 mt-auto mb-10">
			<Links />
		</footer>
</template>