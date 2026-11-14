// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// GitHub Pages user site (username.github.io) → contenido en la raíz del dominio.
// Despliega el contenido de `dist/` a la rama `main` (o `gh-pages`) del repo LorenzoAdr.github.io.
export default defineConfig({
	site: 'https://lorenzoadr.github.io',
	base: '/',
	integrations: [sitemap()],
	output: 'static',
	// Documentation is styled as a plain engineering document: no syntax colouring.
	markdown: { syntaxHighlight: false },
	build: {
		inlineStylesheets: 'always',
	},
});
