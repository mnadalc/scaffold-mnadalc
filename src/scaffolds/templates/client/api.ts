// @ts-nocheck
import { toPascal } from '../../shared.js';

function domainTypeFile(language, withZod, context) {
    const { schemaName, arraySchemaName, typeName } = context;
    if (language === 'ts' && withZod) {
        return `import { z } from 'zod';

export const ${schemaName} = z.object({
  id: z.union([z.string(), z.number()]),
  // TODO: Add your domain fields here.
});
export type ${typeName} = z.infer<typeof ${schemaName}>;

export const ${arraySchemaName} = z.array(${schemaName});
`;
    }
    if (language === 'ts') {
        return `export type ${typeName} = {
  id: string | number;
};
`;
    }
    if (withZod) {
        return `import { z } from 'zod';

export const ${schemaName} = z.object({
  id: z.union([z.string(), z.number()]),
  // TODO: Add your domain fields here.
});

export const ${arraySchemaName} = z.array(${schemaName});
`;
    }
    return `export const MOCK_ITEMS = [{ id: 1 }, { id: 2 }];
`;
}
function queryTemplate(language, options) {
    const keyLiteral = options.resourcePath;
    const queryConst = options.queryExportName;
    const fetchFn = `fetch${toPascal(options.queryExportName)}`;
    const queryError = `Failed to fetch ${keyLiteral}`;
    if (language === 'ts' && options.withZod) {
        return `import { queryOptions } from '@tanstack/react-query';
import type { QueryFunction } from '@tanstack/react-query';
import { ${options.arraySchemaName} } from '${options.typePath}';
import type { ${options.typeName} } from '${options.typePath}';

const ${fetchFn}: QueryFunction<${options.typeName}[], readonly ['${keyLiteral}']> = async ({ signal }) => {
  const response = await fetch('/api/${keyLiteral}', { signal });

  if (!response.ok) {
    throw new Error('${queryError}', { cause: new Error(\`Request failed with status \${response.status}\`) });
  }

  try {
    const data = await response.json();
    const validatedData = ${options.arraySchemaName}.safeParse(data);

    if (validatedData.error?.issues) {
      throw new Error(
        \`Invalid ${keyLiteral} response: \${validatedData.error.issues.map((issue) => issue.message).join(', ')}\`,
        { cause: validatedData.error },
      );
    }

    return validatedData.data ?? [];
  } catch (error) {
    throw new Error(\`${queryError}: \${error}\`, { cause: error });
  }
};

export const ${queryConst} = queryOptions({
  queryKey: ['${keyLiteral}'] as const,
  queryFn: ${fetchFn},
});
`;
    }
    if (language === 'ts') {
        return `import { queryOptions } from '@tanstack/react-query';
import type { QueryFunction } from '@tanstack/react-query';
import type { ${options.typeName} } from '${options.typePath}';

const ${fetchFn}: QueryFunction<${options.typeName}[], readonly ['${keyLiteral}']> = async ({ signal }) => {
  const response = await fetch('/api/${keyLiteral}', { signal });

  if (!response.ok) {
    throw new Error('${queryError}', { cause: new Error(\`Request failed with status \${response.status}\`) });
  }

  try {
    return (await response.json()) as ${options.typeName}[];
  } catch (error) {
    throw new Error(\`${queryError}: \${error}\`, { cause: error });
  }
};

export const ${queryConst} = queryOptions({
  queryKey: ['${keyLiteral}'] as const,
  queryFn: ${fetchFn},
});
`;
    }
    if (options.withZod) {
        return `import { queryOptions } from '@tanstack/react-query';
import { ${options.arraySchemaName} } from '${options.typePath}';

const ${fetchFn} = async ({ signal }) => {
  const response = await fetch('/api/${keyLiteral}', { signal });

  if (!response.ok) {
    throw new Error('${queryError}', { cause: new Error(\`Request failed with status \${response.status}\`) });
  }

  try {
    const data = await response.json();
    const validatedData = ${options.arraySchemaName}.safeParse(data);

    if (validatedData.error?.issues) {
      throw new Error(
        \`Invalid ${keyLiteral} response: \${validatedData.error.issues.map((issue) => issue.message).join(', ')}\`,
        { cause: validatedData.error },
      );
    }

    return validatedData.data ?? [];
  } catch (error) {
    throw new Error(\`${queryError}: \${error}\`, { cause: error });
  }
};

export const ${queryConst} = queryOptions({
  queryKey: ['${keyLiteral}'],
  queryFn: ${fetchFn},
});
`;
    }
    return `import { queryOptions } from '@tanstack/react-query';

const ${fetchFn} = async ({ signal }) => {
  const response = await fetch('/api/${keyLiteral}', { signal });

  if (!response.ok) {
    throw new Error('${queryError}', { cause: new Error(\`Request failed with status \${response.status}\`) });
  }

  return response.json();
};

export const ${queryConst} = queryOptions({
  queryKey: ['${keyLiteral}'],
  queryFn: ${fetchFn},
});
`;
}
function mutationTemplate(language, options) {
    const mutationFn = options.mutationExportName;
    const payloadType = `${toPascal(options.mutationExportName)}Payload`;
    const hookName = `use${toPascal(options.mutationExportName)}`;
    if (language === 'ts' && options.withZod) {
        return `import { useMutation } from '@tanstack/react-query';
import type { MutationFunction } from '@tanstack/react-query';
import * as z from 'zod/mini';
import { ${options.schemaName} } from '${options.typePath}';
import type { ${options.typeName} } from '${options.typePath}';

const ${payloadType}Schema = z.object({
  id: z.union([z.string(), z.number()]),
});

export type ${payloadType} = z.infer<typeof ${payloadType}Schema>;

const ${mutationFn}: MutationFunction<${options.typeName}, ${payloadType}> = async (payload) => {
  const validatedPayload = ${payloadType}Schema.safeParse(payload);

  if (validatedPayload.error?.issues) {
    throw new Error(
      \`Invalid ${mutationFn} payload: \${validatedPayload.error.issues.map((issue) => issue.message).join(', ')}\`,
      { cause: validatedPayload.error },
    );
  }

  const response = await fetch('/api/${options.resourcePath}', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(validatedPayload.data),
  });

  if (!response.ok) {
    throw new Error('Failed to send mutation payload', {
      cause: new Error(\`Request failed with status \${response.status}\`),
    });
  }

  const data = await response.json();
  const validatedResponse = ${options.schemaName}.safeParse(data);

  if (validatedResponse.error?.issues) {
    throw new Error(
      \`Invalid ${mutationFn} response: \${validatedResponse.error.issues.map((issue) => issue.message).join(', ')}\`,
      { cause: validatedResponse.error },
    );
  }

  return validatedResponse.data;
};

const ${hookName} = () => {
  return useMutation({
    mutationFn: ${mutationFn},
    retry: 2,
    retryDelay: 1000,
    onError: (error) => {
      console.error('Mutation failed:', error);
    },
  });
};

export { ${hookName}, ${mutationFn} };
`;
    }
    if (language === 'ts') {
        return `import { useMutation } from '@tanstack/react-query';
import type { MutationFunction } from '@tanstack/react-query';
import type { ${options.typeName} } from '${options.typePath}';

type ${payloadType} = {
  id: string | number;
};

const ${mutationFn}: MutationFunction<${options.typeName}, ${payloadType}> = async (payload) => {
  const response = await fetch('/api/${options.resourcePath}', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error('Failed to send mutation payload', {
      cause: new Error(\`Request failed with status \${response.status}\`),
    });
  }

  return (await response.json()) as ${options.typeName};
};

const ${hookName} = () => {
  return useMutation({
    mutationFn: ${mutationFn},
    retry: 2,
    retryDelay: 1000,
    onError: (error) => {
      console.error('Mutation failed:', error);
    },
  });
};

export { ${hookName}, ${mutationFn} };
`;
    }
    if (options.withZod) {
        return `import { useMutation } from '@tanstack/react-query';
import * as z from 'zod/mini';

const ${payloadType}Schema = z.object({
  id: z.union([z.string(), z.number()]),
});

export const ${mutationFn} = async (payload) => {
  const validatedPayload = ${payloadType}Schema.safeParse(payload);

  if (validatedPayload.error?.issues) {
    throw new Error(
      \`Invalid ${mutationFn} payload: \${validatedPayload.error.issues.map((issue) => issue.message).join(', ')}\`,
      { cause: validatedPayload.error },
    );
  }

  const response = await fetch('/api/${options.resourcePath}', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(validatedPayload.data),
  });

  if (!response.ok) {
    throw new Error('Failed to send mutation payload', {
      cause: new Error(\`Request failed with status \${response.status}\`),
    });
  }

  return response.json();
};

const ${hookName} = () => {
  return useMutation({
    mutationFn: ${mutationFn},
    retry: 2,
    retryDelay: 1000,
    onError: (error) => {
      console.error('Mutation failed:', error);
    },
  });
};

export { ${hookName} };
`;
    }
    return `import { useMutation } from '@tanstack/react-query';

const ${mutationFn} = async (payload) => {
  const response = await fetch('/api/${options.resourcePath}', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error('Failed to send mutation payload', {
      cause: new Error(\`Request failed with status \${response.status}\`),
    });
  }

  return response.json();
};

const ${hookName} = () => {
  return useMutation({
    mutationFn: ${mutationFn},
    retry: 2,
    retryDelay: 1000,
    onError: (error) => {
      console.error('Mutation failed:', error);
    },
  });
};

export { ${hookName}, ${mutationFn} };
`;
}

export { domainTypeFile, mutationTemplate, queryTemplate };
