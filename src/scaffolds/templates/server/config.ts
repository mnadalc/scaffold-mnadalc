// @ts-nocheck

function serverTsConfig() {
    return `{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "outDir": "dist",
    "rootDir": "src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "types": ["node"]
  },
  "include": ["src/**/*.ts"]
}
`;
}
function serverEslintConfig(language) {
    const typeConfig = language === 'ts';
    const tsRootImports = typeConfig ? "import path from 'node:path';\nimport { fileURLToPath } from 'node:url';\n" : '';
    const tsRootConst = typeConfig ? "\nconst tsconfigRootDir = path.dirname(fileURLToPath(import.meta.url));\n" : '';
    const tsImport = typeConfig ? "import tseslint from 'typescript-eslint';\n" : '';
    const tsSpread = typeConfig ? '  ...tseslint.configs.recommended,\n' : '';
    const parserOptions = typeConfig ? "\n      parserOptions: {\n        tsconfigRootDir,\n      }," : '';
    const filesGlob = typeConfig ? '**/*.ts' : '**/*.js';
return `import js from '@eslint/js';
import globals from 'globals';
${tsRootImports}${tsImport}${tsRootConst}
export default ${typeConfig ? 'tseslint.config(' : '['}
  { ignores: ['dist'] },
  js.configs.recommended,
${tsSpread}  {
    files: ['${filesGlob}'],
    languageOptions: {
      ecmaVersion: 2022,
      globals: globals.node,
      sourceType: 'module',
${parserOptions}
    },
  }${typeConfig ? '\n);\n' : '\n];\n'}
`;
}
function backendDbClient(database, language) {
    if (database === 'none') {
        return '';
    }
    if (database === 'mysql') {
        return language === 'ts'
            ? `import mysql from 'mysql2/promise';

export const db = mysql.createPool({
  uri: process.env.DATABASE_URL,
});
`
            : `import mysql from 'mysql2/promise';

export const db = mysql.createPool({
  uri: process.env.DATABASE_URL,
});
`;
    }
    if (database === 'postgres') {
        return language === 'ts'
            ? `import { Pool } from 'pg';

export const db = new Pool({
  connectionString: process.env.DATABASE_URL,
});
`
            : `import { Pool } from 'pg';

export const db = new Pool({
  connectionString: process.env.DATABASE_URL,
});
`;
    }
    return language === 'ts'
        ? `import { MongoClient } from 'mongodb';

const uri = process.env.DATABASE_URL ?? '';
export const db = new MongoClient(uri);
`
        : `import { MongoClient } from 'mongodb';

const uri = process.env.DATABASE_URL ?? '';
export const db = new MongoClient(uri);
`;
}
function backendEnvExample(database) {
    let content = 'PORT=3001\n';
    if (database === 'none') {
        return content;
    }
    if (database === 'mysql') {
        content += 'DATABASE_URL=mysql://user:password@localhost:3306/app\n';
    }
    if (database === 'postgres') {
        content += 'DATABASE_URL=postgres://user:password@localhost:5432/app\n';
    }
    if (database === 'mongodb') {
        content += 'DATABASE_URL=mongodb://localhost:27017/app\n';
    }
    return content;
}

export { backendDbClient, backendEnvExample, serverEslintConfig, serverTsConfig };
