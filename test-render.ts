import { createElement } from 'react';
import { renderToString } from 'react-dom/server';

global.localStorage = {
  getItem: () => null,
  setItem: () => {},
  removeItem: () => {},
  clear: () => {}
} as any;

import App from './src/App.tsx';

try {
  const html = renderToString(createElement(App));
  console.log("Rendered successfully");
} catch(e) {
  console.error("Render failed:");
  console.error(e);
}
