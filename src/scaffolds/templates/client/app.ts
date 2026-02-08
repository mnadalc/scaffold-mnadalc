// @ts-nocheck

function frontendApp(language, options) {
    if (options.includeReactQuery && options.includeQueryStarter) {
        const queryConst = options.queryExportName;
        if (language === 'ts') {
            return `import { useQuery } from '@tanstack/react-query';
import Spinner from '@components/Spinner';
import { ${queryConst} } from '@api/${options.queryFileBase}';

function App() {
  const { data, isLoading, isError } = useQuery(${queryConst});

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center p-6">
        <Spinner />
      </div>
    );
  }

  if (isError) {
    return <div className="p-6">Could not load data.</div>;
  }

  return (
    <main className="mx-auto max-w-3xl p-6">
      <h1 className="mb-4 text-2xl font-semibold">Query Results</h1>

      <ul className="space-y-2">
        {(data ?? []).map((item, index) => (
          <li key={String(item.id ?? index)} className="rounded border p-3">
            <pre className="overflow-x-auto text-sm">{JSON.stringify(item, null, 2)}</pre>
          </li>
        ))}
      </ul>
    </main>
  );
}

export default App;
`;
        }
        return `import { useQuery } from '@tanstack/react-query';
import Spinner from '@components/Spinner';
import { ${queryConst} } from '@api/${options.queryFileBase}';

function App() {
  const { data, isLoading, isError } = useQuery(${queryConst});

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center p-6">
        <Spinner />
      </div>
    );
  }

  if (isError) {
    return <div className="p-6">Could not load data.</div>;
  }

  return (
    <main className="mx-auto max-w-3xl p-6">
      <h1 className="mb-4 text-2xl font-semibold">Query Results</h1>

      <ul className="space-y-2">
        {(data ?? []).map((item, index) => (
          <li key={String(item.id ?? index)} className="rounded border p-3">
            <pre className="overflow-x-auto text-sm">{JSON.stringify(item, null, 2)}</pre>
          </li>
        ))}
      </ul>
    </main>
  );
}

export default App;
`;
    }
    return `function App() {
  return (
    <main className="mx-auto max-w-3xl p-6">
      <h1 className="mb-2 text-2xl font-semibold">Project Skeleton</h1>
      <p>
        Your React + Vite project is ready. Start building features in <code>src</code>.
      </p>
    </main>
  );
}

export default App;
`;
}
function frontendMain(language, includeReactQuery) {
    const queryImports = includeReactQuery
        ? "import { QueryClient, QueryClientProvider } from '@tanstack/react-query';\nimport { ReactQueryDevtools } from '@tanstack/react-query-devtools';\n"
        : '';
    const queryClient = includeReactQuery ? 'const queryClient = new QueryClient();\n\n' : '';
    const providerOpen = includeReactQuery ? '<QueryClientProvider client={queryClient}>' : '';
    const providerClose = includeReactQuery ? '</QueryClientProvider>' : '';
    const devtools = includeReactQuery
        ? '\n      {import.meta.env.DEV ? <ReactQueryDevtools initialIsOpen={false} /> : null}'
        : '';
    return `import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
${queryImports}import App from '@/App';
import { ErrorBoundary } from '@components/ErrorBoundary';
import './index.css';

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('Root element #root not found', {
    cause: new Error('Expected a root element in index.html'),
  });
}

${queryClient}createRoot(rootElement).render(
  <StrictMode>
    <ErrorBoundary>
      ${providerOpen}
        <App />${devtools}
      ${providerClose}
    </ErrorBoundary>
  </StrictMode>,
);
`;
}

export { frontendApp, frontendMain };
