/* empty css                                    */
import { e as createComponent, k as renderComponent, l as renderScript, r as renderTemplate, m as maybeRenderHead } from '../../chunks/astro/server_CxmVvn8Q.mjs';
import 'piccolore';
import { $ as $$Layout } from '../../chunks/Layout_B6fj8Jt8.mjs';
export { renderers } from '../../renderers.mjs';

const $$Paso2 = createComponent(async ($$result, $$props, $$slots) => {
  return renderTemplate`${renderComponent($$result, "Layout", $$Layout, { "title": "UTSH - Gesti\xF3n de Pagos" }, { "default": async ($$result2) => renderTemplate` ${maybeRenderHead()}<main class="max-w-7xl mx-auto px-4 py-6 sm:py-8 sm:px-6 lg:px-8 flex-grow"> <!-- Styled Title with lateral lines --> <div class="flex items-center justify-center gap-3 sm:gap-4 mb-6 sm:mb-10"> <div class="hidden sm:block h-px flex-1 bg-gradient-to-r from-transparent via-primary to-primary"></div> <h1 class="text-xl sm:text-2xl md:text-3xl font-bold text-center uppercase tracking-wider text-primary dark:text-white px-4">
Gestión de Pagos Mensuales
</h1> <div class="hidden sm:block h-px flex-1 bg-gradient-to-l from-transparent via-primary to-primary"></div> </div> <!-- Student Summary Card --> <div class="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8"> <div class="lg:col-span-2 bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-4 sm:p-6 flex flex-col sm:flex-row gap-4 sm:gap-6 items-center"> <div class="relative flex-shrink-0"> <div class="w-20 h-20 sm:w-24 sm:h-24 rounded-xl bg-slate-100 dark:bg-slate-800 bg-cover bg-center border-2 border-primary/20 flex items-center justify-center"> <span class="material-symbols-outlined text-4xl sm:text-5xl text-slate-400"></span> </div> <div class="absolute -bottom-2 -right-2 bg-primary text-white text-[10px] px-2 py-0.5 sm:py-1 rounded-full font-bold">
ACTIVO
</div> </div> <div class="flex-1 text-center sm:text-left"> <div class="flex items-center justify-center sm:justify-start gap-2 mb-1 flex-wrap"> <h2 id="student-name" class="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
Cargando...
</h2> <span id="data-source-badge" class="hidden items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide"> <span class="material-symbols-outlined text-xs"></span> <span id="data-source-text"></span> </span> </div> <p id="student-info" class="text-slate-500 dark:text-slate-400 text-xs sm:text-sm mb-2 sm:mb-3">
ID: -- | --
</p> <div class="flex flex-wrap justify-center sm:justify-start gap-2 sm:gap-3"> <span id="student-semester" class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200">
Cuatrimestre: --
</span> <span id="student-average" class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/20">
Promedio: --
</span> </div> </div> <div class="flex flex-col sm:flex-row lg:flex-col gap-2 w-full sm:w-auto"> <button class="flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-white px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all"> <span class="material-symbols-outlined text-sm"></span>
Estado de Cuenta
</button> <button id="logout-btn" class="flex items-center justify-center gap-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all"> <span class="material-symbols-outlined text-sm"></span>
Cerrar Sesión
</button> </div> </div> <!-- GPA Alert Card --> <div id="gpa-alert" class="bg-secondary/5 dark:bg-secondary/10 rounded-xl border border-secondary/20 p-4 sm:p-6 flex flex-col justify-center"> <div class="flex items-start gap-3 sm:gap-4"> <div class="bg-secondary/20 p-2 rounded-lg text-secondary flex-shrink-0"> <span class="material-symbols-outlined text-base sm:text-xl"></span> </div> <div> <h3 class="font-bold text-secondary mb-1 text-xs sm:text-sm">
Aviso de Beca
</h3> <p id="gpa-message" class="text-[11px] sm:text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
Cargando información...
</p> </div> </div> </div> </div> <!-- Payment Table Container --> <div class="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden"> <div class="px-4 sm:px-6 py-3 sm:py-4 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"> <h3 class="font-bold text-base sm:text-lg text-slate-800 dark:text-slate-100">
Periodo: Enero - Abril 2026
</h3> <div class="flex items-center gap-2 text-[11px] sm:text-xs font-medium text-slate-500"> <span class="w-2 h-2 rounded-full bg-primary"></span> <span id="paid-count">0</span> Pagados
<span class="w-2 h-2 rounded-full bg-secondary ml-2"></span> <span id="pending-count">0</span> Pendientes
</div> </div> <!-- Desktop Table --> <div class="hidden md:block overflow-x-auto"> <table class="w-full text-left"> <thead class="bg-slate-50 dark:bg-slate-800/50"> <tr> <th class="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Mes de Pago</th> <th class="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Fecha Límite</th> <th class="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Concepto</th> <th class="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Monto</th> <th class="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Estatus</th> <th class="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Acción</th> </tr> </thead> <tbody id="payments-table" class="divide-y divide-slate-100 dark:divide-slate-800"> <!-- Payments will be loaded here dynamically --> </tbody> </table> </div> <!-- Mobile Cards --> <div id="payments-mobile" class="md:hidden divide-y divide-slate-100 dark:divide-slate-800"> <!-- Payment cards will be loaded here dynamically --> </div> </div> <!-- Additional Info / Support --> <div class="mt-6 sm:mt-8 flex flex-col md:flex-row gap-4 sm:gap-6"> <div class="flex-1 bg-maroon/5 dark:bg-maroon/10 rounded-xl p-4 sm:p-6 border border-maroon/10"> <div class="flex gap-3 sm:gap-4"> <span class="material-symbols-outlined text-maroon text-xl sm:text-2xl flex-shrink-0"></span> <div> <h4 class="font-bold text-maroon text-xs sm:text-sm mb-1">
¿Dudas con tus pagos?
</h4> <p class="text-[11px] sm:text-xs text-slate-600 dark:text-slate-400 mb-2 sm:mb-3 leading-relaxed">
Si has realizado un pago y no se refleja en el sistema, favor de
              acudir a la oficina de finanzas con tu comprobante original.
</p> <a class="text-[11px] sm:text-xs font-bold text-maroon underline" href="#">Contactar a soporte</a> </div> </div> </div> <div class="flex-1 bg-slate-100 dark:bg-slate-800/50 rounded-xl p-4 sm:p-6 border border-slate-200 dark:border-slate-700"> <div class="flex gap-3 sm:gap-4"> <span class="material-symbols-outlined text-slate-500 text-xl sm:text-2xl flex-shrink-0"></span> <div> <h4 class="font-bold text-slate-700 dark:text-slate-300 text-xs sm:text-sm mb-1">
Métodos de Pago
</h4> <p class="text-[11px] sm:text-xs text-slate-600 dark:text-slate-400 mb-2 sm:mb-3 leading-relaxed">
Puedes realizar tu pago en ventanilla bancaria (BBVA), cajeros
              inteligentes o vía transferencia electrónica con tu referencia
              única.
</p> <div class="flex gap-2"> <div class="h-6 w-10 bg-white dark:bg-slate-700 rounded border border-slate-200 dark:border-slate-600 flex items-center justify-center text-[10px] font-bold text-slate-400">
VISA
</div> <div class="h-6 w-10 bg-white dark:bg-slate-700 rounded border border-slate-200 dark:border-slate-600 flex items-center justify-center text-[10px] font-bold text-slate-400">
MC
</div> <div class="h-6 w-10 bg-white dark:bg-slate-700 rounded border border-slate-200 dark:border-slate-600 flex items-center justify-center text-[10px] font-bold text-slate-400">
SPEI
</div> </div> </div> </div> </div> </div> <!-- Back Button --> <div class="mt-6 sm:mt-8 text-center"> <button id="back-btn" class="inline-flex items-center gap-2 px-4 sm:px-6 py-2 sm:py-3 rounded-lg border-2 border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-400 font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-all text-sm sm:text-base"> <span class="material-symbols-outlined text-base"></span>
Regresar
</button> </div> </main> ` })} ${renderScript($$result, "C:/Users/Juan Vahir/Documents/Project/SIGE-PLUS/sige-astro/src/pages/pagos-mensuales/paso-2.astro?astro&type=script&index=0&lang.ts")}`;
}, "C:/Users/Juan Vahir/Documents/Project/SIGE-PLUS/sige-astro/src/pages/pagos-mensuales/paso-2.astro", void 0);

const $$file = "C:/Users/Juan Vahir/Documents/Project/SIGE-PLUS/sige-astro/src/pages/pagos-mensuales/paso-2.astro";
const $$url = "/pagos-mensuales/paso-2";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Paso2,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
