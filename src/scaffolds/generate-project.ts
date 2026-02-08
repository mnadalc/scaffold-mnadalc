import { log } from '@clack/prompts';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import type { Answers } from '../types.js';
import {
  BASE_GITIGNORE,
  ensureEmptyProjectDirectory,
  hasGroup,
  json,
  rootWorkspacePackageJson,
  writeFile,
} from './shared.js';
import { createBackend, createFrontend, runPnpmInstall } from './create.js';
import { frontendPreCommit, rootReadmeTemplate } from './templates.js';

export async function generateProject(answers: Answers): Promise<string> {
  const projectDir = path.resolve(process.cwd(), answers.projectName);
  const fullStack = answers.withBackend;
  const includeLintTools = hasGroup(answers, 'lintTools');

  await ensureEmptyProjectDirectory(projectDir);
  await fs.mkdir(projectDir, { recursive: true });

  await writeFile(path.join(projectDir, '.gitignore'), BASE_GITIGNORE);

  if (fullStack) {
    await writeFile(
      path.join(projectDir, 'package.json'),
      json(rootWorkspacePackageJson(answers.projectName, includeLintTools)),
    );
    await writeFile(path.join(projectDir, 'pnpm-workspace.yaml'), 'packages:\n  - client\n  - server\n');
    await writeFile(path.join(projectDir, 'README.md'), rootReadmeTemplate(answers.projectName, true));

    const clientDir = path.join(projectDir, 'client');
    const serverDir = path.join(projectDir, 'server');

    await createFrontend(clientDir, answers, true);
    await createBackend(serverDir, answers);

    if (includeLintTools) {
      const hookPath = path.join(projectDir, '.husky', 'pre-commit');
      await writeFile(hookPath, frontendPreCommit(true));
      await fs.chmod(hookPath, 0o755);
    }
  } else {
    await createFrontend(projectDir, answers, false);
    await writeFile(path.join(projectDir, 'README.md'), rootReadmeTemplate(answers.projectName, false));

    if (includeLintTools) {
      const hookPath = path.join(projectDir, '.husky', 'pre-commit');
      await writeFile(hookPath, frontendPreCommit(false));
      await fs.chmod(hookPath, 0o755);
    }
  }

  if (answers.installNow) {
    log.step('Installing dependencies with pnpm...');
    runPnpmInstall(projectDir);
  }

  return projectDir;
}
