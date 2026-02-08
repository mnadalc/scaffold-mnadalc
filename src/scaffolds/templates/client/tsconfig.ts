// @ts-nocheck

function frontendTsConfigRoot() {
  return `{
  "files": [],
  "references": [
    { "path": "./tsconfig.app.json" },
    { "path": "./tsconfig.node.json" }
  ]
}
`;
}

function frontendTsConfigApp(includeVitest) {
  const types = includeVitest ? '["vite/client", "vitest/globals"]' : '["vite/client"]';
  return `{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "jsx": "react-jsx",
    "strict": true,
    "skipLibCheck": true,
    "types": ${types},
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"],
      "@api/*": ["src/api/*"],
      "@components/*": ["src/components/*"],
      "@contexts/*": ["src/contexts/*"],
      "@types/*": ["src/types/*"],
      "@test/*": ["src/__tests__/*"]
    }
  },
  "include": ["src"]
}
`;
}

function frontendTsConfigNode() {
  return `{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "lib": ["ES2022"],
    "strict": true,
    "skipLibCheck": true,
    "types": ["node"]
  },
  "include": ["vite.config.ts", "vitest.config.ts", "playwright.config.ts"]
}
`;
}

export { frontendTsConfigApp, frontendTsConfigNode, frontendTsConfigRoot };
