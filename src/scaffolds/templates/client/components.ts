// @ts-nocheck

function errorBoundaryComponent(language) {
    if (language === 'ts') {
        return `import { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';

type ErrorBoundaryProps = {
  children: ReactNode;
};

type ErrorBoundaryState = {
  hasError: boolean;
};

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: Readonly<ErrorInfo>) {
    console.error(
      '%c[ERROR] ErrorBoundary caught an error:',
      'color: red; font-weight: bold;',
      error,
      info.componentStack,
      info,
    );
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen items-center justify-center p-4">
          <div className="max-w-md rounded-lg border border-red-300 bg-red-50 p-6">
            <h2 className="mb-2 text-lg font-semibold text-red-800">Something went wrong</h2>

            <p className="mb-4 text-sm text-red-700">
              An unexpected error occurred. Please try reloading the page.
            </p>

            <button
              className="rounded bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
              onClick={() => window.location.reload()}
              type="button">
              Reload page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
`;
    }
    return `import { Component } from 'react';

export class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.error(
      '%c[ERROR] ErrorBoundary caught an error:',
      'color: red; font-weight: bold;',
      error,
      info.componentStack,
      info,
    );
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen items-center justify-center p-4">
          <div className="max-w-md rounded-lg border border-red-300 bg-red-50 p-6">
            <h2 className="mb-2 text-lg font-semibold text-red-800">Something went wrong</h2>

            <p className="mb-4 text-sm text-red-700">
              An unexpected error occurred. Please try reloading the page.
            </p>

            <button
              className="rounded bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
              onClick={() => window.location.reload()}
              type="button">
              Reload page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
`;
}
function spinnerComponent() {
    return `const Spinner = () => {
  return (
    <div aria-busy="true" aria-live="polite" aria-labelledby="loading" role="status">
      <svg
        className="mr-3 -ml-1 text-blue-500 animate-spin size-8"
        fill="none"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
        focusable="false">
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>

      <span className="sr-only" id="loading" aria-label="Loading...">
        Loading...
      </span>
    </div>
  );
};

export default Spinner;
`;
}

export { errorBoundaryComponent, spinnerComponent };
