#!/usr/bin/env node

import { intro, log, outro } from '@clack/prompts';
import pc from 'picocolors';
import { collectAnswers } from './prompts.js';
import { generateProject } from './scaffold.js';

async function run(): Promise<void> {
  try {
    intro(pc.cyan('scaffold-mnadalc-project'));

    const projectNameArg = process.argv[2];
    const answers = await collectAnswers(projectNameArg);
    const projectPath = await generateProject(answers);

    log.success(`Project created at ${projectPath}`);
    outro(pc.green('Done.'));
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    log.error(message);
    process.exit(1);
  }
}

void run();
