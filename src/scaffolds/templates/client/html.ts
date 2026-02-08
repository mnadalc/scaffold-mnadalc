// @ts-nocheck
import { hasGroup } from '../../shared.js';

function frontendIndexCss(answers) {
  if (hasGroup(answers, 'tailwind')) {
    return `@import 'tailwindcss';

:root {
  font-family: Inter, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}

body {
  margin: 0;
  min-height: 100vh;
}
`;
  }

  return `:root {
  font-family: Inter, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  color: #111827;
  background-color: #f8fafc;
}

body {
  margin: 0;
  min-height: 100vh;
}
`;
}

function frontendIndexHtml(projectName) {
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${projectName}</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
`;
}

function frontendIndexHtmlJs(projectName) {
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${projectName}</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
`;
}

export { frontendIndexCss, frontendIndexHtml, frontendIndexHtmlJs };
