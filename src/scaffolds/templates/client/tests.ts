// @ts-nocheck

function spinnerTest() {
    return `import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';

import Spinner from '@components/Spinner';

describe('<Spinner />', () => {
  it('renders', () => {
    render(<Spinner />);

    const spinner = screen.getByRole('status', {
      name: /loading/i,
    });
    expect(spinner).toBeInTheDocument();

    expect(spinner).toHaveAttribute('aria-busy', 'true');
    expect(spinner).toHaveAttribute('aria-live', 'polite');
  });
});
`;
}
function errorBoundaryTest(language) {
    if (language === 'ts') {
        return `import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import ErrorBoundary from '@components/ErrorBoundary';

type ThrowErrorProps = {
  shouldThrow?: boolean;
};

const ThrowError = ({ shouldThrow = false }: ThrowErrorProps) => {
  if (shouldThrow) {
    throw new Error('Error message');
  }

  return <p>Lorem ipsum dolor sit amet</p>;
};

describe('<ErrorBoundary />', () => {
  let consoleErrorSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  it('renders children when there is no error', () => {
    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>,
    );

    const text = screen.getByText(/lorem ipsum dolor sit amet/i);
    expect(text).toBeInTheDocument();
  });

  it('does not render children when an error occurs', () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow />
      </ErrorBoundary>,
    );

    const text = screen.queryByText(/lorem ipsum dolor sit amet/i);
    expect(text).not.toBeInTheDocument();
  });
});
`;
    }
    return `import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import ErrorBoundary from '@components/ErrorBoundary';

const ThrowError = ({ shouldThrow = false }) => {
  if (shouldThrow) {
    throw new Error('Error message');
  }

  return <p>Lorem ipsum dolor sit amet</p>;
};

describe('<ErrorBoundary />', () => {
  let consoleErrorSpy;

  beforeEach(() => {
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  it('renders children when there is no error', () => {
    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>,
    );

    const text = screen.getByText(/lorem ipsum dolor sit amet/i);
    expect(text).toBeInTheDocument();
  });

  it('does not render children when an error occurs', () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow />
      </ErrorBoundary>,
    );

    const text = screen.queryByText(/lorem ipsum dolor sit amet/i);
    expect(text).not.toBeInTheDocument();
  });
});
`;
}
function testSetup() {
    return `import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterAll, afterEach, beforeAll } from 'vitest';
import { server } from '@api/__tests__/mocks/server';

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => {
  cleanup();
  server.resetHandlers();
});
afterAll(() => server.close());
`;
}
function testServer() {
    return `import { setupServer } from 'msw/node';
import { handlers } from './handlers';

export const server = setupServer(...handlers);
`;
}
function testHandlers(language, options) {
    if (language === 'ts' && options.withTypedDomain) {
        return `import { http, HttpResponse } from 'msw';
import type { ${options.typeName} } from '@types/${options.typeFileBase}';

export const MOCK_API_RESPONSE: ${options.typeName}[] = [
  { id: 1 },
  { id: 2 },
  { id: 3 },
];

export const handlers = [
  http.get('/api/${options.resourcePath}', () => {
    return HttpResponse.json(MOCK_API_RESPONSE);
  }),
];
`;
    }
    return `import { http, HttpResponse } from 'msw';

export const MOCK_API_RESPONSE = [{ id: 1 }, { id: 2 }, { id: 3 }];

export const handlers = [
  http.get('/api/${options.resourcePath}', () => {
    return HttpResponse.json(MOCK_API_RESPONSE);
  }),
];
`;
}

function frontendAppTest(language, includeReactQuery, includeQueryStarter) {
  if (includeReactQuery && includeQueryStarter) {
    return `import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import App from '@/App';

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
});

function renderComponent() {
  return render(
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>,
  );
}

describe('App', () => {
  it('shows loading state', () => {
    renderComponent();

    const spinner = screen.getByRole('status', {
      name: /loading/i,
    });

    expect(spinner).toBeInTheDocument();
  });

  it('renders', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.queryByRole('status', { name: /loading/i })).not.toBeInTheDocument();
    });

    const data = await screen.findByText(/"id":\\s*1/);
    expect(data).toBeInTheDocument();
  });
});
`;
  }

  return `import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import App from '@/App';

describe('App', () => {
  it('renders project title', () => {
    render(<App />);

    expect(screen.getByText('Project Skeleton')).toBeInTheDocument();
  });
});
`;
}

function apiQueryTest(language, options) {
  if (language === 'ts') {
    return `import { QueryClient, QueryClientProvider, useSuspenseQuery } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';
import { ${options.queryExportName} } from '@api/${options.queryFileBase}';
import { server } from './mocks/server';
import { MOCK_API_RESPONSE } from './mocks/handlers';

import type { ReactNode } from 'react';

function createQueryClient() {
  return new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
}

function createWrapper() {
  const queryClient = createQueryClient();

  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}

describe('${options.resourcePath} API', () => {
  it('fetches data successfully', async () => {
    const { result } = renderHook(() => useSuspenseQuery(${options.queryExportName}), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.data).toBeDefined();
    });

    expect(result.current.data).toHaveLength(3);
  });

  it('returns mock data from MSW handler', async () => {
    const { result } = renderHook(() => useSuspenseQuery(${options.queryExportName}), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.data).toEqual(MOCK_API_RESPONSE);
    });
  });

  it('throws error on failed fetch', async () => {
    server.use(
      http.get('/api/${options.resourcePath}', () => {
        return new HttpResponse(null, { status: 500 });
      }),
    );

    const response = await fetch('/api/${options.resourcePath}');

    expect(response.ok).toBe(false);
    expect(response.status).toBe(500);
  });
});
`;
  }

  return `import { QueryClient, QueryClientProvider, useSuspenseQuery } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';
import { ${options.queryExportName} } from '@api/${options.queryFileBase}';
import { server } from './mocks/server';
import { MOCK_API_RESPONSE } from './mocks/handlers';

function createQueryClient() {
  return new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
}

function createWrapper() {
  const queryClient = createQueryClient();

  return ({ children }) => <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}

describe('${options.resourcePath} API', () => {
  it('fetches data successfully', async () => {
    const { result } = renderHook(() => useSuspenseQuery(${options.queryExportName}), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.data).toBeDefined();
    });

    expect(result.current.data).toHaveLength(3);
  });

  it('returns mock data from MSW handler', async () => {
    const { result } = renderHook(() => useSuspenseQuery(${options.queryExportName}), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.data).toEqual(MOCK_API_RESPONSE);
    });
  });

  it('throws error on failed fetch', async () => {
    server.use(
      http.get('/api/${options.resourcePath}', () => {
        return new HttpResponse(null, { status: 500 });
      }),
    );

    const response = await fetch('/api/${options.resourcePath}');

    expect(response.ok).toBe(false);
    expect(response.status).toBe(500);
  });
});
`;
}


export {
  apiQueryTest,
  errorBoundaryTest,
  frontendAppTest,
  spinnerTest,
  testHandlers,
  testServer,
  testSetup,
};
