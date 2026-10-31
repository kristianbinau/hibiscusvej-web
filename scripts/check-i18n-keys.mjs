/**
 * i18n catalog key check (CI) — the permanent catalog drift guard.
 *
 * Wraps `vue-i18n-extract`'s report so the CI job fails (non-zero exit) on:
 * - missing keys (used in `app/**` but absent from a locale file)
 * - unused LEAF keys — catalog text no code consumes anymore
 * - empty namespace placeholders (e.g. `foo: {}`) — they carry no checkable
 *   keys and only exist while a namespace is awaiting implementation
 *
 * except keys referenced from server code (`server/**`), which
 * vue-i18n-extract does not scan. Server-referenced keys (`errors.*`,
 * `push.*`) are covered by the server-key catalog unit test instead
 * (implementation brief §5); the same dotted-key candidates the unit test
 * matches are treated as used here.
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
const daCatalog = parse(await readFile(new URL('da.yaml', localeDir), 'utf8'));
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

/**
 * Matches single/double-quoted dotted paths with a lowercase first segment,
 * e.g. `'errors.booking.slotTaken'` — the same candidates the server-key
 * catalog unit test matches. LOG_MODULE-style constants (`'Api/Booking/Create'`)
 * and imports (`'~~/server/...'`) do not match.
 */
const KEY_PATTERN = /(['"])([a-z][a-zA-Z0-9]*(?:\.[a-zA-Z0-9_]+)+)\1/g;

const namespaces = new Set(Object.keys(daCatalog));

const collectServerReferencedKeys = async () => {
	const referenced = new Set();
	const walk = async (dir) => {
		for (const entry of await readdir(dir, { withFileTypes: true })) {
			if (entry.isDirectory()) {
				await walk(new URL(`${entry.name}/`, dir));
			} else if (entry.name.endsWith('.ts')) {
				const source = await readFile(new URL(entry.name, dir), 'utf8');
				for (const match of source.matchAll(KEY_PATTERN)) {
					const candidate = match[2];
					if (namespaces.has(candidate.split('.')[0])) {
						referenced.add(candidate);
					}
				}
			}
		}
	};
	await walk(new URL('../server/', import.meta.url));
	return referenced;
};

const serverReferencedKeys = await collectServerReferencedKeys();

const report = await createI18NReport({
	vueFiles: './app/**/*.{vue,ts}',
	languageFiles: './i18n/locales/*.yaml',
});

/**
 * Empty namespaces (`foo: {}`) carry no leaf keys, so the unused-key check
 * cannot see them. Every namespace is consumed by code now, so a leftover
 * placeholder can only be catalog drift.
 */
const collectEmptyNamespaces = async () => {
	const empty = [];
	for (const name of localeFiles) {
		const catalog = parse(await readFile(new URL(name, localeDir), 'utf8'));
		for (const [namespace, value] of Object.entries(catalog)) {
			if (
				value !== null &&
				typeof value === 'object' &&
				Object.keys(value).length === 0
			) {
				empty.push(`empty namespace: ${namespace} (${name})`);
			}
		}
	}
	return empty;
};

const problems = [...(await collectEmptyNamespaces())];

for (const { language, path } of report.missingKeys) {
	problems.push(`missing: [${language}] ${path}`);
}

const unused = report.unusedKeys.filter(
	({ path }) => leafPaths.has(path) && !serverReferencedKeys.has(path),
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
