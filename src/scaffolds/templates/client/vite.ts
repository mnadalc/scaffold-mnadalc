// @ts-nocheck
import { hasGroup } from '../../shared.js';

function frontendViteConfig(answers) {
  const withTailwind = hasGroup(answers, 'tailwind');
  const withBackendProxy = answers.withBackend;
  const tailwindImport = withTailwind ? "import tailwindcss from '@tailwindcss/vite';\n" : '';
  const tailwindPlugin = withTailwind ? ', tailwindcss()' : '';
  const resolveBlock = `,
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      '@api': fileURLToPath(new URL('./src/api', import.meta.url)),
      '@components': fileURLToPath(new URL('./src/components', import.meta.url)),
      '@contexts': fileURLToPath(new URL('./src/contexts', import.meta.url)),
      '@types': fileURLToPath(new URL('./src/types', import.meta.url)),
      '@test': fileURLToPath(new URL('./src/__tests__', import.meta.url)),
    },
  }`;
  const proxyBlock = withBackendProxy
    ? `,
  server: {
    fs: {
      allow: ['..'],
    },
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
      '/health': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
    },
  }`
    : '';

  return `import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
${tailwindImport}
export default defineConfig({
  plugins: [react()${tailwindPlugin}]${resolveBlock}${proxyBlock}
});
`;
}

function frontendVitestConfig(answers) {
  const ext = answers.frontendLanguage === 'ts' ? 'ts' : 'js';
  return `import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      '@api': fileURLToPath(new URL('./src/api', import.meta.url)),
      '@components': fileURLToPath(new URL('./src/components', import.meta.url)),
      '@contexts': fileURLToPath(new URL('./src/contexts', import.meta.url)),
      '@types': fileURLToPath(new URL('./src/types', import.meta.url)),
      '@test': fileURLToPath(new URL('./src/__tests__', import.meta.url)),
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/__tests__/setup.${ext}',
  },
});
`;
}

export { frontendViteConfig, frontendVitestConfig };
