/**
 * i18n catalog key check (CI).
 *
 * Wraps `vue-i18n-extract`'s report so the CI job fails on:
 * - missing keys (used in `app/**` but absent from a locale file)
 * - unused LEAF keys — except the `errors.*` namespace, which is referenced
 *   from server code (`server/utils/i18n-errors.ts`) that vue-i18n-extract
 *   does not scan; server-referenced keys are covered by the server-key
 *   catalog unit test instead (implementation brief §5).
 *
 * Empty namespace placeholders (e.g. `nav: {}` awaiting Phase 2) are not
 * leaf keys and are ignored.
 */
import { createI18NReport } from 'vue-i18n-extract';
import { readdir, readFile } from 'node:fs/promises';
import { parse } from 'yaml';

const collectLeafPaths = (node, prefix = '') => {
	if (node === null || typeof node !== 'object') {
		return [prefix];
	}
	return Object.entries(node).flatMap(([key, value]) =>
		collectLeafPaths(value, prefix ? `${prefix}.${key}` : key),
	);
};

const localeDir = new URL('../i18n/locales/', import.meta.url);
const localeFiles = (await readdir(localeDir)).filter((name) =>
	name.endsWith('.yaml'),
);
const leafPaths = new Set(
	(
		await Promise.all(
			localeFiles.map(async (name) =>
				collectLeafPaths(
					parse(await readFile(new URL(name, localeDir), 'utf8')),
				),
			),
		)
	).flat(),
);

const report = await createI18NReport({
	vueFiles: './app/**/*.{vue,ts}',
	languageFiles: './i18n/locales/*.yaml',
});

const problems = [];

for (const { language, path } of report.missingKeys) {
	problems.push(`missing: [${language}] ${path}`);
}

const unused = report.unusedKeys.filter(
	({ path }) => leafPaths.has(path) && !path.startsWith('errors.'),
);
for (const { language, path } of unused) {
	problems.push(`unused: [${language}] ${path}`);
}

if (problems.length > 0) {
	console.error(`i18n key check failed (${problems.length}):`);
	for (const problem of problems) {
		console.error(`  - ${problem}`);
	}
	process.exit(1);
}

console.log('i18n key check passed: no missing or unused keys.');
