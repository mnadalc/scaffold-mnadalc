import { promises as fs } from 'node:fs';
import path from 'node:path';
import type { Answers, BaseFolder, FrontendGroup } from '../types.js';

export type DependencyBuckets = {
  dependencies: Record<string, string>;
  devDependencies: Record<string, string>;
};

export type StarterContext = {
  resourceSingular: string;
  resourcePlural: string;
  resourcePath: string;
  typeName: string;
  typeFileBase: string;
  schemaName: string;
  arraySchemaName: string;
  queryExportName: string;
  mutationExportName: string;
};

export const BASE_GITIGNORE = `# Logs
logs
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*
pnpm-debug.log*
lerna-debug.log*

node_modules
dist
dist-ssr
*.local

# Test artifacts
coverage
playwright-report
test-results
.vitest

# Editor directories and files
.vscode/*
!.vscode/extensions.json
.idea
.DS_Store
*.suo
*.ntvs*
*.njsproj
*.sln
*.sw?

# Environment files
.env
.env.*
!.env.example
`;

export const PRETTIER_IGNORE = `dist
node_modules
pnpm-lock.yaml
`;

export const PRETTIER_CONFIG = `/**
 * @see https://prettier.io/docs/configuration
 * @type {import('prettier').Config}
 */
const config = {
  arrowParens: 'always',
  bracketSameLine: true,
  bracketSpacing: true,
  jsxSingleQuote: false,
  printWidth: 100,
  singleQuote: true,
  tabWidth: 2,
  trailingComma: 'all',
  useTabs: false,
};

export default config;
`;

export const LINT_STAGED = `{
  "*.{ts,tsx,js,jsx}": "eslint --fix",
  "*.{ts,tsx,js,jsx,json,css,md}": "prettier --write"
}
`;

export function hasGroup(answers: Answers, group: FrontendGroup): boolean {
  if (answers.useFrontendPreset) {
    return true;
  }

  return answers.frontendGroups.includes(group);
}

export function hasBaseFolder(answers: Answers, folder: BaseFolder): boolean {
  if (folder === 'components') {
    return true;
  }

  if (folder === 'tests' && answers.includeVitest) {
    return true;
  }

  return answers.baseFolders.includes(folder);
}

export function json(content: unknown): string {
  return `${JSON.stringify(content, null, 2)}\n`;
}

export function toKebab(input: string): string {
  return input
    .trim()
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .toLowerCase();
}

export function toCamel(input: string): string {
  return toKebab(input)
    .split('-')
    .filter(Boolean)
    .map((part, index) => (index === 0 ? part : `${part[0]?.toUpperCase() ?? ''}${part.slice(1)}`))
    .join('');
}

export function toPascal(input: string): string {
  return toKebab(input)
    .split('-')
    .filter(Boolean)
    .map((part) => `${part[0]?.toUpperCase() ?? ''}${part.slice(1)}`)
    .join('');
}

function singularize(input: string): string {
  const value = toKebab(input);
  if (value.endsWith('ies')) {
    return `${value.slice(0, -3)}y`;
  }

  if (value.endsWith('s') && value.length > 1) {
    return value.slice(0, -1);
  }

  return value;
}

function pluralize(input: string): string {
  const value = toKebab(input);
  if (value.endsWith('s')) {
    return value;
  }

  if (value.endsWith('y')) {
    const penultimate = value[value.length - 2] ?? '';
    if (!['a', 'e', 'i', 'o', 'u'].includes(penultimate)) {
      return `${value.slice(0, -1)}ies`;
    }
  }

  return `${value}s`;
}

export function buildStarterContext(answers: Answers): StarterContext {
  const domainSeed = answers.domainName || answers.queryName || answers.mutationName || 'resource';
  const resourceSingular = singularize(domainSeed);
  const resourcePlural = pluralize(resourceSingular);
  const typeName = toPascal(resourceSingular);
  const typeFileBase = resourceSingular;
  const schemaName = `${toCamel(resourceSingular)}Schema`;
  const arraySchemaName = `${toCamel(resourcePlural)}Schema`;

  return {
    resourceSingular,
    resourcePlural,
    resourcePath: resourcePlural,
    typeName,
    typeFileBase,
    schemaName,
    arraySchemaName,
    queryExportName: toCamel(answers.queryName || `${resourcePlural}QueryOptions`),
    mutationExportName: toCamel(answers.mutationName || `send${typeName}`),
  };
}

function addDep(target: Record<string, string>, name: string, version: string): void {
  target[name] = version;
}

function reactVersion(version: Answers['reactVersion']): string {
  return version === '18' ? '^18.2.0' : 'latest';
}

function reactTypesVersion(version: Answers['reactVersion']): string {
  return version === '18' ? '^18.2.0' : 'latest';
}

export function buildFrontendDependencies(answers: Answers): DependencyBuckets {
  const dependencies: Record<string, string> = {};
  const devDependencies: Record<string, string> = {};
  const withReactQuery = hasGroup(answers, 'reactQuery') || answers.starterApiMode !== 'none';

  addDep(dependencies, 'react', reactVersion(answers.reactVersion));
  addDep(dependencies, 'react-dom', reactVersion(answers.reactVersion));

  addDep(devDependencies, 'vite', 'latest');
  addDep(devDependencies, '@vitejs/plugin-react', 'latest');

  if (answers.frontendLanguage === 'ts') {
    addDep(devDependencies, 'typescript', 'latest');
    addDep(devDependencies, '@types/node', 'latest');
    addDep(devDependencies, '@types/react', reactTypesVersion(answers.reactVersion));
    addDep(devDependencies, '@types/react-dom', reactTypesVersion(answers.reactVersion));
  }

  if (withReactQuery) {
    addDep(dependencies, '@tanstack/react-query', 'latest');
    addDep(devDependencies, '@tanstack/eslint-plugin-query', 'latest');
    addDep(devDependencies, '@tanstack/react-query-devtools', 'latest');
  }

  if (hasGroup(answers, 'tailwind')) {
    addDep(dependencies, 'tailwindcss', 'latest');
    addDep(dependencies, '@tailwindcss/vite', 'latest');
  }

  if (hasGroup(answers, 'zod')) {
    addDep(dependencies, 'zod', '^4.0.0');
  }

  if (answers.includeVitest) {
    addDep(devDependencies, 'vitest', 'latest');
    addDep(devDependencies, 'jsdom', 'latest');
    addDep(devDependencies, '@testing-library/react', 'latest');
    addDep(devDependencies, '@testing-library/jest-dom', 'latest');
    addDep(devDependencies, '@testing-library/user-event', 'latest');

    if (hasGroup(answers, 'msw') || answers.includeVitest) {
      addDep(devDependencies, 'msw', 'latest');
    }
  }

  if (answers.includePlaywright) {
    addDep(devDependencies, '@playwright/test', 'latest');
  }

  if (hasGroup(answers, 'lintTools')) {
    addDep(devDependencies, '@eslint/js', 'latest');
    addDep(devDependencies, 'eslint', 'latest');
    addDep(devDependencies, 'eslint-plugin-react-hooks', 'latest');
    addDep(devDependencies, 'eslint-plugin-react-refresh', 'latest');
    addDep(devDependencies, 'globals', 'latest');
    addDep(devDependencies, 'prettier', 'latest');
    addDep(devDependencies, 'lint-staged', 'latest');

    if (answers.frontendLanguage === 'ts') {
      addDep(devDependencies, 'typescript-eslint', 'latest');
    }

    if (withReactQuery) {
      addDep(devDependencies, '@tanstack/eslint-plugin-query', 'latest');
    }
  }

  return { dependencies, devDependencies };
}

export function buildBackendDependencies(answers: Answers): DependencyBuckets {
  const dependencies: Record<string, string> = {
    express: 'latest',
    cors: 'latest',
  };
  const devDependencies: Record<string, string> = {};

  if (answers.database === 'mysql') {
    addDep(dependencies, 'mysql2', 'latest');
  }

  if (answers.database === 'postgres') {
    addDep(dependencies, 'pg', 'latest');
  }

  if (answers.database === 'mongodb') {
    addDep(dependencies, 'mongodb', 'latest');
  }

  if (answers.includeBackendZod) {
    addDep(dependencies, 'zod', '^4.0.0');
  }

  if (answers.backendLanguage === 'ts') {
    addDep(devDependencies, 'typescript', 'latest');
    addDep(devDependencies, 'tsx', 'latest');
    addDep(devDependencies, '@types/express', 'latest');
    addDep(devDependencies, '@types/cors', 'latest');
    addDep(devDependencies, '@types/node', 'latest');

    if (answers.database === 'postgres') {
      addDep(devDependencies, '@types/pg', 'latest');
    }
  }

  if (hasGroup(answers, 'lintTools')) {
    addDep(devDependencies, '@eslint/js', 'latest');
    addDep(devDependencies, 'eslint', 'latest');
    addDep(devDependencies, 'globals', 'latest');
    addDep(devDependencies, 'prettier', 'latest');

    if (answers.backendLanguage === 'ts') {
      addDep(devDependencies, 'typescript-eslint', 'latest');
    }
  }

  return { dependencies, devDependencies };
}

export async function writeFile(target: string, content: string): Promise<void> {
  await fs.mkdir(path.dirname(target), { recursive: true });
  await fs.writeFile(target, content, 'utf-8');
}

export async function ensureEmptyProjectDirectory(projectDir: string): Promise<void> {
  const exists = await fs
    .stat(projectDir)
    .then(() => true)
    .catch(() => false);

  if (!exists) {
    return;
  }

  const items = await fs.readdir(projectDir);
  if (items.length > 0) {
    throw new Error(`Target directory is not empty: ${projectDir}`);
  }
}

export function frontendPackageJson(answers: Answers, packageName: string): Record<string, unknown> {
  const deps = buildFrontendDependencies(answers);
  const hasLintTools = hasGroup(answers, 'lintTools');

  const scripts: Record<string, string> = {
    dev: 'vite',
    build: answers.frontendLanguage === 'ts' ? 'tsc -b && vite build' : 'vite build',
    preview: 'vite preview',
    lint: hasLintTools ? 'eslint .' : "echo 'Lint not enabled'",
    typecheck:
      answers.frontendLanguage === 'ts' ? 'tsc --noEmit' : "echo 'Typecheck skipped for JavaScript frontend'",
  };

  if (answers.includeVitest) {
    scripts.test = 'vitest';
    scripts['test:run'] = 'vitest run';
  } else {
    scripts.test = "echo 'Vitest not enabled'";
    scripts['test:run'] = "echo 'Vitest not enabled'";
  }

  if (answers.includePlaywright) {
    scripts['test:e2e'] = 'playwright test';
    scripts['test:e2e:ui'] = 'playwright test --ui';
  }

  if (hasLintTools) {
    scripts['lint-staged'] = 'lint-staged';
  }

  return {
    name: packageName,
    private: true,
    version: '0.1.0',
    type: 'module',
    scripts,
    dependencies: deps.dependencies,
    devDependencies: deps.devDependencies,
  };
}

export function serverPackageJson(answers: Answers): Record<string, unknown> {
  const deps = buildBackendDependencies(answers);
  const hasLintTools = hasGroup(answers, 'lintTools');

  const scripts: Record<string, string> = {
    dev:
      answers.backendLanguage === 'ts'
        ? 'tsx watch src/index.ts'
        : 'node --watch src/index.js',
    build:
      answers.backendLanguage === 'ts'
        ? 'tsc -p tsconfig.json'
        : "node -e \"console.log('No build step for JavaScript backend')\"",
    start: answers.backendLanguage === 'ts' ? 'node dist/index.js' : 'node src/index.js',
    lint: hasLintTools ? 'eslint .' : "echo 'Lint not enabled'",
  };

  if (answers.backendLanguage === 'ts') {
    scripts.typecheck = 'tsc --noEmit';
  }

  return {
    name: 'server',
    private: true,
    version: '0.1.0',
    type: 'module',
    scripts,
    dependencies: deps.dependencies,
    devDependencies: deps.devDependencies,
  };
}

export function rootWorkspacePackageJson(projectName: string, hasLintTools: boolean): Record<string, unknown> {
  const scripts: Record<string, string> = {
    dev: 'pnpm -r --parallel dev',
    build: 'pnpm -r build',
    test: 'pnpm --filter client test',
    'test:run': 'pnpm --filter client test:run',
    typecheck: 'pnpm -r typecheck',
    lint: 'pnpm -r lint',
  };

  const devDependencies: Record<string, string> = {};
  if (hasLintTools) {
    scripts.prepare = 'husky .husky';
    devDependencies.husky = 'latest';
  }

  return {
    name: toKebab(projectName),
    private: true,
    version: '0.1.0',
    packageManager: 'pnpm@10',
    scripts,
    devDependencies,
  };
}
