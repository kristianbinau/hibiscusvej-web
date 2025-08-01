<template>
	<UModal
		title="Anmod om parkeringstilladelse"
		description="Indtast dine oplysninger for at anmode om en parkeringstilladelse."
	>
		<UButton
			label="Anmod om parkeringstilladelse"
			color="primary"
			variant="subtle"
			size="lg"
			class="mt-2 mb-4"
		/>

		<template #body>
			<UForm
				:schema="schema"
				:state="state"
				class="space-y-4"
				@submit.prevent="onSubmit"
			>
				<p class="text-muted">
					<small>
						Anmodningen vil blive åbnet i dit standard mailprogram med alle
						oplysninger udfyldt. Du skal selv søge for at klikke på send og
						verificere at alle oplysninger er korrekte.
					</small>
				</p>

				<UFormField label="Navn" name="name">
					<UInput v-model="state.name" class="w-full" />
				</UFormField>

				<UFormField label="Lejlighed" name="apartmentId">
					<ApartmentSelect ref="apartmentSelect" v-model="state.apartmentId" />
				</UFormField>

				<UFormField
					v-if="state.numberplate"
					label="Nummerplade"
					name="numberplate"
					:ui="{ container: 'flex gap-4' }"
				>
					<UFormField label="Land" name="numberplate.country" class="w-1/3">
						<USelectMenu
							v-model="state.numberplate.country"
							:items="countries"
							valueKey="value"
							placeholder="Vælg land"
							class="w-full"
						/>
					</UFormField>
					<UFormField label="Nummer" name="numberplate.number" class="flex-1">
						<UInput
							v-model="state.numberplate.number"
							placeholder="Indtast nummerplade"
							class="w-full"
						/>
					</UFormField>
				</UFormField>

				<UFormField label="Zone" name="zone">
					<USelectMenu
						v-model="state.zone"
						:items="zones"
						valueKey="value"
						:search-input="false"
						multiple
						class="w-full"
						placeholder="Vælg en eller flere zoner"
					/>
				</UFormField>

				<p class="text-muted">
					<small>
						Vær opmærksom på, at anmodningen vil blive sendt til AB Odense for
						godkendelse. <br />
						Du vil modtage en <b>individuel bekræftelse per zone</b> via e-mail,
						når din anmodning er godkendt.
					</small>
				</p>

				<UButton :loading="onSubmitLoading" type="submit" icon="i-lucide-send">
					Anmod om parkeringstilladelse
				</UButton>
			</UForm>
		</template>
	</UModal>
</template>

<script lang="ts" setup>
import * as z from 'zod/v3';
import type { FormSubmitEvent } from '@nuxt/ui';

const MAIL_TO =
	'mailto:ab@abodense.dk?subject=Parkering%20-%20Afdeling%20Garterbyen%20(0128)&body=Hej%2C%0A%0AKan%20jeg%20f%C3%A5%20parkeringstilladelse%20til%20--PLADSER--%3F%0APladsnumre%3A%20--PLADSNUMRE--%0A%0ANummerplade%3A%20(--LANDEKODE--)%20--NUMMERPLADE--%0A%0AMvh.%0A--NAVN--%0A--ADDRESSE--%0AAfdeling%200128%2C%20Gartnerbyen';

const apartmentSelect = useTemplateRef('apartmentSelect');

const countries = [
	{ value: 'DK', label: 'Danmark' },
	{ value: 'SE', label: 'Sverige' },
	{ value: 'NO', label: 'Norge' },
	{ value: 'FI', label: 'Finland' },
	{ value: 'DE', label: 'Tyskland' },
	{ value: 'GB', label: 'Storbritannien' },
	{ value: 'FR', label: 'Frankrig' },
	{ value: 'ES', label: 'Spanien' },
	{ value: 'IT', label: 'Italien' },
	{ value: 'NL', label: 'Holland' },
	{ value: 'BE', label: 'Belgien' },
	{ value: 'PL', label: 'Polen' },
	{ value: 'AT', label: 'Østrig' },
	{ value: 'CH', label: 'Schweiz' },
	{ value: 'LU', label: 'Luxembourg' },
	{ value: 'IE', label: 'Irland' },
	{ value: 'PT', label: 'Portugal' },
	{ value: 'GR', label: 'Grækenland' },
	{ value: 'CZ', label: 'Tjekkiet' },
	{ value: 'HU', label: 'Ungarn' },
	{ value: 'RO', label: 'Rumænien' },
	{ value: 'SK', label: 'Slovakiet' },
	{ value: 'SI', label: 'Slovenien' },
	{ value: 'HR', label: 'Kroatien' },
	{ value: 'BG', label: 'Bulgarien' },
];

const zones = [
	{ value: '3930', label: 'Grønne pladser (3930)' },
	{ value: '4744', label: 'Ekstra pladser (4744)' },
];

function zonesValueToText(values: string[]): string {
	if (values.includes('3930') && values.includes('4744')) {
		return 'begge vores pladser';
	} else if (values.includes('3930')) {
		return 'vores grønne pladser';
	} else if (values.includes('4744')) {
		return 'vores ekstra pladser';
	}

	throw new Error('Invalid zone values');
}

const schema = z.object({
	name: z
		.string({ required_error: 'Navn er påkrævet' })
		.min(4, 'Navn er påkrævet'),
	apartmentId: z.number({ required_error: 'Lejlighed er påkrævet' }),
	numberplate: z
		.object(
			{
				country: z
					.string({ required_error: 'Land er påkrævet' })
					.refine((value) => countries.some((c) => c.value === value), {
						message: 'Ugyldigt land',
					}),
				number: z
					.string({ required_error: 'Nummerplade er påkrævet' })
					.min(4, 'Nummerplade er påkrævet'),
			},
			{ required_error: 'Nummerplade er påkrævet' },
		)
		.required(),
	zone: z
		.array(
			z.string().refine((value) => zones.some((z) => z.value === value), {
				message: 'Ugyldig zone',
			}),
		)
		.min(1, 'Vælg mindst én zone'),
});

type Schema = z.output<typeof schema>;

const state = reactive<Partial<Schema>>({
	name: undefined,
	apartmentId: undefined,
	numberplate: {
		country: 'DK',
		number: '',
	},
	zone: [],
});

const toast = useToast();
const onSubmitLoading = ref(false);
async function onSubmit(event: FormSubmitEvent<Schema>) {
	onSubmitLoading.value = true;

	const mailTo = MAIL_TO.replace(
		'--PLADSER--',
		zonesValueToText(event.data.zone),
	)
		.replace('--PLADSNUMRE--', event.data.zone.join(', '))
		.replace('--LANDEKODE--', event.data.numberplate.country)
		.replace('--NUMMERPLADE--', event.data.numberplate.number)
		.replace('--NAVN--', event.data.name)
		.replace(
			'--ADDRESSE--',
			apartmentSelect.value?.getLabelById(event.data.apartmentId!) || '',
		);

	window.location.href = mailTo;

	onSubmitLoading.value = false;
}
</script>

<style></style>
