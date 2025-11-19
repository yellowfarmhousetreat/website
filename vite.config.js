import { defineConfig } from 'vite';
import { resolve } from 'node:path';
import { existsSync, readdirSync } from 'node:fs';

/**
 * Collect HTML entry files so Rollup can generate each page.
 * Keeping the list dynamic prevents drift as new pages are added.
 */
const getHtmlEntries = (directories) => {
  const projectRoot = __dirname;
  const entries = {};

  directories.forEach((dir) => {
    const absoluteDir = resolve(projectRoot, dir);

    if (!existsSync(absoluteDir)) {
      return;
    }

    readdirSync(absoluteDir, { withFileTypes: true })
      .filter((entry) => entry.isFile() && entry.name.endsWith('.html'))
      .forEach((entry) => {
        const relativePath = dir === '.' ? entry.name : `${dir}/${entry.name}`;
        const entryName = relativePath.replace(/\.html$/, '');
        entries[entryName] = resolve(absoluteDir, entry.name);
      });
  });

  return entries;
};

const htmlEntries = getHtmlEntries(['.', 'admin']);

export default defineConfig({
  root: __dirname,
  publicDir: 'public',
  server: {
    host: true,
    port: 5173,
  },
  preview: {
    host: true,
    port: 4173,
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      input: htmlEntries,
    },
  },
});
