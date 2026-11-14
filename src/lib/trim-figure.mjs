// House figure: level-flight trim, flight points against a model.
// All data is synthetic: textbook-shaped curves plus seeded Gaussian noise. Nothing here comes from a real aircraft or test campaign.

function rng(s) {
	return () => {
		s |= 0; s = (s + 0x6d2b79f5) | 0;
		let t = Math.imul(s ^ (s >>> 15), 1 | s);
		t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
		return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
	};
}
const gauss = (r) => Math.sqrt(-2 * Math.log(r() + 1e-9)) * Math.cos(6.2832 * r());
const CLUSTERS = [2, 30, 55, 70, 85, 100, 120];
const speed = (r) => Math.max(0, Math.min(140, CLUSTERS[Math.floor(r() * CLUSTERS.length)] + gauss(r) * 9));

export const PANELS = [
	{ title: 'Collective', unit: 'deg', range: [2, 14], sigma: 0.35, seed: 31,
		flight: (v) => 6 + 3.4 * ((v - 62) / 62) ** 2, model: (v) => 5.7 + 3.9 * ((v - 58) / 62) ** 2 },
	{ title: 'Longitudinal cyclic', unit: 'deg', range: [-9, 3], sigma: 0.4, seed: 48,
		flight: (v) => 1 - 0.058 * v, model: (v) => 1.4 - 0.064 * v },
	{ title: 'Lateral cyclic', unit: 'deg', range: [-2, 4], sigma: 0.28, seed: 65,
		flight: (v) => 0.3 + 1.9 * Math.exp(-((v - 26) ** 2) / 520), model: (v) => 0.1 + 2.3 * Math.exp(-((v - 22) ** 2) / 480) },
	{ title: 'Pedal', unit: 'deg', range: [-4, 12], sigma: 0.5, seed: 82,
		flight: (v) => 1 + 7 * Math.exp(-v / 35) + 2.2e-6 * v ** 3, model: (v) => 0.4 + 8 * Math.exp(-v / 31) + 2.6e-6 * v ** 3 },
];

export const PANEL_W = 240;
export const PANEL_H = 170;
const f1 = (n) => n.toFixed(1);

/** Inner SVG markup of one cloud. `bare` drops frame, grid and labels (used for banners). */
export function cloud(p, { w = PANEL_W, h = PANEL_H, pad = { l: 30, r: 6, t: 22, b: 20 }, n = 180, radius = 1.7, bare = false } = {}) {
	const r = rng(p.seed);
	const x0 = pad.l, x1 = w - pad.r, y0 = pad.t, y1 = h - pad.b;
	const X = (v) => x0 + ((x1 - x0) * v) / 140;
	const Y = (v) => y1 - ((y1 - y0) * (v - p.range[0])) / (p.range[1] - p.range[0]);
	let s = '';
	if (!bare) {
		s += `<rect class="fg-frame" x="${x0}" y="${y0}" width="${x1 - x0}" height="${y1 - y0}"/>`;
		for (const v of [40, 80, 120]) s += `<path class="fg-grid" d="M${f1(X(v))} ${y0}V${y1}"/><text class="fg-tick" text-anchor="middle" x="${f1(X(v))}" y="${y1 + 10}">${v}</text>`;
		for (let k = 1; k < 4; k++) s += `<path class="fg-grid" d="M${x0} ${f1(y0 + ((y1 - y0) * k) / 4)}H${x1}"/>`;
		s += `<text class="fg-title" x="${x0}" y="14">${p.title}</text><text class="fg-tick" text-anchor="end" x="${x0 - 4}" y="${y0 + 8}">${p.unit}</text><text class="fg-tick" text-anchor="end" x="${x1}" y="${h - 2}">IAS [kt]</text>`;
	}
	let a = '', b = '';
	for (let i = 0; i < n; i++) {
		const v = speed(r), sg = p.sigma * (1 + 0.9 * Math.exp(-v / 30));
		a += `<circle class="fg-flight" cx="${f1(X(v))}" cy="${f1(Y(p.flight(v) + gauss(r) * sg))}" r="${radius}"/>`;
		b += `<circle class="fg-model" cx="${f1(X(v))}" cy="${f1(Y(p.model(v) + gauss(r) * sg * 0.3))}" r="${radius}"/>`;
	}
	const line = (fn) => { const pts = []; for (let v = 0; v <= 140; v += 4) pts.push(`${f1(X(v))},${f1(Y(fn(v)))}`); return pts.join(' '); };
	return `${s}${a}${b}<polyline class="fg-flight-line" points="${line(p.flight)}"/><polyline class="fg-model-line" points="${line(p.model)}"/>`;
}

export const THEMES = {
	light: { sheet: '#F9FAFB', ink: '#101C2B', ink2: '#4B5969', rule: '#B7C1CB', trace: '#A8156F' },
	dark: { sheet: '#111B26', ink: '#E3E9EF', ink2: '#94A2B1', rule: '#2D3B4A', trace: '#F062B6' },
};
const MONO = `'IBM Plex Mono', Menlo, Consolas, monospace`;

function css(t, scale = 1) {
	return `.fg-frame{fill:none;stroke:${t.rule};stroke-width:1}.fg-grid{fill:none;stroke:${t.rule};stroke-width:.6;stroke-dasharray:2 3}` +
		`.fg-flight{fill:${t.ink};opacity:.72}.fg-model{fill:${t.trace};opacity:.85}` +
		`.fg-flight-line{fill:none;stroke:${t.ink};stroke-width:${1.3 * scale};stroke-dasharray:${5 * scale} ${3 * scale}}.fg-model-line{fill:none;stroke:${t.trace};stroke-width:${1.8 * scale}}` +
		`.fg-title{fill:${t.ink};font:500 11px ${MONO}}.fg-tick{fill:${t.ink2};font:8.5px ${MONO}}.fg-cap{fill:${t.ink2};font:9.5px ${MONO}}`;
}

/** Self-contained 2×2 figure with legend, for download. */
export function standaloneFigure(theme = 'light') {
	const t = THEMES[theme], m = 18, gap = 14, W = m * 2 + PANEL_W * 2 + gap, H = m * 2 + PANEL_H * 2 + gap + 26;
	let g = '';
	PANELS.forEach((p, i) => { g += `<g transform="translate(${m + (i % 2) * (PANEL_W + gap)} ${m + Math.floor(i / 2) * (PANEL_H + gap)})">${cloud(p)}</g>`; });
	const ly = H - m - 2;
	g += `<circle class="fg-flight" cx="${m + 34}" cy="${ly - 3}" r="3"/><text class="fg-cap" x="${m + 42}" y="${ly}">flight test points</text>` +
		`<circle class="fg-model" cx="${m + 174}" cy="${ly - 3}" r="3"/><text class="fg-cap" x="${m + 182}" y="${ly}">model, trimmed at each point</text>` +
		`<text class="fg-cap" text-anchor="end" x="${W - m}" y="${ly}">synthetic data</text>`;
	return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}"><style>${css(t)}</style><rect width="${W}" height="${H}" fill="${t.sheet}"/>${g}</svg>`;
}

/** LinkedIn banner, 1584×396, graphic only (the profile photo and name cover any text). */
export function banner() {
	const W = 1584, H = 396, t = { ...THEMES.dark, sheet: '#101C2B' };
	const inner = cloud(PANELS[0], { w: W, h: H, pad: { l: 0, r: 0, t: 44, b: 34 }, n: 420, radius: 3.2, bare: true });
	return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}"><style>${css(t, 1.6)}</style><rect width="${W}" height="${H}" fill="${t.sheet}"/>${inner}</svg>`;
}

/** Social card, 1200×630. */
export function ogCard() {
	const W = 1200, H = 630, t = THEMES.light, D = `'Barlow Condensed', 'Helvetica Neue', 'Arial Narrow', Arial, sans-serif`;
	const inner = cloud(PANELS[0], { w: 1080, h: 300, pad: { l: 0, r: 0, t: 10, b: 10 }, n: 320, radius: 3, bare: true });
	return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}"><style>${css(t, 1.5)}</style><rect width="${W}" height="${H}" fill="#EDF0F2"/>` +
		`<rect x="40" y="40" width="1120" height="550" fill="${t.sheet}" stroke="${t.rule}"/>` +
		`<text x="60" y="150" fill="${t.ink}" style="font:700 84px ${D};letter-spacing:1px">LORENZO ARIAS DEL REAL</text>` +
		`<text x="62" y="196" fill="${t.ink2}" style="font:500 24px ${MONO}">Senior Flight Simulation Engineer · Real-time C++</text>` +
		`<g transform="translate(60 250)">${inner}</g></svg>`;
}
