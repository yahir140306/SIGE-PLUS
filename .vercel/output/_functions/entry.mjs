import { renderers } from './renderers.mjs';
import { c as createExports, s as serverEntrypointModule } from './chunks/_@astrojs-ssr-adapter_sTTMlAda.mjs';
import { manifest } from './manifest_cnku5sbt.mjs';

const serverIslandMap = new Map();;

const _page0 = () => import('./pages/_image.astro.mjs');
const _page1 = () => import('./pages/api/auth/login.astro.mjs');
const _page2 = () => import('./pages/api/auth/scrape.astro.mjs');
const _page3 = () => import('./pages/api/sige/academic-data.astro.mjs');
const _page4 = () => import('./pages/api/sige/extract-data.astro.mjs');
const _page5 = () => import('./pages/api/sige/save-to-db.astro.mjs');
const _page6 = () => import('./pages/login.astro.mjs');
const _page7 = () => import('./pages/nuevo-ingreso/paso-1.astro.mjs');
const _page8 = () => import('./pages/nuevo-ingreso/paso-2.astro.mjs');
const _page9 = () => import('./pages/nuevo-ingreso/paso-3.astro.mjs');
const _page10 = () => import('./pages/nuevo-ingreso/paso-4.astro.mjs');
const _page11 = () => import('./pages/pagos-mensuales/paso-1.astro.mjs');
const _page12 = () => import('./pages/pagos-mensuales/paso-2.astro.mjs');
const _page13 = () => import('./pages/reinscripcion/paso-1.astro.mjs');
const _page14 = () => import('./pages/reinscripcion/paso-2.astro.mjs');
const _page15 = () => import('./pages/reinscripcion/paso-3.astro.mjs');
const _page16 = () => import('./pages/sige-login.astro.mjs');
const _page17 = () => import('./pages/index.astro.mjs');
const pageMap = new Map([
    ["node_modules/astro/dist/assets/endpoint/generic.js", _page0],
    ["src/pages/api/auth/login.ts", _page1],
    ["src/pages/api/auth/scrape.ts", _page2],
    ["src/pages/api/sige/academic-data.ts", _page3],
    ["src/pages/api/sige/extract-data.ts", _page4],
    ["src/pages/api/sige/save-to-db.ts", _page5],
    ["src/pages/login.astro", _page6],
    ["src/pages/nuevo-ingreso/paso-1.astro", _page7],
    ["src/pages/nuevo-ingreso/paso-2.astro", _page8],
    ["src/pages/nuevo-ingreso/paso-3.astro", _page9],
    ["src/pages/nuevo-ingreso/paso-4.astro", _page10],
    ["src/pages/pagos-mensuales/paso-1.astro", _page11],
    ["src/pages/pagos-mensuales/paso-2.astro", _page12],
    ["src/pages/reinscripcion/paso-1.astro", _page13],
    ["src/pages/reinscripcion/paso-2.astro", _page14],
    ["src/pages/reinscripcion/paso-3.astro", _page15],
    ["src/pages/sige-login.astro", _page16],
    ["src/pages/index.astro", _page17]
]);

const _manifest = Object.assign(manifest, {
    pageMap,
    serverIslandMap,
    renderers,
    actions: () => import('./noop-entrypoint.mjs'),
    middleware: () => import('./_noop-middleware.mjs')
});
const _args = {
    "middlewareSecret": "ae7ed2aa-7f43-4996-9742-2658a3909de0",
    "skewProtection": false
};
const _exports = createExports(_manifest, _args);
const __astrojsSsrVirtualEntry = _exports.default;
const _start = 'start';
if (Object.prototype.hasOwnProperty.call(serverEntrypointModule, _start)) ;

export { __astrojsSsrVirtualEntry as default, pageMap };
