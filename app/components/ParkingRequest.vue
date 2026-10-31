<template>
	<UModal
		:title="t('parking.request.title')"
		:description="t('parking.request.description')"
	>
		<UButton
			:label="t('parking.request.title')"
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
						{{ t('parking.request.mailProgramNote') }}
					</small>
				</p>

				<UFormField :label="t('parking.request.nameLabel')" name="name">
					<UInput v-model="state.name" class="w-full" />
				</UFormField>

				<UFormField
					:label="t('parking.request.apartmentLabel')"
					name="apartmentId"
				>
					<ApartmentSelect ref="apartmentSelect" v-model="state.apartmentId" />
				</UFormField>

				<UFormField
					v-if="state.numberplate"
					:label="t('parking.request.numberplateLabel')"
					name="numberplate"
					:ui="{ container: 'flex gap-4' }"
				>
					<UFormField
						:label="t('parking.request.countryLabel')"
						name="numberplate.country"
						class="w-1/3"
					>
						<USelectMenu
							v-model="state.numberplate.country"
							:items="countries"
							valueKey="value"
							:placeholder="t('parking.request.countryPlaceholder')"
							class="w-full"
						/>
					</UFormField>
					<UFormField
						:label="t('parking.request.numberLabel')"
						name="numberplate.number"
						class="flex-1"
					>
						<UInput
							v-model="state.numberplate.number"
							:placeholder="t('parking.request.numberplatePlaceholder')"
							class="w-full"
						/>
					</UFormField>
				</UFormField>

				<UFormField :label="t('parking.request.zoneLabel')" name="zone">
					<USelectMenu
						v-model="state.zone"
						:items="zones"
						valueKey="value"
						:search-input="false"
						multiple
						class="w-full"
						:placeholder="t('parking.request.zonePlaceholder')"
					/>
				</UFormField>

				<p class="text-muted">
					<small>
						{{ t('parking.request.abNote1') }} <br />
						{{ t('parking.request.abNote2Intro') }}
						<b>{{ t('parking.request.abNote2Highlight') }}</b>
						{{ t('parking.request.abNote2Outro') }}
					</small>
				</p>

				<p class="text-muted">
					<small>
						{{ t('parking.request.mailProgramNote') }}
					</small>
				</p>

				<div v-if="customMailBody" class="relative">
					<UTooltip
						:text="t('parking.request.copyTooltip')"
						class="absolute top-2 right-2 z-10"
					>
						<UButton
							@click="copyToClipboard()"
							icon="i-material-symbols-content-copy"
							size="md"
							color="primary"
						/>
					</UTooltip>
					<UTextarea :modelValue="customMailBody" autoresize class="w-full" />
				</div>

				<UButton :loading="onSubmitLoading" type="submit" icon="i-lucide-send">
					{{ t('parking.request.submit') }}
				</UButton>
			</UForm>
		</template>
	</UModal>
</template>

<script lang="ts" setup>
import * as z from 'zod/v3';
import type { FormSubmitEvent } from '@nuxt/ui';
import { ApartmentSelect } from '#components';

const MAIL_TO =
	// The outgoing mail to AB Odense stays Danish in both locales — the
	// recipient is a Danish company (see the catalog note under `parking:`).
	'mailto:ab@abodense.dk?subject=Parkering%20-%20Afdeling%20Garterbyen%20(0128)&body=Hej%2C%0A%0AKan%20jeg%20f%C3%A5%20parkeringstilladelse%20til%20--PLADSER--%3F%0APladsnumre%3A%20--PLADSNUMRE--%0A%0ANummerplade%3A%20(--LANDEKODE--)%20--NUMMERPLADE--%0A%0AMvh.%0A--NAVN--%0A--ADDRESSE--%0AAfdeling%200128%2C%20Gartnerbyen';

const { t } = useI18n();

const apartmentSelect =
	useTemplateRef<typeof ApartmentSelect>('apartmentSelect');

const countries = computed(() => [
	{ value: 'DK', label: t('parking.countries.DK') },
	{ value: 'SE', label: t('parking.countries.SE') },
	{ value: 'NO', label: t('parking.countries.NO') },
	{ value: 'FI', label: t('parking.countries.FI') },
	{ value: 'DE', label: t('parking.countries.DE') },
	{ value: 'GB', label: t('parking.countries.GB') },
	{ value: 'FR', label: t('parking.countries.FR') },
	{ value: 'ES', label: t('parking.countries.ES') },
	{ value: 'IT', label: t('parking.countries.IT') },
	{ value: 'NL', label: t('parking.countries.NL') },
	{ value: 'BE', label: t('parking.countries.BE') },
	{ value: 'PL', label: t('parking.countries.PL') },
	{ value: 'AT', label: t('parking.countries.AT') },
	{ value: 'CH', label: t('parking.countries.CH') },
	{ value: 'LU', label: t('parking.countries.LU') },
	{ value: 'IE', label: t('parking.countries.IE') },
	{ value: 'PT', label: t('parking.countries.PT') },
	{ value: 'GR', label: t('parking.countries.GR') },
	{ value: 'CZ', label: t('parking.countries.CZ') },
	{ value: 'HU', label: t('parking.countries.HU') },
	{ value: 'RO', label: t('parking.countries.RO') },
	{ value: 'SK', label: t('parking.countries.SK') },
	{ value: 'SI', label: t('parking.countries.SI') },
	{ value: 'HR', label: t('parking.countries.HR') },
	{ value: 'BG', label: t('parking.countries.BG') },
]);

const zones = computed(() => [
	{ value: '3930', label: t('parking.zones.green') },
	{ value: '4744', label: t('parking.zones.extra') },
]);

// Danish fragments interpolated into the outgoing (Danish) mail to AB Odense.
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
		.string({ required_error: t('parking.request.nameRequired') })
		.min(4, t('parking.request.nameRequired')),
	apartmentId: z.number({
		required_error: t('parking.request.apartmentRequired'),
	}),
	numberplate: z
		.object(
			{
				country: z
					.string({ required_error: t('parking.request.countryRequired') })
					.refine((value) => countries.value.some((c) => c.value === value), {
						message: t('parking.request.countryInvalid'),
					}),
				number: z
					.string({ required_error: t('parking.request.numberplateRequired') })
					.min(4, t('parking.request.numberplateRequired')),
			},
			{ required_error: t('parking.request.numberplateRequired') },
		)
		.required(),
	zone: z
		.array(
			z.string().refine((value) => zones.value.some((z) => z.value === value), {
				message: t('parking.request.zoneInvalid'),
			}),
		)
		.min(1, t('parking.request.zoneMin')),
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

const customMailTo = computed<string>(() => {
	if (
		!state.name ||
		!state.apartmentId ||
		!state.numberplate?.country ||
		!state.numberplate?.number ||
		!state.zone ||
		state.zone.length === 0
	) {
		return '';
	}

	return MAIL_TO.replace(
		'--PLADSER--',
		encodeURIComponent(zonesValueToText(state.zone)),
	)
		.replace('--PLADSNUMRE--', encodeURIComponent(state.zone.join(', ')))
		.replace('--LANDEKODE--', encodeURIComponent(state.numberplate.country))
		.replace('--NUMMERPLADE--', encodeURIComponent(state.numberplate.number))
		.replace('--NAVN--', encodeURIComponent(state.name))
		.replace(
			'--ADDRESSE--',
			encodeURIComponent(
				apartmentSelect.value?.getLabelById(state.apartmentId) || '',
			),
		);
});

const customMailBody = computed(() => {
	const customMailBodyRaw = customMailTo.value.split('body=')[1];

	if (!customMailBodyRaw) return '';

	return decodeURIComponent(customMailBodyRaw);
});

const toast = useToast();
const onSubmitLoading = ref(false);
async function onSubmit(event: FormSubmitEvent<Schema>) {
	onSubmitLoading.value = true;

	window.location.href = customMailTo.value;

	onSubmitLoading.value = false;
}

function copyToClipboard() {
	const text = customMailBody.value;
	if (!text) return;

	navigator.clipboard.writeText(text).then(() => {
		toast.add({
			title: t('parking.request.copiedToClipboard'),
			description: text,
			duration: 3000,
		});
	});
}
</script>

<style></style>
