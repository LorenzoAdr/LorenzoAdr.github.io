// Pulls the tuide guides from the TIDE repository into src/content/tuide-docs/,
// so the site serves them as web pages at /tuide/docs/<slug>/.
// Run with `npm run docs:tuide` after the docs change upstream, then commit the result.
// Links between published guides become site links; any other relative link points to GitHub.
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

const OWNER_REPO = 'LorenzoAdr/TIDE';
const BRANCH = process.env.TUIDE_BRANCH ?? 'main';
const RAW = `https://raw.githubusercontent.com/${OWNER_REPO}/${BRANCH}`;
const BLOB = `https://github.com/${OWNER_REPO}/blob/${BRANCH}`;
const OUT = new URL('../src/content/tuide-docs/', import.meta.url);

/** Published guides, in reading order. */
export const GUIDES = [
	{ slug: 'user-guide', order: 1, summary: 'Workflows, CLI, languages, IDE and debug modes, troubleshooting.' },
	{ slug: 'keyboard-shortcuts', order: 2, summary: 'Complete key binding reference. F1 opens it inside tuide.' },
	{ slug: 'architecture', order: 3, summary: 'Threads, models, DAP and multi-LSP integration, UI structure.' },
	{ slug: 'development', order: 4, summary: 'Build, project layout and conventions for contributors.' },
	{ slug: 'toolpacks', order: 5, summary: 'Language packs, catalog, CLI and AppImage export.' },
];
const published = new Set(GUIDES.map((g) => g.slug));

function rewriteLink(target) {
	if (/^(https?:|mailto:|#)/.test(target)) return target;
	const [file, hash = ''] = target.split('#');
	const resolved = path.posix.normalize(path.posix.join('docs', file));
	const slug = path.posix.basename(resolved, '.md');
	if (resolved === `docs/${slug}.md` && published.has(slug)) return `/tuide/docs/${slug}/${hash ? `#${hash}` : ''}`;
	if (/\.(png|jpe?g|gif|svg|webp)$/i.test(file)) return `${RAW}/${resolved}`;
	return `${BLOB}/${resolved}${hash ? `#${hash}` : ''}`;
}

function transform(md) {
	const lines = md.split('\n');
	let inFence = false;
	let title = '';
	const out = [];
	for (const line of lines) {
		if (/^\s*```/.test(line)) inFence = !inFence;
		if (!inFence && !title && /^# /.test(line)) { title = line.slice(2).trim(); continue; }
		out.push(inFence ? line : line.replace(/\]\(([^)\s]+)\)/g, (_, t) => `](${rewriteLink(t)})`));
	}
	return { title, body: out.join('\n').replace(/^\s+/, '') };
}

async function commitSha() {
	try {
		const res = await fetch(`https://api.github.com/repos/${OWNER_REPO}/commits?sha=${BRANCH}&path=docs&per_page=1`);
		const [c] = await res.json();
		return { sha: c.sha.slice(0, 7), date: c.commit.committer.date.slice(0, 10) };
	} catch { return { sha: '', date: '' }; }
}

await mkdir(OUT, { recursive: true });
const { sha, date } = await commitSha();
for (const g of GUIDES) {
	const res = await fetch(`${RAW}/docs/${g.slug}.md`);
	if (!res.ok) throw new Error(`${g.slug}: HTTP ${res.status}`);
	const { title, body } = transform(await res.text());
	const front = [
		'---',
		`title: ${JSON.stringify(title)}`,
		`summary: ${JSON.stringify(g.summary)}`,
		`order: ${g.order}`,
		`source: ${JSON.stringify(`${BLOB}/docs/${g.slug}.md`)}`,
		`commit: ${JSON.stringify(sha)}`,
		`updated: ${JSON.stringify(date)}`,
		'---',
		'',
	].join('\n');
	await writeFile(new URL(`${g.slug}.md`, OUT), front + body);
	console.log(`docs/${g.slug}.md -> src/content/tuide-docs/${g.slug}.md (${title})`);
}
