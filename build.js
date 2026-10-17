// Compila la página para publicarla en dist/:
// junta los JS de index.html (en el mismo orden) en un solo archivo comprimido, hace lo mismo con el CSS,
// les pone un nombre con la huella del contenido (así el navegador los guarda hasta que cambian) y copia el resto.
// En la compu se sigue trabajando con los archivos sueltos; esto lo corre GitHub al publicar (ver .github/workflows).
'use strict';
const fs = require('fs'), path = require('path'), crypto = require('crypto'), esbuild = require('esbuild');

const ROOT = __dirname, OUT = path.join(ROOT, 'dist');
const read = f => fs.readFileSync(path.join(ROOT, f), 'utf8');
const huella = s => crypto.createHash('sha256').update(s).digest('hex').slice(0, 10);

let html = read('index.html');

// Scripts en el orden en que los carga index.html
const tags = [...html.matchAll(/<script defer src="(js\/[^"?]+)(?:\?[^"]*)?"><\/script>\n?/g)];
if (!tags.length) throw new Error('No encontré los <script> en index.html');
const js = esbuild.transformSync(tags.map(t => read(t[1])).join(';\n'), { minify: true, target: 'es2017', charset: 'utf8', legalComments: 'none' }).code;
const jsName = 'app.' + huella(js) + '.js';

// Estilos
const cssTag = html.match(/<link rel="stylesheet" href="(css\/[^"?]+)(?:\?[^"]*)?">/);
if (!cssTag) throw new Error('No encontré el <link> del CSS en index.html');
const css = esbuild.transformSync(read(cssTag[1]), { loader: 'css', minify: true, charset: 'utf8' }).code;
const cssName = 'estilos.' + huella(css) + '.css';

// index.html apuntando a los archivos compilados
tags.forEach((t, i) => { html = html.replace(t[0], i === 0 ? '<script defer src="' + jsName + '"></script>\n' : ''); });
html = html.replace(cssTag[0], '<link rel="stylesheet" href="' + cssName + '">');

fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(OUT);
fs.writeFileSync(path.join(OUT, jsName), js);
fs.writeFileSync(path.join(OUT, cssName), css);
fs.writeFileSync(path.join(OUT, 'index.html'), html);
['404.html', 'favicon.svg', '.nojekyll'].forEach(f => { if (fs.existsSync(path.join(ROOT, f))) fs.copyFileSync(path.join(ROOT, f), path.join(OUT, f)); });

console.log('Listo: dist/' + jsName + ' (' + (js.length / 1024).toFixed(1) + ' KB) y dist/' + cssName + ' (' + (css.length / 1024).toFixed(1) + ' KB)');
