# LorenzoAdr.github.io

Personal site of Lorenzo Arias del Real and source of the design system shared with the project pages. Astro, static output, deployed to the root of [lorenzoadr.github.io](https://lorenzoadr.github.io) by GitHub Actions on push to `main`.

## Develop

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

## Structure

- `public/ui/tokens.css`: colour and type tokens. Project pages in other repos link this file from the same domain.
- `src/styles/global.css`: base styles and components (site bar, section block, rows, figures).
- `src/layouts/BaseLayout.astro`: page shell. Pass `crumb` on project pages.
- `src/lib/trim-figure.mjs`: the house figure. All data is synthetic, generated from formulas and a fixed seed.
- `src/pages/index.astro`: profile, experience, projects, contact. Contact links are constants at the top.

## Figures

```bash
npm run figures
```

Writes the figure as SVG and PNG, light and dark, plus the LinkedIn banner to `downloads/`, and the social card to `public/`.

## Design rules

One accent colour, used for the model trace and the active state only. Square corners, hairlines, no shadows, no gradients, no entrance animations. Left-aligned with a margin column for labels and dates. Figures carry a numbered caption and state that their data is synthetic.
