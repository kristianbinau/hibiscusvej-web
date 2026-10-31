/**
 * BCP 47 tags for the supported locales. `Intl` accepts the plain locale
 * codes, but the site's locales are defined with explicit `language` tags
 * (`da-DK`) in the i18n config, so map them explicitly.
 */
const BCP47_BY_LOCALE: Record<string, string> = {
	da: 'da-DK',
	en: 'en',
};

/**
 * Locale-aware date formatting (locked decision §3.9): replaces the
 * hardcoded `toLocaleDateString('da-DK')` / bare `toLocaleDateString()`
 * calls with `Intl` formatting driven by the active i18n locale.
 *
 * ```ts
 * const { formatDate } = useLocaleDate();
 * formatDate(date, { day: 'numeric', month: 'short', year: 'numeric' });
 * ```
 */
export const useLocaleDate = () => {
	const { locale } = useI18n();

	const localeTag = computed(
		() => BCP47_BY_LOCALE[locale.value] ?? locale.value,
	);

	const formatDate = (
		date: Date,
		options?: Intl.DateTimeFormatOptions,
	): string => new Intl.DateTimeFormat(localeTag.value, options).format(date);

	return { formatDate, localeTag };
};
