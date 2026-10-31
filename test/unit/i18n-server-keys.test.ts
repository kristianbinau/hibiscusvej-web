import { describe, test, expect } from 'vitest';
import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parse } from 'yaml';
import { ERROR_KEYS } from '../../server/utils/i18n-errors';

/**
 * Server-side i18n key contract test (implementation brief §5).
 *
 * `vue-i18n-extract` (the `check:i18n` script) only scans `app/**`, so keys
 * referenced from server code are asserted here instead:
 *
 * 1. every value in `ERROR_KEYS` (the stable error-key contract) must exist
 *    in both catalogs;
 * 2. every string literal in `server/**` that looks like a catalog key
 *    (dotted path, lowercase first segment, whose first segment is a
 *    top-level catalog namespace) must exist in both catalogs.
 *
 * The scan is generic on purpose: keys introduced by later phases (e.g. the
 * `push.*` payload keys) are covered automatically without touching this
 * test.
 */

const ROOT = path.resolve(
	path.dirname(fileURLToPath(import.meta.url)),
	'../..',
);

const collectLeafPaths = (node: unknown, prefix = ''): string[] => {
	if (node === null || typeof node !== 'object') {
		return [prefix];
	}
	return Object.entries(node as Record<string, unknown>).flatMap(
		([key, value]) =>
			collectLeafPaths(value, prefix ? `${prefix}.${key}` : key),
	);
};

const leafExists = (catalog: unknown, key: string): boolean =>
	collectLeafPaths(catalog).includes(key);

const da = parse(
	await readFile(path.join(ROOT, 'i18n/locales/da.yaml'), 'utf8'),
);
const en = parse(
	await readFile(path.join(ROOT, 'i18n/locales/en.yaml'), 'utf8'),
);

async function listServerFiles(dir: string): Promise<string[]> {
	const entries = await readdir(dir, { withFileTypes: true });
	const files = await Promise.all(
		entries.map((entry) => {
			const full = path.join(dir, entry.name);
			if (entry.isDirectory()) {
				return listServerFiles(full);
			}
			return full.endsWith('.ts') ? [full] : [];
		}),
	);
	return files.flat();
}

/**
 * Matches single/double-quoted dotted paths with a lowercase first segment,
 * e.g. `'errors.booking.slotTaken'`. LOG_MODULE-style constants
 * (`'Api/Booking/Create'`) and imports (`'~~/server/...'`) do not match.
 */
const KEY_PATTERN = /(['"])([a-z][a-zA-Z0-9]*(?:\.[a-zA-Z0-9_]+)+)\1/g;

const namespaces = new Set(Object.keys(da as object));

const serverFiles = await listServerFiles(path.join(ROOT, 'server'));

const referencedKeys = new Set<string>(Object.values(ERROR_KEYS));

for (const file of serverFiles) {
	const source = await readFile(file, 'utf8');
	for (const match of source.matchAll(KEY_PATTERN)) {
		const candidate = match[2] as string;
		const [namespace] = candidate.split('.');
		if (namespaces.has(namespace)) {
			referencedKeys.add(candidate);
		}
	}
}

describe('server i18n keys exist in the catalog', () => {
	test('da.yaml and en.yaml define the same key sets', () => {
		const daKeys = collectLeafPaths(da);
		const enKeys = collectLeafPaths(en);

		expect(enKeys.filter((key) => !daKeys.includes(key))).toEqual([]);
		expect(daKeys.filter((key) => !enKeys.includes(key))).toEqual([]);
	});

	test('every key referenced from server code exists in both catalogs', () => {
		expect(referencedKeys.size).toBeGreaterThan(0);

		const missing = [...referencedKeys].filter(
			(key) => !leafExists(da, key) || !leafExists(en, key),
		);

		expect(missing).toEqual([]);
	});
});
