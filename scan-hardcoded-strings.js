// scan-hardcoded-strings.cjs
// Usage: node scan-hardcoded-strings.cjs

const fs = require('fs');
const path = require('path');

const ROOT_DIR = process.cwd();
const IGNORED_DIRS = ['node_modules', 'locales', '.git'];
const EXTS = ['.js', '.ejs'];
const results = [];

function walk(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const full = path.join(dir, file);
    const stat = fs.statSync(full);

    if (stat.isDirectory()) {
      const folderName = path.basename(full);
      if (IGNORED_DIRS.includes(folderName)) continue;
      walk(full);
    } else if (EXTS.includes(path.extname(full))) {
      scanFile(full);
    }
  }
}

function scanFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');

  lines.forEach((line, index) => {
    // Skip comments
    if (line.trim().startsWith('//') || line.trim().startsWith('/*')) return;

    // Match string literals not inside __(), __('...'), etc.
    const regex = /(?<!__\(|__\()[`'"]([^`'"]{2,})[`'"]/g;
    let match;
    while ((match = regex.exec(line)) !== null) {
      const str = match[1];

      // Skip if only letters/numbers (likely variable or class name)
      if (/^[\w\-]+$/.test(str)) continue;

      results.push({
        file: filePath,
        line: index + 1,
        text: str,
        preview: line.trim()
      });
    }
  });
}

walk(ROOT_DIR);

// Print results
console.log(`\n📦 Found ${results.length} hardcoded string(s):\n`);
results.forEach(r => {
  console.log(`🔸 ${r.file}:${r.line}\n    → ${r.text}\n    ↪ ${r.preview}\n`);
});
