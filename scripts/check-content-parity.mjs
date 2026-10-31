/**
 * Content parity check (implementation brief §5): the English content
 * collection (`content/pages-en/**`) must cover exactly the same `path`
 * frontmatter values as the Danish collection (`content/pages/**`).
 *
 * The English collection is complete after Phase 4 (content MT); wire this
 * script into CI from that phase onwards — until then it is expected to
 * report the not-yet-translated pages.
 */
import { readdir, readFile } from 'node:fs/promises';
import process from 'node:process';

const pagesDirs = [
	{
		collection: 'pages (da)',
		dir: new URL('../content/pages/', import.meta.url),
	},
	{
		collection: 'pages_en',
		dir: new URL('../content/pages-en/', import.meta.url),
	},
];

const readPaths = async (dir) => {
	const files = (await readdir(dir)).filter((name) => name.endsWith('.md'));
	const paths = await Promise.all(
		files.map(async (name) => {
			const content = await readFile(new URL(name, dir), 'utf8');
			const match = content.match(/^path:\s*'([^']+)'/m);
			return match?.[1];
		}),
	);
	return new Set(paths.filter((path) => path !== undefined));
};

const [danish, english] = await Promise.all(
	pagesDirs.map(({ dir }) => readPaths(dir)),
);

const problems = [];

for (const path of danish.difference(english)) {
	problems.push(`missing English content for ${path}`);
}
for (const path of english.difference(danish)) {
	problems.push(`English content without Danish counterpart: ${path}`);
}

if (problems.length > 0) {
	console.error(`content parity check failed (${problems.length}):`);
	for (const problem of problems) {
		console.error(`  - ${problem}`);
	}
	process.exit(1);
}

console.log('content parity check passed: pages and pages_en match.');
