// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

// GitHub Pages user site (username.github.io) → contenido en la raíz del dominio.
// Despliega el contenido de `dist/` a la rama `main` (o `gh-pages`) del repo LorenzoAdr.github.io.
export default defineConfig({
	site: 'https://lorenzoadr.github.io',
	base: '/',
	output: 'static',
	build: {
		inlineStylesheets: 'always',
	},
	vite: {
		plugins: [tailwindcss()],
	},
});
