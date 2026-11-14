// Writes the house figure and derived images. Run: npm run figures
import { mkdir, writeFile } from 'node:fs/promises';
import sharp from 'sharp';
import { standaloneFigure, banner, bannerLight, ogCard } from '../src/lib/trim-figure.mjs';

await mkdir('downloads', { recursive: true });
await mkdir('public/figures', { recursive: true });
const png = (svg, file, density) => sharp(Buffer.from(svg), { density }).png().toFile(file);

for (const theme of ['light', 'dark']) {
	const svg = standaloneFigure(theme);
	await writeFile(`downloads/trim-figure-${theme}.svg`, svg);
	await png(svg, `downloads/trim-figure-${theme}.png`, 288);
}
await writeFile('public/figures/trim-figure.svg', standaloneFigure('light'));
await writeFile('downloads/linkedin-banner.svg', banner());
await png(banner(), 'downloads/linkedin-banner.png', 72);
await writeFile('downloads/linkedin-banner-light.svg', bannerLight());
await png(bannerLight(), 'downloads/linkedin-banner-light.png', 144);
await png(bannerLight(), 'downloads/linkedin-banner-light@4x.png', 288);
const clean = bannerLight({ labels: false });
await writeFile('downloads/linkedin-banner-clean.svg', clean);
await png(clean, 'downloads/linkedin-banner-clean.png', 144);
await png(clean, 'downloads/linkedin-banner-clean@4x.png', 288);
await writeFile('public/og-card.svg', ogCard());
await png(ogCard(), 'public/og-card.png', 72);
console.log('figures written');
