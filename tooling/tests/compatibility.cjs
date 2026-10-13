const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { getRootDirs } = require('../next-eslint/utils/get-root-dirs');
const next = require('../next-eslint');
const { ESLint } = require('eslint');

test('Next root discovery preserves directory-only glob fixtures', () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'dream-lint-'));
  try {
    for (const dir of ['app-a', 'app-b', 'nested/app-c', '.hidden']) fs.mkdirSync(path.join(tmp, dir), { recursive: true });
    fs.writeFileSync(path.join(tmp, 'file'), 'not a directory');
    const run = rootDir => getRootDirs({ cwd: tmp, settings: { next: { rootDir } } });
    assert.deepEqual(getRootDirs({ cwd: tmp, settings: {} }), [tmp]);
    assert.deepEqual(run(tmp), [tmp]);
    assert.deepEqual(run(tmp + '/*').sort(), ['app-a', 'app-b', 'nested'].map(d => path.join(tmp, d)).sort());
    assert.deepEqual(run(tmp + '/**/app-*').sort(), ['app-a', 'app-b', 'nested/app-c'].map(d => path.join(tmp, d)).sort());
    assert.deepEqual(run(tmp + '/{app-a,app-b}').sort(), ['app-a', 'app-b'].map(d => path.join(tmp, d)).sort());
    assert.deepEqual(run(tmp + '/.hidden'), [path.join(tmp, '.hidden')]);
    assert.deepEqual(run(tmp + '/missing'), []);
    assert.deepEqual(run([tmp + '/app-a', tmp + '/app-b']), [path.join(tmp, 'app-a'), path.join(tmp, 'app-b')]);
  } finally { fs.rmSync(tmp, { recursive: true, force: true }); }
});

test('all upstream Next rules remain enabled at original severity', () => {
  assert.equal(Object.keys(next.rules).length, 21);
  for (const name of Object.keys(next.rules)) assert.ok(next.configs.recommended.rules['@next/next/' + name]);
  assert.equal(next.flatConfig.coreWebVitals.rules['@next/next/no-html-link-for-pages'], 'error');
  assert.equal(next.flatConfig.coreWebVitals.rules['@next/next/no-sync-scripts'], 'error');
});

test('modern ESLint still rejects unsafe framework and style fixtures', async () => {
  const eslint = new ESLint();
  const [result] = await eslint.lintText('export default function Page() { var unused = 1; return <script src="/bad.js"></script> }', { filePath: 'pages/lint-fixture.jsx' });
  const ids = result.messages.map(m => m.ruleId);
  for (const rule of ['no-var', 'no-unused-vars', '@stylistic/semi', '@next/next/no-sync-scripts']) assert.ok(ids.includes(rule), rule);
});

test('supported YAML loader preserves actual NYC YAML and JSON config results', async () => {
  const { loadNycConfig } = require('@istanbuljs/load-nyc-config');
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'dream-nyc-'));
  try {
    fs.writeFileSync(path.join(tmp, 'package.json'), '{}');
    fs.writeFileSync(path.join(tmp, '.nycrc.yml'), 'all: true\ncheck-coverage: false\ninclude:\n  - pages/**/*.js\n  - lib/**/*.js\nexclude:\n  - pages/_app.js\nextension:\n  - .js\n');
    const yaml = await loadNycConfig({ cwd: tmp });
    fs.unlinkSync(path.join(tmp, '.nycrc.yml'));
    fs.writeFileSync(path.join(tmp, '.nycrc.json'), JSON.stringify({ all: true, 'check-coverage': false, include: ['pages/**/*.js', 'lib/**/*.js'], exclude: ['pages/_app.js'], extension: ['.js'] }));
    const json = await loadNycConfig({ cwd: tmp });
    assert.deepEqual(yaml, json);
  } finally { fs.rmSync(tmp, { recursive: true, force: true }); }
});

test('every upstream rule and configuration source is retained byte-for-byte', () => {
  const { createHash } = require('node:crypto');
  const hashes = require('../next-eslint/upstream-sha256.json');
  for (const [file, hash] of Object.entries(hashes)) {
    if (file === 'utils/get-root-dirs.js') continue; // The documented native-glob maintenance patch.
    const bytes = fs.readFileSync(path.join(__dirname, '../next-eslint', file));
    assert.equal(createHash('sha256').update(bytes).digest('hex'), hash, file);
  }
});
