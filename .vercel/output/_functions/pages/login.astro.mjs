/* empty css                                 */
import { e as createComponent, k as renderComponent, l as renderScript, r as renderTemplate, m as maybeRenderHead } from '../chunks/astro/server_CxmVvn8Q.mjs';
import 'piccolore';
import { $ as $$Layout } from '../chunks/Layout_B6fj8Jt8.mjs';
import { $ as $$Header, a as $$Footer } from '../chunks/Footer_B_UNc4vA.mjs';
/* empty css                                 */
export { renderers } from '../renderers.mjs';

const $$Login = createComponent(async ($$result, $$props, $$slots) => {
  return renderTemplate`${renderComponent($$result, "Layout", $$Layout, { "title": "UTSH - Iniciar Sesi\xF3n", "data-astro-cid-sgpqyurt": true }, { "default": async ($$result2) => renderTemplate` ${renderComponent($$result2, "Header", $$Header, { "data-astro-cid-sgpqyurt": true })} ${maybeRenderHead()}<main class="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8" data-astro-cid-sgpqyurt> <div class="max-w-md w-full space-y-8" data-astro-cid-sgpqyurt> <div data-astro-cid-sgpqyurt> <h2 class="mt-6 text-center text-3xl font-extrabold text-slate-900 dark:text-white" data-astro-cid-sgpqyurt>
Iniciar Sesión
</h2> <p class="mt-2 text-center text-sm text-slate-600 dark:text-slate-400" data-astro-cid-sgpqyurt>
Ingresa con tu matrícula y contraseña para acceder al portal
</p> </div> <!-- Alert for errors --> <div id="alert-error" class="hidden bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4" data-astro-cid-sgpqyurt> <div class="flex items-start" data-astro-cid-sgpqyurt> <span class="material-symbols-outlined text-red-500 mr-3" data-astro-cid-sgpqyurt></span> <div data-astro-cid-sgpqyurt> <p class="text-sm font-medium text-red-800 dark:text-red-200" id="error-message" data-astro-cid-sgpqyurt></p> </div> </div> </div> <form id="login-form" class="mt-8 space-y-6" data-astro-cid-sgpqyurt> <div class="rounded-md shadow-sm space-y-4" data-astro-cid-sgpqyurt> <div data-astro-cid-sgpqyurt> <label for="matricula" class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2" data-astro-cid-sgpqyurt>
Matrícula
</label> <div class="relative" data-astro-cid-sgpqyurt> <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none" data-astro-cid-sgpqyurt> <span class="material-symbols-outlined text-slate-400" data-astro-cid-sgpqyurt></span> </div> <input id="matricula" name="matricula" type="text" required class="appearance-none block w-full pl-10 pr-3 py-3 border border-slate-300 dark:border-slate-700 rounded-lg placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-slate-800 text-slate-900 dark:text-white" placeholder="Ej: 2021004562" data-astro-cid-sgpqyurt> </div> </div> <div data-astro-cid-sgpqyurt> <label for="password" class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2" data-astro-cid-sgpqyurt>
Contraseña
</label> <div class="relative" data-astro-cid-sgpqyurt> <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none" data-astro-cid-sgpqyurt> <span class="material-symbols-outlined text-slate-400" data-astro-cid-sgpqyurt></span> </div> <input id="password" name="password" type="password" required class="appearance-none block w-full pl-10 pr-3 py-3 border border-slate-300 dark:border-slate-700 rounded-lg placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-slate-800 text-slate-900 dark:text-white" placeholder="••••••••" data-astro-cid-sgpqyurt> </div> </div> </div> <!-- Opción de scraping --> <div class="flex items-center justify-between py-3 px-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700" data-astro-cid-sgpqyurt> <div class="flex items-start" data-astro-cid-sgpqyurt> <span class="material-symbols-outlined text-primary mr-3 text-xl" data-astro-cid-sgpqyurt></span> <div data-astro-cid-sgpqyurt> <label for="use-scraping" class="text-sm font-medium text-slate-700 dark:text-slate-300 cursor-pointer" data-astro-cid-sgpqyurt>
Extraer datos del portal oficial
</label> <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5" data-astro-cid-sgpqyurt>
Se conectará automáticamente al portal de la universidad para
                obtener tus datos actualizados
</p> </div> </div> <div class="ml-3 flex-shrink-0" data-astro-cid-sgpqyurt> <label class="relative inline-flex items-center cursor-pointer" data-astro-cid-sgpqyurt> <input type="checkbox" id="use-scraping" class="sr-only peer" data-astro-cid-sgpqyurt> <div class="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 dark:peer-focus:ring-primary/40 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-primary" data-astro-cid-sgpqyurt></div> </label> </div> </div> <div data-astro-cid-sgpqyurt> <button type="submit" id="submit-btn" class="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors" data-astro-cid-sgpqyurt> <span class="absolute left-0 inset-y-0 flex items-center pl-3" data-astro-cid-sgpqyurt> <span class="material-symbols-outlined" data-astro-cid-sgpqyurt></span> </span> <span id="btn-text" data-astro-cid-sgpqyurt>Iniciar Sesión</span> <span id="btn-loading" class="hidden" data-astro-cid-sgpqyurt> <svg class="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" data-astro-cid-sgpqyurt> <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" data-astro-cid-sgpqyurt></circle> <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" data-astro-cid-sgpqyurt></path> </svg> </span> </button> </div> </form> </div> </main> ${renderComponent($$result2, "Footer", $$Footer, { "data-astro-cid-sgpqyurt": true })} ` })}  ${renderScript($$result, "C:/Users/Juan Vahir/Documents/Project/SIGE-PLUS/sige-astro/src/pages/login.astro?astro&type=script&index=0&lang.ts")}`;
}, "C:/Users/Juan Vahir/Documents/Project/SIGE-PLUS/sige-astro/src/pages/login.astro", void 0);

const $$file = "C:/Users/Juan Vahir/Documents/Project/SIGE-PLUS/sige-astro/src/pages/login.astro";
const $$url = "/login";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Login,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
