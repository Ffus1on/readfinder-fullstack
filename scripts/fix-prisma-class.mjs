import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const generatedDir = join(
  dirname(fileURLToPath(import.meta.url)),
  '..',
  'src',
  'generated',
  'prisma-class',
);

for (const file of readdirSync(generatedDir)) {
  if (!file.endsWith('.ts')) continue;
  const fullPath = join(generatedDir, file);
  const content = readFileSync(fullPath, 'utf8');
  const fixed = content.replace(
    /:\s*number\s*=\s*new Date\('([^']+)'\)/g,
    ': number = $1',
  );
  if (fixed !== content) {
    writeFileSync(fullPath, fixed);
    console.log(`[fix-prisma-class] patched ${file}`);
  }
}
