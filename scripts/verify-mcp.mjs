import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import assert from 'node:assert/strict';

await mkdir('artifacts/mcp', { recursive: true });
const log = [], checks = [];
const client = new Client({ name: 'cofa-mcp-verifier', version: '1.0.0' });
const transport = new StdioClientTransport({ command: process.execPath, args: [resolve('scripts/start-mcp.mjs')], cwd: process.cwd(), stderr: 'pipe' });
const asText = r => r.content?.filter(c => c.type === 'text').map(c => c.text).join('\n') ?? '';
async function call(name, args = {}) {
  const r = await client.callTool({ name, arguments: args });
  const text = asText(r); log.push({ tool: name, arguments: args, isError: !!r.isError, text });
  if (r.isError) throw new Error(`${name}: ${text}`);
  return text;
}
function pass(name) { checks.push({ name, status: 'passed' }); console.log(`PASS ${name}`); }
try {
  await client.connect(transport);
  const tools = await client.listTools();
  await writeFile('artifacts/mcp/tools.json', JSON.stringify(tools, null, 2));
  pass('MCP handshake and tools/list');
  await call('browser_navigate', { url: 'http://localhost:3000' });
  const snapshot = await call('browser_snapshot');
  assert.match(snapshot, /시험 시작 템플릿/); pass('page structure / accessibility snapshot');
  const inputRef = snapshot.match(/textbox "확인할 내용" \[ref=(e\d+)\]/)?.[1];
  const buttonRef = snapshot.match(/button "확인" \[ref=(e\d+)\]/)?.[1];
  assert.ok(inputRef && buttonRef, 'snapshot input/button refs');
  await call('browser_type', { target: inputRef, element: '확인할 내용 입력란', text: 'MCP 연결 완료' });
  await call('browser_click', { target: buttonRef, element: '확인 버튼' });
  assert.match(await call('browser_snapshot'), /확인: MCP 연결 완료/); pass('input and click');
  const http = await fetch('http://localhost:3000/__server_identity').then(r => r.json());
  assert.equal(http.app, 'cofa-exam-kit');
  const identity = await call('browser_evaluate', { function: `async () => { const identity = await fetch('/__server_identity').then(r => r.json()); return { identity, renderedId: document.querySelector('[data-testid="server-id"]').textContent, origin: location.origin }; }` });
  assert.ok(identity.includes(http.serverId));
  // Assert inside the browser as well: UI and endpoint must have the same process ID.
  const matched = await call('browser_evaluate', { function: `async () => { const x = await fetch('/__server_identity').then(r => r.json()); return x.serverId === document.querySelector('[data-testid="server-id"]').textContent && location.origin === 'http://localhost:3000'; }` });
  assert.match(matched, /\btrue\b/); pass('HTTP / browser / UI same server identity');
  await call('browser_take_screenshot', { type: 'png', scale: 'css', filename: 'artifacts/mcp/starter.png', fullPage: true }); pass('screenshot');
  const consoleErrors = await call('browser_console_messages', { level: 'error' });
  assert.match(consoleErrors, /Errors: 0/);
  assert.doesNotMatch(consoleErrors, /\[ERROR\]|Error:|TypeError|ReferenceError|Failed to load/); pass('application console: no errors');
  await call('browser_evaluate', { function: `() => console.error('COFA_EXPECTED_CONSOLE_PROBE')` });
  assert.match(await call('browser_console_messages', { level: 'error' }), /COFA_EXPECTED_CONSOLE_PROBE/);
  pass('console detector positive control (intentional probe, not app failure)');
  await call('browser_close');
  await writeFile('artifacts/mcp/result.json', JSON.stringify({ status: 'passed', identity: http, checks, note: 'Intentional console probe follows the clean application-console check.' }, null, 2));
} catch (err) {
  checks.push({ name: err.message, status: 'failed' });
  await writeFile('artifacts/mcp/result.json', JSON.stringify({ status: 'failed', checks }, null, 2));
  console.error(err); process.exitCode = 1;
} finally {
  await writeFile('artifacts/mcp/transcript.json', JSON.stringify(log, null, 2));
  await client.close();
}
