import { spawnSync } from 'node:child_process';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import type { Answers } from '../types.js';
import {
  LINT_STAGED,
  PRETTIER_CONFIG,
  PRETTIER_IGNORE,
  buildStarterContext,
  frontendPackageJson,
  hasBaseFolder,
  hasGroup,
  json,
  serverPackageJson,
  toCamel,
  toKebab,
  writeFile,
} from './shared.js';
import {
  apiQueryTest,
  backendDbClient,
  backendEnvExample,
  backendIndexJs,
  backendIndexTs,
  domainTypeFile,
  errorBoundaryComponent,
  errorBoundaryTest,
  frontendApp,
  frontendAppTest,
  frontendEslintConfig,
  frontendIndexCss,
  frontendIndexHtml,
  frontendIndexHtmlJs,
  frontendMain,
  frontendReadme,
  frontendTsConfigApp,
  frontendTsConfigNode,
  frontendTsConfigRoot,
  frontendVitestConfig,
  frontendViteConfig,
  mutationTemplate,
  playwrightConfig,
  queryTemplate,
  serverEslintConfig,
  serverTsConfig,
  spinnerComponent,
  spinnerTest,
  testHandlers,
  testServer,
  testSetup,
} from './templates.js';

export async function createFrontend(projectDir: string, answers: Answers, fullStack: boolean): Promise<void> {
  const language = answers.frontendLanguage;
  const extension = language === 'ts' ? 'tsx' : 'jsx';
  const includeReactQuery = hasGroup(answers, 'reactQuery') || answers.starterApiMode !== 'none';
  const includeZod = hasGroup(answers, 'zod');
  const includeLintTools = hasGroup(answers, 'lintTools');
  const includeQueryStarter =
    includeReactQuery && (answers.starterApiMode === 'query' || answers.starterApiMode === 'both');
  const includeMutationStarter =
    includeReactQuery && (answers.starterApiMode === 'mutation' || answers.starterApiMode === 'both');
  const includeApiStarters = includeQueryStarter || includeMutationStarter;
  const starterContext = includeApiStarters ? buildStarterContext(answers) : null;
  const queryFileBase = includeQueryStarter ? toCamel(answers.queryName) : '';
  const mutationFileBase = includeMutationStarter ? toCamel(answers.mutationName) : '';

  await writeFile(
    path.join(projectDir, 'package.json'),
    json(frontendPackageJson(answers, fullStack ? 'client' : toKebab(answers.projectName))),
  );
  await writeFile(path.join(projectDir, 'index.html'),
    language === 'ts' ? frontendIndexHtml(answers.projectName) : frontendIndexHtmlJs(answers.projectName));

  if (language === 'ts') {
    await writeFile(path.join(projectDir, 'tsconfig.json'), frontendTsConfigRoot());
    await writeFile(path.join(projectDir, 'tsconfig.app.json'), frontendTsConfigApp(answers.includeVitest));
    await writeFile(path.join(projectDir, 'tsconfig.node.json'), frontendTsConfigNode());
  }

  await writeFile(
    path.join(projectDir, `vite.config.${language}`),
    frontendViteConfig(answers),
  );

  if (answers.includeVitest) {
    await writeFile(path.join(projectDir, `vitest.config.${language}`), frontendVitestConfig(answers));
  }

  if (answers.includePlaywright) {
    await writeFile(path.join(projectDir, `playwright.config.${language}`), playwrightConfig(language));
    const e2eFolder = path.join(projectDir, 'src', 'e2e');
    await writeFile(
      path.join(e2eFolder, `home.spec.${language}`),
      `import { test, expect } from '@playwright/test';

test('homepage renders', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle(/${answers.projectName}/i);
});
`,
    );
  }

  if (includeLintTools) {
    await writeFile(path.join(projectDir, 'eslint.config.mjs'), frontendEslintConfig(language, includeReactQuery));
    await writeFile(path.join(projectDir, 'prettier.config.mjs'), PRETTIER_CONFIG);
    await writeFile(path.join(projectDir, '.prettierignore'), PRETTIER_IGNORE);
    await writeFile(path.join(projectDir, '.lintstagedrc'), LINT_STAGED);
  }

  await writeFile(path.join(projectDir, 'README.md'), frontendReadme(fullStack));

  const sourceDir = path.join(projectDir, 'src');
  await writeFile(path.join(sourceDir, 'index.css'), frontendIndexCss(answers));
  await writeFile(path.join(sourceDir, `App.${extension}`), frontendApp(language, {
    includeReactQuery,
    includeQueryStarter,
    queryExportName: starterContext?.queryExportName ?? 'queryOptions',
    queryFileBase: queryFileBase || 'query',
  }));
  await writeFile(path.join(sourceDir, `main.${extension}`), frontendMain(language, includeReactQuery));

  if (hasBaseFolder(answers, 'components')) {
    await writeFile(
      path.join(sourceDir, 'components', `ErrorBoundary.${extension}`),
      errorBoundaryComponent(language),
    );
    await writeFile(path.join(sourceDir, 'components', `Spinner.${extension}`), spinnerComponent());
  }

  if (hasBaseFolder(answers, 'contexts')) {
    await fs.mkdir(path.join(sourceDir, 'contexts'), { recursive: true });
  }

  const shouldCreateTypesFolder = hasBaseFolder(answers, 'types') || includeApiStarters;
  if (shouldCreateTypesFolder) {
    await fs.mkdir(path.join(sourceDir, 'types'), { recursive: true });
  }

  if (includeApiStarters && starterContext) {
    await writeFile(
      path.join(sourceDir, 'types', `${starterContext.typeFileBase}.${language}`),
      domainTypeFile(language, includeZod, starterContext),
    );
  }

  const shouldCreateApiFolder =
    hasBaseFolder(answers, 'api') || includeQueryStarter || includeMutationStarter;

  if (shouldCreateApiFolder) {
    await fs.mkdir(path.join(sourceDir, 'api'), { recursive: true });
  }

  if (includeQueryStarter) {
    if (!starterContext) {
      throw new Error('Starter context is required for query template generation.');
    }

    await writeFile(
      path.join(sourceDir, 'api', `${queryFileBase}.${language}`),
      queryTemplate(language, {
        withZod: includeZod,
        typePath: `@types/${starterContext.typeFileBase}`,
        resourcePath: starterContext.resourcePath,
        queryExportName: starterContext.queryExportName,
        arraySchemaName: starterContext.arraySchemaName,
        typeName: starterContext.typeName,
      }),
    );
  }

  if (includeMutationStarter) {
    if (!starterContext) {
      throw new Error('Starter context is required for mutation template generation.');
    }

    await writeFile(
      path.join(sourceDir, 'api', `${mutationFileBase}.${language}`),
      mutationTemplate(language, {
        withZod: includeZod,
        typePath: `@types/${starterContext.typeFileBase}`,
        resourcePath: starterContext.resourcePath,
        mutationExportName: starterContext.mutationExportName,
        schemaName: starterContext.schemaName,
        typeName: starterContext.typeName,
      }),
    );
  }

  if (answers.includeVitest) {
    await writeFile(path.join(sourceDir, '__tests__', `setup.${language}`), testSetup());
    await writeFile(path.join(sourceDir, 'api', '__tests__', 'mocks', `server.${language}`), testServer());
    await writeFile(
      path.join(sourceDir, 'api', '__tests__', 'mocks', `handlers.${language}`),
      testHandlers(language, {
        withTypedDomain: Boolean(starterContext) && language === 'ts',
        typeName: starterContext?.typeName ?? 'Record<string, unknown>',
        typeFileBase: starterContext?.typeFileBase ?? 'types',
        resourcePath: starterContext?.resourcePath ?? 'health',
      }),
    );
    await writeFile(
      path.join(sourceDir, '__tests__', `App.test.${extension}`),
      frontendAppTest(language, includeReactQuery, includeQueryStarter),
    );

    if (includeQueryStarter && starterContext) {
      await writeFile(
        path.join(sourceDir, 'api', '__tests__', `${queryFileBase}.test.${extension}`),
        apiQueryTest(language, {
          queryExportName: starterContext.queryExportName,
          queryFileBase,
          resourcePath: starterContext.resourcePath,
        }),
      );
    }
    await writeFile(
      path.join(sourceDir, 'components', '__tests__', `Spinner.test.${extension}`),
      spinnerTest(),
    );
    await writeFile(
      path.join(sourceDir, 'components', '__tests__', `ErrorBoundary.test.${extension}`),
      errorBoundaryTest(language),
    );

    if (hasBaseFolder(answers, 'tests')) {
      await fs.mkdir(path.join(sourceDir, '__tests__'), { recursive: true });
      await fs.mkdir(path.join(sourceDir, 'api', '__tests__'), { recursive: true });
      await fs.mkdir(path.join(sourceDir, 'components', '__tests__'), { recursive: true });
    }
  }
}

export async function createBackend(projectDir: string, answers: Answers): Promise<void> {
  const language = answers.backendLanguage;
  const includeMutationStarter = answers.starterApiMode === 'mutation' || answers.starterApiMode === 'both';
  const includeApiStarters = answers.starterApiMode !== 'none';
  const starterContext = includeApiStarters ? buildStarterContext(answers) : null;
  await writeFile(path.join(projectDir, 'package.json'), json(serverPackageJson(answers)));

  if (language === 'ts') {
    await writeFile(path.join(projectDir, 'tsconfig.json'), serverTsConfig());
    await writeFile(
      path.join(projectDir, 'src', 'index.ts'),
      backendIndexTs(answers, { starter: starterContext, includeMutationStarter }),
    );
  } else {
    await writeFile(
      path.join(projectDir, 'src', 'index.js'),
      backendIndexJs(answers, { starter: starterContext, includeMutationStarter }),
    );
  }

  if (answers.database !== 'none') {
    await writeFile(
      path.join(projectDir, 'src', 'db', `client.${language}`),
      backendDbClient(answers.database, language),
    );
  }

  if (hasGroup(answers, 'lintTools')) {
    await writeFile(path.join(projectDir, 'eslint.config.mjs'), serverEslintConfig(language));
    await writeFile(path.join(projectDir, 'prettier.config.mjs'), PRETTIER_CONFIG);
    await writeFile(path.join(projectDir, '.prettierignore'), PRETTIER_IGNORE);
  }

  await writeFile(path.join(projectDir, '.env.example'), backendEnvExample(answers.database));
  await writeFile(path.join(projectDir, 'README.md'), '# Server\n\nExpress backend generated by scaffold-mnadalc-project.\n');
}

export function runPnpmInstall(projectDir: string): void {
  const result = spawnSync('pnpm', ['install'], {
    cwd: projectDir,
    stdio: 'inherit',
    env: process.env,
  });

  if (result.status !== 0) {
    throw new Error('pnpm install failed.');
  }
}
