// Post-build step: merge every emitted component stylesheet into one
// `dist/index.css`, so the `cancado-win98/styles` subpath is a valid
// "give me everything" sheet. Consumers using per-subpath imports get their
// component-scoped CSS injected automatically and never need this file.
//
// Each entry's CSS inlines the shared base layer (tokens, reset, bevels),
// which is what keeps a single subpath import self-sufficient — but it means
// naive concatenation would repeat that layer once per entry. So we dedupe
// top-level rules as we go: CSS is order-dependent, and the first occurrence
// of a rule is the one that matters, so keeping the first and dropping exact
// repeats is safe.
import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const distDir = new URL('../dist/', import.meta.url).pathname;

/**
 * Split a stylesheet into top-level rules, tracking brace depth so at-rules
 * (`@media`, `@supports`) come back as one block rather than being cut apart.
 */
function splitTopLevelRules(css) {
  const rules = [];
  let depth = 0;
  let start = 0;
  let inString = null;

  for (let i = 0; i < css.length; i += 1) {
    const char = css[i];

    if (inString) {
      if (char === '\\') i += 1;
      else if (char === inString) inString = null;
      continue;
    }

    if (char === '"' || char === "'") {
      inString = char;
    } else if (char === '{') {
      depth += 1;
    } else if (char === '}') {
      depth -= 1;
      if (depth === 0) {
        rules.push(css.slice(start, i + 1).trim());
        start = i + 1;
      }
    } else if (char === ';' && depth === 0) {
      // Statement at-rules: @charset, @import, @layer.
      rules.push(css.slice(start, i + 1).trim());
      start = i + 1;
    }
  }

  const tail = css.slice(start).trim();
  if (tail) rules.push(tail);
  return rules.filter(Boolean);
}

// tokens.css first so component rules can resolve `var(--…)`.
const tokensFirst = (a, b) =>
  a === 'tokens.css' ? -1 : b === 'tokens.css' ? 1 : a.localeCompare(b);

const cssFiles = readdirSync(distDir)
  .filter((name) => name.endsWith('.css') && name !== 'index.css')
  .sort(tokensFirst);

const seen = new Set();
const merged = [];
let duplicates = 0;

for (const file of cssFiles) {
  for (const rule of splitTopLevelRules(readFileSync(join(distDir, file), 'utf8'))) {
    if (seen.has(rule)) {
      duplicates += 1;
      continue;
    }
    seen.add(rule);
    merged.push(rule);
  }
}

const banner = '/* cancado-win98 — full stylesheet (all components). */\n';
const output = `${banner}${merged.join('\n')}\n`;
writeFileSync(join(distDir, 'index.css'), output);

console.log(
  `✓ concat-css → dist/index.css (${cssFiles.length} files, ${merged.length} rules, ` +
    `${duplicates} duplicates dropped, ${(output.length / 1024).toFixed(2)} kB)`,
);
