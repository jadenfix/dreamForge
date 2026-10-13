const { chromium } = require('playwright');
const { spawn } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const port = Number(process.env.PORT || 3152);
const root = path.resolve(__dirname, '../..');
const base = `http://127.0.0.1:${port}`;
const output = path.join(root, 'artifacts/browser');
fs.mkdirSync(output, { recursive: true });
(async () => {
  let browser, server;
  try {
    server = spawn(process.execPath, ['node_modules/next/dist/bin/next', 'start', '--hostname', '127.0.0.1', '--port', String(port)], { cwd: root, stdio: ['ignore', 'pipe', 'pipe'], env: { ...process.env, MONGODB_URI: '', ANTHROPIC_API_KEY: '', MOONDREAM_KEY: '' } });
    let logs = ''; server.stdout.on('data', d => logs += d); server.stderr.on('data', d => logs += d);
    let ready = false;
    for (let i = 0; i < 100; i++) { try { if ((await fetch(base)).ok) { ready = true; break; } } catch {} await new Promise(r => setTimeout(r, 200)); }
    assert.ok(ready, logs);
    browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || undefined, args: ['--no-sandbox', '--disable-dev-shm-usage'] });
    const receipt = [];
    for (const width of [1440, 390]) {
      const page = await browser.newPage({ viewport: { width, height: 900 }, acceptDownloads: true });
      const errors = []; page.on('pageerror', e => errors.push(e.message));
      for (const route of ['/', '/usage']) {
        const res = await page.goto(base + route); assert.equal(res.status(), 200);
        if (route === '/usage') await page.getByText('Demo analytics: sample records').waitFor();
        assert.ok((await page.locator('body').innerText()).length > 100);
        assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 2), false);
        assert.equal(await page.locator('body').evaluate(el => getComputedStyle(el).backgroundColor === 'rgba(0, 0, 0, 0)'), false, 'body theme must compile');
        await page.screenshot({ path: path.join(output, `${route === '/' ? 'home' : 'usage'}-${width}.png`), fullPage: true });
        receipt.push({ width, route, status: 200, overflow: false });
      }
      const api = await (await page.request.get(base + '/api/usage?timeRange=7')).json();
      assert.equal(api.success, true); assert.equal(api.metadata.dataSource, 'fallback');
      const request = page.waitForResponse(r => r.url().includes('/api/usage?timeRange=1') && r.status() === 200);
      await page.getByRole('button', { name: '24H', exact: true }).click(); await request;
      await page.getByText('Last 24 Hours', { exact: true }).first().waitFor();
      const download = page.waitForEvent('download');
      await page.getByRole('button', { name: /Export Data/ }).click();
      const file = await download; const exported = JSON.parse(fs.readFileSync(await file.path(), 'utf8'));
      assert.equal(exported.dashboard, 'DreamForge Analytics'); assert.equal(exported.metadata.dataSource, 'fallback');
      const search = page.getByPlaceholder('Search activities...');
      await search.fill('no-record-matches-this-search');
      await page.getByText('No activities found', { exact: true }).waitFor();
      await search.fill('');
      await page.getByTitle('View Details').first().click();
      await page.getByRole('dialog', { name: 'Activity details' }).waitFor();
      await page.getByRole('button', { name: 'Close', exact: true }).click();
      assert.equal(await page.getByRole('dialog').count(), 0);
      assert.deepEqual(errors, []);
      receipt.push({ width, controls: ['realHTTP range', 'JSON export provenance', 'empty search', 'record details'], errors });
      await page.close();
    }
    fs.writeFileSync(path.join(output, 'receipt.json'), JSON.stringify({ pass: true, scope: 'real local HTTP and explicitly labelled fallback analytics; no hosted vision-provider claims', results: receipt }, null, 2));
    console.log(JSON.stringify({ pass: true, results: receipt }));
  } finally { if (browser) await browser.close(); if (server) server.kill(); }
})().catch(e => { console.error(e); process.exitCode = 1; });
