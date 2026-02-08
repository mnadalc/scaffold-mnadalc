// @ts-nocheck

function backendIndexTs(answers, options) {
    const withZod = answers.includeBackendZod && options.includeMutationStarter;
    const zodImport = withZod ? "import { z } from 'zod';\n" : '';
    const starterModel = options.starter
        ? `type ${options.starter.typeName} = {
  id: string | number;
};
`
        : '';
    const starterStore = options.starter
        ? `
const ${options.starter.resourcePlural}: ${options.starter.typeName}[] = [
  { id: 1 },
  { id: 2 },
];
`
        : '';
    const zodSchema = withZod && options.includeMutationStarter
        ? `
const createPayloadSchema = z.object({
  id: z.union([z.string(), z.number()]),
});
`
        : '';
    const starterGetRoute = options.starter
        ? `
app.get('/api/${options.starter.resourcePath}', (_req, res) => {
  res.json(${options.starter.resourcePlural});
});
`
        : '';
    const postRoute = options.starter && options.includeMutationStarter
        ? withZod
            ? `
app.post('/api/${options.starter.resourcePath}', (req, res) => {
  const parsed = createPayloadSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten() });
  }

  ${options.starter.resourcePlural}.push(parsed.data);
  return res.status(201).json(parsed.data);
});
`
            : `
app.post('/api/${options.starter.resourcePath}', (req, res) => {
  const payload = req.body ?? {};
  ${options.starter.resourcePlural}.push(payload);
  return res.status(201).json(payload);
});
`
        : '';
    return `import cors from 'cors';
import express from 'express';
${zodImport}
${starterModel}

const app = express();
const port = Number(process.env.PORT ?? 3001);

app.use(
  cors({
    origin: 'http://localhost:5173',
  }),
);
app.use(express.json());
${starterStore}${zodSchema}
app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

${starterGetRoute}
${postRoute}
app.listen(port, () => {
  console.log('Server listening at http://localhost:' + port);
});
`;
}
function backendIndexJs(answers, options) {
    const withZod = answers.includeBackendZod && options.includeMutationStarter;
    const zodImport = withZod ? "import { z } from 'zod';\n" : '';
    const starterStore = options.starter
        ? `
const ${options.starter.resourcePlural} = [{ id: 1 }, { id: 2 }];
`
        : '';
    const zodSchema = withZod && options.includeMutationStarter
        ? `
const createPayloadSchema = z.object({
  id: z.union([z.string(), z.number()]),
});
`
        : '';
    const starterGetRoute = options.starter
        ? `
app.get('/api/${options.starter.resourcePath}', (_req, res) => {
  res.json(${options.starter.resourcePlural});
});
`
        : '';
    const postRoute = options.starter && options.includeMutationStarter
        ? withZod
            ? `
app.post('/api/${options.starter.resourcePath}', (req, res) => {
  const parsed = createPayloadSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten() });
  }

  ${options.starter.resourcePlural}.push(parsed.data);
  return res.status(201).json(parsed.data);
});
`
            : `
app.post('/api/${options.starter.resourcePath}', (req, res) => {
  const payload = req.body ?? {};
  ${options.starter.resourcePlural}.push(payload);
  return res.status(201).json(payload);
});
`
        : '';
    return `import cors from 'cors';
import express from 'express';
${zodImport}
const app = express();
const port = Number(process.env.PORT ?? 3001);

app.use(
  cors({
    origin: 'http://localhost:5173',
  }),
);
app.use(express.json());
${starterStore}${zodSchema}
app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

${starterGetRoute}
${postRoute}
app.listen(port, () => {
  console.log('Server listening at http://localhost:' + port);
});
`;
}

export { backendIndexJs, backendIndexTs };
