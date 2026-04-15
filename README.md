# LorenzoAdr.github.io

Landing principal (nave nodriza) en Astro + Tailwind v4. Se despliega en la **raíz** de [lorenzoadr.github.io](https://lorenzoadr.github.io) (`base: '/'`).

## Desarrollo

```bash
cd LorenzoAdr.github.io
npm install
npm run dev
```

## Build

```bash
npm run build
```

Salida en `dist/`.

## Enlaces a editar

En `src/pages/index.astro`, ajusta las constantes `LINKEDIN_URL` y `EMAIL_HREF` (o el bloque de contacto) a tus URLs reales.

## GitHub Pages (repo `username.github.io`)

1. En el repo **LorenzoAdr.github.io**, Settings → Pages → Build: **GitHub Actions** (recomendado) o sube el contenido de `dist/` a la rama que Pages use como raíz.
2. Si usas Actions, un workflow típico hace `npm ci && npm run build` y publica `dist/` con `actions/upload-pages-artifact` + `deploy-pages`.

El proyecto **VarMonitor** enlazado por defecto a `https://lorenzoadr.github.io/RealTimeMonitor/` (mismo usuario, repo de proyecto).
