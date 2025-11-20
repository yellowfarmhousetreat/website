import { spawn } from 'node:child_process';
import { setTimeout as delay } from 'node:timers/promises';
import { writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { chromium } from 'playwright';
import { AxeBuilder } from '@axe-core/playwright';

const SERVER_HOST = '127.0.0.1';
const SERVER_PORT = 4173;
const SERVER_URL = `http://${SERVER_HOST}:${SERVER_PORT}`;
const TARGET_PAGES = [
  { id: 'home', label: 'Home', url: 'index.html' },
  { id: 'menu', label: 'Menu', url: 'menu.html' },
  { id: 'order', label: 'Order', url: 'order.html' }
];

const waitForServer = async (probeUrl, attempts = 25, intervalMs = 400) => {
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      const response = await fetch(probeUrl, { method: 'GET' });
      if (response.ok) return;
    } catch (error) {
      if (attempt === attempts) {
        throw new Error(`Preview server not reachable after ${attempts} attempts: ${error.message}`);
      }
    }
    await delay(intervalMs);
  }
};

const startPreviewServer = () => {
  const previewProcess = spawn('npm', ['run', 'preview', '--', '--host', SERVER_HOST, '--port', String(SERVER_PORT)], {
    stdio: 'inherit',
    shell: false
  });
  return previewProcess;
};

const stopPreviewServer = (previewProcess) => {
  if (!previewProcess) return;
  previewProcess.kill('SIGINT');
};

const runAxeOnPages = async () => {
  await mkdir('reports', { recursive: true });
  const previewProcess = startPreviewServer();
  try {
    await waitForServer(`${SERVER_URL}/index.html`);
    const browser = await chromium.launch();
    try {
      const context = await browser.newContext();
      const summary = [];

      for (const pageMeta of TARGET_PAGES) {
        const page = await context.newPage();
        const targetUrl = `${SERVER_URL}/${pageMeta.url}`;
        await page.goto(targetUrl, { waitUntil: 'networkidle' });

        const axeBuilder = new AxeBuilder({ page })
          .withTags(['wcag2a', 'wcag2aa'])
          .disableRules(['color-contrast-enhanced']);

        const results = await axeBuilder.analyze();
        const reportPath = path.join('reports', `axe-${pageMeta.id}.json`);
        await writeFile(reportPath, JSON.stringify({ targetUrl, ...results }, null, 2), 'utf8');

        summary.push({
          id: pageMeta.id,
          label: pageMeta.label,
          url: targetUrl,
          violations: results.violations.length,
          incomplete: results.incomplete.length,
          passes: results.passes.length,
          reportPath
        });

        console.log(`✔ Completed axe scan for ${pageMeta.label} (${results.violations.length} violations)`);
        await page.close();
      }

      return summary;
    } finally {
      await browser.close();
    }
  } finally {
    stopPreviewServer(previewProcess);
  }
};

const main = async () => {
  try {
    const summary = await runAxeOnPages();
    console.log('\nAccessibility summary:');
    summary.forEach((entry) => {
      console.log(`- ${entry.label}: ${entry.violations} violations, ${entry.incomplete} needs review (${entry.reportPath})`);
    });
    const violations = summary.reduce((acc, item) => acc + item.violations, 0);
    process.exitCode = violations === 0 ? 0 : 1;
  } catch (error) {
    console.error('Accessibility audit failed:', error);
    process.exitCode = 1;
  }
};

main();
