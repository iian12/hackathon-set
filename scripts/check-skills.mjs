import { readdir, readFile } from 'node:fs/promises';
import assert from 'node:assert/strict';
const expected = ['browser-verification', 'csv-data', 'web-implementation'];
assert.deepEqual((await readdir('.agents/skills')).sort(), expected);
for (const name of expected) {
  const text = (await readFile(`.agents/skills/${name}/SKILL.md`, 'utf8')).replace(/^\uFEFF/, '');
  const match = text.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]+)$/);
  assert.ok(match, `${name}: frontmatter and body`);
  assert.match(match[1], new RegExp(`^name: ${name}$`, 'm'));
  assert.match(match[1], /^description: .+$/m);
  assert.doesNotMatch(text, /\[TODO:|TBD|PLACEHOLDER/);
  console.log(`PASS ${name}: name, description, body, no scaffold placeholders`);
}
