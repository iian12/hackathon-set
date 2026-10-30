import { createServer } from 'node:net';
import { spawn } from 'node:child_process';
import assert from 'node:assert/strict';
const blocker = createServer();
await new Promise((resolve, reject) => { blocker.once('error', reject); blocker.listen(3000, '0.0.0.0', resolve); });
try {
  const child = spawn(process.execPath, ['node_modules/vite/bin/vite.js'], { windowsHide: true });
  let output = '';
  child.stdout.on('data', x => output += x); child.stderr.on('data', x => output += x);
  const timeout = setTimeout(() => child.kill(), 10000);
  const code = await new Promise((resolve, reject) => { child.on('error', reject); child.on('exit', resolve); });
  clearTimeout(timeout);
  assert.notEqual(code, 0); assert.match(output, /Port 3000 is already in use/); assert.doesNotMatch(output, /Local:.*3001/);
  console.log('PASS occupied 0.0.0.0:3000 => Vite exits nonzero; no port fallback');
} finally { await new Promise(resolve => blocker.close(resolve)); }
