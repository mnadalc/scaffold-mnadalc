// @ts-nocheck

function frontendEslintConfig(language, includeReactQuery) {
  const queryPluginImport = includeReactQuery ? "import pluginQuery from '@tanstack/eslint-plugin-query';\n" : '';
  const queryPluginConfig = includeReactQuery ? "  ...pluginQuery.configs['flat/recommended'],\n" : '';

  if (language === 'ts') {
    return `import js from '@eslint/js';
import globals from 'globals';
import path from 'node:path';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import { fileURLToPath } from 'node:url';
import tseslint from 'typescript-eslint';
import { defineConfig, globalIgnores } from 'eslint/config';
${queryPluginImport}
const tsconfigRootDir = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig([
  globalIgnores(['dist']),
${queryPluginConfig}  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      ...tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parserOptions: {
        tsconfigRootDir,
      },
    },
  },
  {
    files: ['src/e2e/**/*.ts'],
    rules: {
      'react-hooks/rules-of-hooks': 'off',
    },
  },
]);
`;
  }

  return `import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import { defineConfig, globalIgnores } from 'eslint/config';
${queryPluginImport}
export default defineConfig([
  globalIgnores(['dist']),
${queryPluginConfig}  {
    files: ['**/*.{js,jsx}'],
    extends: [
      js.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
  },
]);
`;
}

export { frontendEslintConfig };
