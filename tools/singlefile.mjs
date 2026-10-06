// Inlines the Vite build (JS + CSS) into self-contained HTML files:
//  - dist/stumperz.html : a complete document, works offline by double-click
//  - dist/artifact.html : same content without <html>/<head>/<body> wrappers (artifact page contract)
import fs from 'node:fs';
import path from 'node:path';

const dist = path.resolve('dist');
const html = fs.readFileSync(path.join(dist, 'index.html'), 'utf8');
const read = (href) => fs.readFileSync(path.join(dist, href.replace(/^\.?\//, '')), 'utf8');

const cssHref = html.match(/<link rel="stylesheet"[^>]*href="(\.\/assets\/[^"]+\.css)"[^>]*>/)?.[1];
const jsSrc = html.match(/<script type="module"[^>]*src="(\.\/assets\/[^"]+\.js)"[^>]*><\/script>/)?.[1];
if (!cssHref || !jsSrc) throw new Error('assets not found in dist/index.html');
const css = read(cssHref);
const js = read(jsSrc).replace(/<\/script/gi, '<\\/script').replace(/<!--/g, '<\\!--');

const fonts = '<link rel="preconnect" href="https://fonts.googleapis.com">\n<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>\n<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Atkinson+Hyperlegible+Next:wght@400;600;700;800&family=JetBrains+Mono:wght@400;600;700;800&display=swap">';
const title = '<title>StumperZ Piscine C</title>';
const body = `<div id="root"></div>\n<script type="module">${js}</script>`;

const full = `<!doctype html>
<html lang="fr">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
${title}
${fonts}
<style>${css}</style>
</head>
<body>
${body}
</body>
</html>
`;
const artifact = `${title}
${fonts}
<style>${css}</style>
${body}
`;
fs.writeFileSync(path.join(dist, 'stumperz.html'), full);
fs.writeFileSync(path.join(dist, 'artifact.html'), artifact);
console.log('dist/stumperz.html', Math.round(full.length / 1024), 'KiB');
