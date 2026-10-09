import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';
import { expect, test } from 'vitest';

const root = fileURLToPath(new URL('../../', import.meta.url));

test('the form guide examples typecheck with the installed form libraries and Zod', () => {
  const guide = readFileSync(resolve(root, 'docs-web/src/content/docs/getting-started/form-libraries.mdx'), 'utf8');
  const examples = [...guide.matchAll(/^```tsx? title="([^"]+)"\r?\n([\s\S]*?)^```/gm)];
  expect(examples.map((example) => example[1])).toEqual([
    'src/schemas/settingsSchema.ts',
    'src/RHFSettingsForm.tsx',
    'src/UncontrolledForm.tsx',
    'src/TanStackSettingsForm.tsx',
    'src/NativeResetExample.tsx',
  ]);
  const folder = mkdtempSync(resolve(root, 'node_modules/.yarcl-form-docs-'));
  try {
    const files = examples.map(([, name, source]) => {
      const file = resolve(folder, name);
      if (!file.startsWith(`${folder}${sep}`)) throw new Error(`Documentation example path is outside its temporary folder: ${name}`);
      mkdirSync(dirname(file), { recursive: true });
      writeFileSync(file, source);
      return file;
    });
    const program = ts.createProgram(files, {
      target: ts.ScriptTarget.ES2022,
      module: ts.ModuleKind.ESNext,
      moduleResolution: ts.ModuleResolutionKind.Bundler,
      jsx: ts.JsxEmit.ReactJSX,
      strict: true,
      skipLibCheck: true,
      noEmit: true,
      paths: { '@yarcl/config': [resolve(root, 'library/src/yarcl.config.ts')] },
    });
    const diagnostics = ts.getPreEmitDiagnostics(program).map((diagnostic) => {
      const location = diagnostic.file && diagnostic.start !== undefined
        ? `${relative(folder, diagnostic.file.fileName)}:${diagnostic.file.getLineAndCharacterOfPosition(diagnostic.start).line + 1}: `
        : '';
      return `${location}${ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n')}`;
    });
    expect(diagnostics).toEqual([]);
  } finally {
    rmSync(folder, { recursive: true, force: true });
  }
}, 60_000);
