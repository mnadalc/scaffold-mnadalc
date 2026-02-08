import {
  cancel,
  confirm,
  isCancel,
  multiselect,
  select,
  text,
} from '@clack/prompts';
import pc from 'picocolors';
import type { Answers, BaseFolder, Database, FrontendGroup, Language, ReactVersion, StarterApiMode } from './types.js';

function handleCancel<T>(value: T | symbol): T {
  if (isCancel(value)) {
    cancel('Setup cancelled.');
    process.exit(0);
  }

  return value as T;
}

function validateProjectName(value: string): string | undefined {
  if (!value || !value.trim()) {
    return 'Project name is required.';
  }

  if (!/^[a-zA-Z0-9-_]+$/.test(value.trim())) {
    return 'Use letters, numbers, dashes, or underscores only.';
  }

  return;
}

export async function collectAnswers(initialProjectName?: string): Promise<Answers> {
  const projectName = initialProjectName
    ? initialProjectName
    : handleCancel(
        await text({
          message: 'Project name?',
          placeholder: 'my-project',
          validate: validateProjectName,
        }),
      );

  const projectNameError = validateProjectName(projectName);
  if (projectNameError) {
    throw new Error(projectNameError);
  }

  const withBackend = handleCancel(
    await confirm({
      message: 'Do you want a backend (Express)?',
      initialValue: true,
    }),
  );

  const frontendLanguage = handleCancel(
    await select({
      message: 'Frontend language?',
      initialValue: 'ts',
      options: [
        { value: 'ts', label: 'TypeScript' },
        { value: 'js', label: 'JavaScript' },
      ],
    }),
  ) as Language;

  const reactVersion = handleCancel(
    await select({
      message: 'React version?',
      initialValue: 'latest',
      options: [
        { value: 'latest', label: 'Latest' },
        { value: '18', label: 'React 18' },
      ],
    }),
  ) as ReactVersion;

  const includeVitest = handleCancel(
    await confirm({
      message: 'Add Vitest to frontend?',
      initialValue: true,
    }),
  );

  const includePlaywright = handleCancel(
    await confirm({
      message: 'Add Playwright to frontend?',
      initialValue: false,
    }),
  );

  const useFrontendPreset = handleCancel(
    await confirm({
      message: 'Install default frontend packages preset?',
      initialValue: true,
    }),
  );

  let frontendGroups: FrontendGroup[] = ['reactQuery', 'tailwind', 'zod', 'msw', 'lintTools'];
  if (!useFrontendPreset) {
    frontendGroups = handleCancel(
      await multiselect({
        message: 'Select frontend dependency groups',
        required: false,
        initialValues: ['reactQuery', 'tailwind', 'zod', 'msw', 'lintTools'],
        options: [
          { value: 'reactQuery', label: 'TanStack Query (+ devtools plugin)' },
          { value: 'tailwind', label: 'Tailwind CSS v4' },
          { value: 'zod', label: 'Zod v4' },
          { value: 'msw', label: 'MSW' },
          { value: 'lintTools', label: 'ESLint + Prettier + Husky + lint-staged' },
        ],
      }),
    ) as FrontendGroup[];
  }

  const baseFolders = handleCancel(
    await multiselect({
      message: 'Create base frontend folders?',
      required: false,
      initialValues: ['api', 'components', 'contexts', 'types', 'tests'],
      options: [
        { value: 'api', label: 'src/api' },
        { value: 'components', label: 'src/components' },
        { value: 'contexts', label: 'src/contexts' },
        { value: 'types', label: 'src/types' },
        { value: 'tests', label: 'src/__tests__' },
      ],
    }),
  ) as BaseFolder[];

  const starterApiMode = handleCancel(
    await select({
      message: 'Create starter API files in frontend?',
      initialValue: 'none',
      options: [
        { value: 'none', label: 'None' },
        { value: 'query', label: 'Query' },
        { value: 'mutation', label: 'Mutation' },
        { value: 'both', label: 'Both' },
      ],
    }),
  ) as StarterApiMode;

  let domainName = '';
  let queryName = '';
  let mutationName = '';

  if (starterApiMode !== 'none') {
    domainName = handleCancel(
      await text({
        message: 'Domain name for starter schemas/files?',
        placeholder: 'domainModel',
        validate: (value) => {
          if (!value || !value.trim()) {
            return 'Domain name is required when starter API files are enabled.';
          }

          return;
        },
      }),
    );
  }

  if (starterApiMode === 'query' || starterApiMode === 'both') {
    queryName = handleCancel(
      await text({
        message: 'Query options export name?',
        placeholder: 'getDomainModelsQuery',
        validate: (value) => {
          if (!value || !value.trim()) {
            return 'Query options export name is required.';
          }

          return;
        },
      }),
    );
  }

  if (starterApiMode === 'mutation' || starterApiMode === 'both') {
    mutationName = handleCancel(
      await text({
        message: 'Mutation function export name?',
        placeholder: 'sendDomainModel',
        validate: (value) => {
          if (!value || !value.trim()) {
            return 'Mutation function export name is required.';
          }

          return;
        },
      }),
    );
  }

  let backendLanguage: Language = 'ts';
  let database: Database = 'none';
  let includeBackendZod = true;

  if (withBackend) {
    backendLanguage = handleCancel(
      await select({
        message: 'Backend language?',
        initialValue: 'ts',
        options: [
          { value: 'ts', label: 'TypeScript' },
          { value: 'js', label: 'JavaScript' },
        ],
      }),
    ) as Language;

    database = handleCancel(
      await select({
        message: 'Database?',
        initialValue: 'none',
        options: [
          { value: 'none', label: 'none' },
          { value: 'mysql', label: 'mysql' },
          { value: 'postgres', label: 'postgres' },
          { value: 'mongodb', label: 'mongodb' },
        ],
      }),
    ) as Database;

    includeBackendZod = handleCancel(
      await confirm({
        message: 'Add backend zod validation?',
        initialValue: true,
      }),
    );
  }

  const installNow = handleCancel(
    await confirm({
      message: 'Install dependencies now with pnpm?',
      initialValue: true,
    }),
  );

  console.log(pc.green('Inputs collected. Generating project...'));

  return {
    projectName: projectName.trim(),
    withBackend,
    frontendLanguage,
    reactVersion,
    includeVitest,
    includePlaywright,
    useFrontendPreset,
    frontendGroups,
    baseFolders,
    starterApiMode,
    domainName: domainName.trim(),
    queryName: queryName.trim(),
    mutationName: mutationName.trim(),
    backendLanguage,
    database,
    includeBackendZod,
    installNow,
  };
}
