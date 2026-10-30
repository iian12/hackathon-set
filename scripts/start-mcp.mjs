import { createRequire } from 'node:module';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawn } from 'node:child_process';
import { chromium } from '@playwright/test';

const require = createRequire(import.meta.url);
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const cli = join(dirname(require.resolve('@playwright/mcp/package.json')), 'cli.js');
// Resolve the SAME headless executable used by the repeatable tests through a public API.
// chromium.executablePath() points to full Chrome, which fails to spawn on this Windows host.
// The short probe closes before MCP starts; no internal registry paths or machine paths are saved.
const probe = await chromium.launchServer({ headless: true });
const executablePath = probe.process().spawnfile;
await probe.close();
const child = spawn(process.execPath, [cli, '--headless', '--isolated', '--browser', 'chrome', '--executable-path', executablePath, '--output-dir', join(root, 'artifacts', 'mcp'), ...process.argv.slice(2)], { cwd: root, stdio: 'inherit', windowsHide: true });
child.on('error', err => { console.error(err.message); process.exitCode = 1; });
child.on('exit', code => { process.exitCode = code ?? 1; });
for (const signal of ['SIGINT', 'SIGTERM']) process.on(signal, () => child.kill(signal));
