/* empty css                                 */
import { e as createComponent, k as renderComponent, l as renderScript, r as renderTemplate, m as maybeRenderHead } from '../chunks/astro/server_CxmVvn8Q.mjs';
import 'piccolore';
import { $ as $$Layout } from '../chunks/Layout_B6fj8Jt8.mjs';
import { $ as $$Header, a as $$Footer } from '../chunks/Footer_B_UNc4vA.mjs';
/* empty css                                      */
export { renderers } from '../renderers.mjs';

const $$SigeLogin = createComponent(async ($$result, $$props, $$slots) => {
  return renderTemplate`${renderComponent($$result, "Layout", $$Layout, { "title": "UTSH - Iniciar Sesi\xF3n en Portal Oficial", "data-astro-cid-difrgljr": true }, { "default": async ($$result2) => renderTemplate` ${renderComponent($$result2, "Header", $$Header, { "data-astro-cid-difrgljr": true })} ${maybeRenderHead()}<main class="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 py-12 px-4" data-astro-cid-difrgljr> <div class="max-w-6xl mx-auto" data-astro-cid-difrgljr> <!-- Instrucciones --> <div class="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-8 mb-6" data-astro-cid-difrgljr> <div class="flex items-start gap-4" data-astro-cid-difrgljr> <div class="flex-shrink-0" data-astro-cid-difrgljr> <span class="material-symbols-outlined text-4xl text-primary" data-astro-cid-difrgljr>info</span> </div> <div data-astro-cid-difrgljr> <h2 class="text-2xl font-bold text-slate-900 dark:text-white mb-3" data-astro-cid-difrgljr>
Acceso al Portal Oficial SIGE
</h2> <p class="text-slate-600 dark:text-slate-300 mb-4" data-astro-cid-difrgljr>
Para tu seguridad, inicia sesión directamente en el portal oficial
              de la UTSH. Una vez que inicies sesión exitosamente, tus datos
              serán sincronizados automáticamente con nuestra plataforma.
</p> <div class="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4" data-astro-cid-difrgljr> <p class="text-sm text-blue-800 dark:text-blue-200" data-astro-cid-difrgljr> <strong data-astro-cid-difrgljr>Instrucciones:</strong> </p> <ol class="list-decimal list-inside text-sm text-blue-700 dark:text-blue-300 mt-2 space-y-1" data-astro-cid-difrgljr> <li data-astro-cid-difrgljr>
Haz clic en el botón "Abrir Portal SIGE" para abrir una
                  ventana nueva
</li> <li data-astro-cid-difrgljr>
Inicia sesión con tu matrícula y contraseña en el portal
                  oficial
</li> <li data-astro-cid-difrgljr>Regresa a esta página y haz clic en "Sincronizar Datos"</li> <li data-astro-cid-difrgljr>Tus datos se importarán automáticamente de forma segura</li> </ol> </div> </div> </div> </div> <!-- Estado de la sincronización --> <div id="sync-status" class="hidden mb-6" data-astro-cid-difrgljr> <div class="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-6" data-astro-cid-difrgljr> <div class="flex items-center gap-4" data-astro-cid-difrgljr> <div class="animate-spin" data-astro-cid-difrgljr> <span class="material-symbols-outlined text-3xl text-primary" data-astro-cid-difrgljr>sync</span> </div> <div data-astro-cid-difrgljr> <h3 class="text-lg font-semibold text-slate-900 dark:text-white" data-astro-cid-difrgljr>
Sincronizando datos...
</h3> <p class="text-sm text-slate-600 dark:text-slate-400" id="sync-message" data-astro-cid-difrgljr>
Extrayendo información del portal SIGE
</p> </div> </div> </div> </div> <!-- Alert --> <div id="alert-container" class="hidden mb-6" data-astro-cid-difrgljr> <div id="alert" class="rounded-2xl shadow-xl p-6" data-astro-cid-difrgljr> <div class="flex items-start gap-4" data-astro-cid-difrgljr> <span class="material-symbols-outlined text-3xl" id="alert-icon" data-astro-cid-difrgljr></span> <div class="flex-1" data-astro-cid-difrgljr> <h3 class="text-lg font-semibold mb-2" id="alert-title" data-astro-cid-difrgljr></h3> <p class="text-sm" id="alert-message" data-astro-cid-difrgljr></p> </div> <button onclick="document.getElementById('alert-container').classList.add('hidden')" class="text-slate-400 hover:text-slate-600" data-astro-cid-difrgljr> <span class="material-symbols-outlined" data-astro-cid-difrgljr>close</span> </button> </div> </div> </div> <!-- Panel de Control --> <div class="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-8" data-astro-cid-difrgljr> <div class="grid md:grid-cols-2 gap-6" data-astro-cid-difrgljr> <!-- Opción 1: Abrir Portal --> <div class="border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-xl p-6 hover:border-primary transition-colors" data-astro-cid-difrgljr> <div class="text-center" data-astro-cid-difrgljr> <div class="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-4" data-astro-cid-difrgljr> <span class="material-symbols-outlined text-3xl text-primary" data-astro-cid-difrgljr>open_in_new</span> </div> <h3 class="text-xl font-bold text-slate-900 dark:text-white mb-2" data-astro-cid-difrgljr>
Paso 1: Abrir Portal
</h3> <p class="text-sm text-slate-600 dark:text-slate-400 mb-6" data-astro-cid-difrgljr>
Abre el portal oficial del SIGE en una nueva ventana e inicia
                sesión normalmente
</p> <button id="btn-open-portal" class="w-full bg-primary hover:bg-primary/90 text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2" data-astro-cid-difrgljr> <span class="material-symbols-outlined" data-astro-cid-difrgljr>launch</span>
Abrir Portal SIGE
</button> </div> </div> <!-- Opción 2: Sincronizar --> <div class="border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-xl p-6 hover:border-primary transition-colors" data-astro-cid-difrgljr> <div class="text-center" data-astro-cid-difrgljr> <div class="inline-flex items-center justify-center w-16 h-16 bg-green-500/10 rounded-full mb-4" data-astro-cid-difrgljr> <span class="material-symbols-outlined text-3xl text-green-500" data-astro-cid-difrgljr>sync</span> </div> <h3 class="text-xl font-bold text-slate-900 dark:text-white mb-2" data-astro-cid-difrgljr>
Paso 2: Sincronizar
</h3> <p class="text-sm text-slate-600 dark:text-slate-400 mb-6" data-astro-cid-difrgljr>
Después de iniciar sesión en el portal, sincroniza tus datos
                aquí
</p> <button id="btn-sync" class="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2" data-astro-cid-difrgljr> <span class="material-symbols-outlined" data-astro-cid-difrgljr>download</span>
Sincronizar Datos
</button> </div> </div> </div> <!-- Método alternativo --> <div class="mt-8 pt-8 border-t border-slate-200 dark:border-slate-700" data-astro-cid-difrgljr> <details class="group" data-astro-cid-difrgljr> <summary class="cursor-pointer flex items-center justify-between text-slate-700 dark:text-slate-300 font-medium" data-astro-cid-difrgljr> <span data-astro-cid-difrgljr>💡 Método alternativo (para usuarios avanzados)</span> <span class="material-symbols-outlined group-open:rotate-180 transition-transform" data-astro-cid-difrgljr>
expand_more
</span> </summary> <div class="mt-4 bg-slate-50 dark:bg-slate-900/50 rounded-lg p-4" data-astro-cid-difrgljr> <p class="text-sm text-slate-600 dark:text-slate-400 mb-3" data-astro-cid-difrgljr>
Si ya iniciaste sesión en el portal SIGE en otra pestaña, puedes
                copiar tu cookie de sesión:
</p> <ol class="list-decimal list-inside text-sm text-slate-600 dark:text-slate-400 space-y-2 mb-4" data-astro-cid-difrgljr> <li data-astro-cid-difrgljr>Abre el portal SIGE en otra pestaña e inicia sesión</li> <li data-astro-cid-difrgljr>
Presiona <kbd class="px-2 py-1 bg-slate-200 dark:bg-slate-700 rounded" data-astro-cid-difrgljr>F12</kbd> para abrir DevTools
</li> <li data-astro-cid-difrgljr>
En la consola, escribe: <code class="bg-slate-200 dark:bg-slate-700 px-2 py-1 rounded" data-astro-cid-difrgljr>document.cookie</code> </li> <li data-astro-cid-difrgljr>Copia el valor de <strong data-astro-cid-difrgljr>PHPSESSID</strong></li> <li data-astro-cid-difrgljr>Pégalo aquí abajo:</li> </ol> <div class="flex gap-2" data-astro-cid-difrgljr> <input type="text" id="manual-cookie" placeholder="PHPSESSID=k4u7stltn6f3ch8cv30601ll62" class="flex-1 px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary text-sm font-mono" data-astro-cid-difrgljr> <button id="btn-manual-sync" class="bg-primary hover:bg-primary/90 text-white px-6 py-2 rounded-lg font-medium" data-astro-cid-difrgljr>
Usar Cookie
</button> </div> </div> </details> </div> </div> <!-- Información de seguridad --> <div class="mt-6 text-center text-sm text-slate-500 dark:text-slate-400" data-astro-cid-difrgljr> <p class="flex items-center justify-center gap-2" data-astro-cid-difrgljr> <span class="material-symbols-outlined text-lg" data-astro-cid-difrgljr>lock</span>
Tus datos están protegidos y encriptados. Nunca almacenamos tu contraseña.
</p> </div> </div> </main> ${renderComponent($$result2, "Footer", $$Footer, { "data-astro-cid-difrgljr": true })} ` })} ${renderScript($$result, "C:/Users/Juan Vahir/Documents/Project/SIGE-PLUS/sige-astro/src/pages/sige-login.astro?astro&type=script&index=0&lang.ts")} `;
}, "C:/Users/Juan Vahir/Documents/Project/SIGE-PLUS/sige-astro/src/pages/sige-login.astro", void 0);

const $$file = "C:/Users/Juan Vahir/Documents/Project/SIGE-PLUS/sige-astro/src/pages/sige-login.astro";
const $$url = "/sige-login";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$SigeLogin,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
