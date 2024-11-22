<template>
	<header class="md:container md:px-0 sm:px-3 px-1 w-full mx-auto">
		<LayoutNavigation :links="links" />
	</header>

	<main class="md:container w-full md:px-0 sm:px-3 px-1 mb-12 mx-auto">
		<slot />
	</main>

	<footer
		class="md:container w-full md:px-0 sm:px-3 px-1 mt-auto mb-10 mx-auto"
	>
		<LayoutLinks/>
	</footer>
</template>

<script setup lang="ts">
const links = [
	[
		{
			label: 'Hibiscusvej',
			labelClass: 'hidden sm:text-2xl sm:block',
			icon: 'Logo',
			iconClass: 'sm:h-6 sm:w-6',
			to: '/u',
		},
	],
	[
		{
			label: 'Book lokale',
			labelClass: 'hidden sm:block',
			icon: 'i-material-symbols-add-home-work-rounded',
			to: '/u/communal/book',
		},
		{
			label: 'Mine bookinger',
			labelClass: 'hidden sm:block',
			icon: 'i-material-symbols-home-work-rounded',
			to: '/u/communal/me',
		},
		{
			badge: {
				icon: 'i-material-symbols-key-off-outline-rounded',
				variant: 'subtle',
				label: 'Logout',
				size: 'md',
				color: 'primary',
			},
			click: () => logout(),
		},
	],
];

async function logout() {
	try {
		const res = await $fetch('/api/auth/logout', {
			method: 'POST',
		});

		if (res) {
			await navigateTo('/');
		}
	} catch (error: any) {
		await navigateTo('/');
	}
}
</script>
