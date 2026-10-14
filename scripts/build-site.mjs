import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { build } from 'vite';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const frontend = path.join(root, '.sites-runtime', 'frontend-build');
const output = path.join(root, 'dist');
// Both generated output paths must remain inside this checkout before cleaning.
for (const target of [frontend, output]) {
  const relative = path.relative(root, target);
  if (relative.startsWith('..') || path.isAbsolute(relative)) throw new Error('Build output outside project');
}
await build({ root, build: { outDir: frontend, emptyOutDir: true } });
const types = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.png': 'image/png', '.svg': 'image/svg+xml', '.jpg': 'image/jpeg', '.ico': 'image/x-icon' };
const resources = {};
function collect(directory) {
  for (const item of fs.readdirSync(directory, { withFileTypes: true })) {
    const filename = path.join(directory, item.name);
    if (item.isDirectory()) collect(filename);
    else if (item.isFile()) resources['/' + path.relative(frontend, filename).split(path.sep).join('/')] = { type: types[path.extname(filename)] || 'application/octet-stream', content: fs.readFileSync(filename).toString('base64') };
    else throw new Error('Unsupported build asset');
  }
}
collect(frontend);
fs.writeFileSync(path.join(root, '.sites-runtime', 'site-resources.js'), `export default ${JSON.stringify(resources)};\n`);
fs.rmSync(output, { recursive: true, force: true });
await build({ root, configFile: false, build: { ssr: path.join(root, 'worker', 'index.js'), outDir: path.join(output, 'server'), emptyOutDir: true, minify: true, target: 'es2022', rollupOptions: { output: { entryFileNames: 'index.js' } } } });
fs.mkdirSync(path.join(output, '.openai'), { recursive: true });
fs.copyFileSync(path.join(root, '.openai', 'hosting.json'), path.join(output, '.openai', 'hosting.json'));
console.log(`Packaged ${Object.keys(resources).length} frontend assets in the Worker.`);
