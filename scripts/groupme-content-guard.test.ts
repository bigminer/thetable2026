import { afterEach, test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, rmSync, symlinkSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { execFileSync, spawnSync } from 'node:child_process';

const guard = join(process.cwd(), 'scripts/check-groupme-content.mjs');
const repos: string[] = [];
const basePage = `---\nexport const prerender = true;\n---\n<main><h1>The Table</h1><p>“Almost affirming” wasn’t enough.</p></main>\n<style>p { color: red }</style>\n`;
const dataPage = `---\nconst values = [\n  { name: 'Thoughtful', body: 'We mean — even when it is harder.' },\n];\nconst ways = [\n  { label: 'Our Story', href: '/our-story/' },\n];\n---\n<main><h1>{values[0].name}</h1><p>{values[0].body}</p><a href={ways[0].href}>{ways[0].label}</a></main>\n`;

function repo(page = basePage) {
  const dir = mkdtempSync(join(tmpdir(), 'groupme-content-guard-'));
  repos.push(dir);
  execFileSync('git', ['init', '-q', '-b', 'main'], { cwd: dir });
  execFileSync('git', ['config', 'user.name', 'Test'], { cwd: dir });
  execFileSync('git', ['config', 'user.email', 'test@example.invalid'], { cwd: dir });
  mkdirSync(join(dir, 'src/pages'), { recursive: true });
  mkdirSync(join(dir, 'src/content/messages'), { recursive: true });
  writeFileSync(join(dir, 'src/pages/index.astro'), page);
  writeFileSync(join(dir, 'src/pages/ask.astro'), '<h1>Ask</h1>\n');
  writeFileSync(join(dir, 'src/content/messages/example.md'), '---\ntitle: Example\n---\nBody.\n');
  execFileSync('git', ['add', '.'], { cwd: dir });
  execFileSync('git', ['commit', '-qm', 'base'], { cwd: dir });
  return { dir, base: execFileSync('git', ['rev-parse', 'HEAD'], { cwd: dir, encoding: 'utf8' }).trim() };
}

function run(dir: string, base: string) {
  return spawnSync(process.execPath, [guard, base], { cwd: dir, encoding: 'utf8' });
}
function commitChange(dir: string, file: string, content: string) {
  writeFileSync(join(dir, file), content);
  execFileSync('git', ['add', file], { cwd: dir });
  execFileSync('git', ['commit', '-qm', 'change'], { cwd: dir });
}
afterEach(() => { for (const dir of repos.splice(0)) rmSync(dir, { recursive: true, force: true }); });

test('allows visible text-only changes on an existing page', () => {
  const { dir, base } = repo();
  commitChange(dir, 'src/pages/index.astro', basePage.replace('“Almost affirming” wasn’t enough.', 'Almost affirming wasn’t enough.'));
  assert.equal(run(dir, base).status, 0);
});

test('allows plain-string visible copy edits in the homepage values and ways arrays', () => {
  const { dir, base } = repo(dataPage);
  commitChange(dir, 'src/pages/index.astro', dataPage
    .replace('Thoughtful', 'Thoughtful and kind')
    .replace('We mean — even when it is harder.', 'We mean, even when it is harder.')
    .replace('Our Story', 'Our Story at The Table'));
  assert.equal(run(dir, base).status, 0);
});

test('rejects functional or structural changes beside homepage copy fields', () => {
  const edits = [
    dataPage.replace("href: '/our-story/'", "href: '/giving/'"),
    dataPage.replace("{ name: 'Thoughtful', body:", "{ name: 'Thoughtful', disabled: true, body:"),
    dataPage.replace('const values = [', "const note = 'old copy';\nconst values = [")
      .replace("const ways = [", "const note = 'new copy';\nconst ways = ["),
    dataPage.replace('const values = [', 'const values = getValues(['),
    dataPage.replace("export const prerender = true;", "export const prerender = false;").replace('const values', 'export const values'),
  ];
  for (const edited of edits) {
    const { dir, base } = repo(dataPage);
    commitChange(dir, 'src/pages/index.astro', edited);
    assert.notEqual(run(dir, base).status, 0);
  }
});

test('allows markdown content updates', () => {
  const { dir, base } = repo();
  commitChange(dir, 'src/content/messages/example.md', '---\ntitle: Example\n---\nUpdated body.\n');
  assert.equal(run(dir, base).status, 0);
});

test('rejects executable HTML in markdown and symlinked content', () => {
  for (const edit of [
    (dir: string) => writeFileSync(join(dir, 'src/content/messages/example.md'), '<img src=x onerror=alert(1)>'),
    (dir: string) => {
      rmSync(join(dir, 'src/content/messages/example.md'));
      symlinkSync('/etc/passwd', join(dir, 'src/content/messages/example.md'));
    },
  ]) {
    const { dir, base } = repo();
    edit(dir);
    execFileSync('git', ['add', '-A'], { cwd: dir });
    execFileSync('git', ['commit', '-qm', 'change'], { cwd: dir });
    assert.notEqual(run(dir, base).status, 0);
  }
});

test('rejects changes to /ask', () => {
  const { dir, base } = repo();
  commitChange(dir, 'src/pages/ask.astro', '<h1>Changed</h1>\n');
  assert.notEqual(run(dir, base).status, 0);
});

test('rejects markup, frontmatter, style, and script changes', () => {
  for (const [before, after] of [
    [basePage, basePage.replace('<h1>', '<h2>')],
    [basePage, basePage.replace('prerender = true', 'prerender = false')],
    [basePage, basePage.replace('color: red', 'color: blue')],
    [basePage, `${basePage}<script>window.x = 1</script>`],
  ]) {
    const { dir, base } = repo();
    commitChange(dir, 'src/pages/index.astro', after);
    assert.notEqual(run(dir, base).status, 0, before.slice(0, 10));
  }
});

test('rejects functional files, new routes, and deletions', () => {
  for (const action of [
    (dir: string) => writeFileSync(join(dir, 'src/pages/new-route.astro'), '<h1>New</h1>'),
    (dir: string) => writeFileSync(join(dir, 'src/pages/api.ts'), 'export const POST = () => new Response();'),
    (dir: string) => rmSync(join(dir, 'src/pages/index.astro')),
  ]) {
    const { dir, base } = repo();
    action(dir);
    execFileSync('git', ['add', '-A'], { cwd: dir });
    execFileSync('git', ['commit', '-qm', 'change'], { cwd: dir });
    assert.notEqual(run(dir, base).status, 0);
  }
});
