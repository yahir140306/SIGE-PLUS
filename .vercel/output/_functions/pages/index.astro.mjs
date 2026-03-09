/* empty css                                 */
import { e as createComponent, m as maybeRenderHead, r as renderTemplate, g as addAttribute, k as renderComponent } from '../chunks/astro/server_CxmVvn8Q.mjs';
import 'piccolore';
import { $ as $$Layout } from '../chunks/Layout_B6fj8Jt8.mjs';
import { $ as $$Header, a as $$Footer } from '../chunks/Footer_B_UNc4vA.mjs';
import 'clsx';
export { renderers } from '../renderers.mjs';

const $$Hero = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${maybeRenderHead()}<section class="bg-secondary py-12 sm:py-16 text-center text-white border-b-4 sm:border-b-8 border-white"> <div class="max-w-4xl mx-auto px-4 sm:px-6"> <div class="inline-block bg-white/20 px-3 sm:px-4 py-1 rounded-full text-white font-bold text-[10px] sm:text-xs uppercase mb-3 sm:mb-4 tracking-widest">
Servicios Escolares
</div> <h1 class="text-3xl sm:text-4xl md:text-5xl font-bold mb-3 sm:mb-4 uppercase tracking-tighter">
Portal de Trámites y Servicios
</h1> <p class="text-base sm:text-lg opacity-90 max-w-2xl mx-auto font-medium leading-relaxed">
Bienvenido al centro administrativo digital de la UTSH. Gestiona tus
      documentos escolares de forma rápida.
</p> </div> </section>`;
}, "C:/Users/Juan Vahir/Documents/Project/SIGE-PLUS/sige-astro/src/components/Hero.astro", void 0);

const $$ServiceCards = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${maybeRenderHead()}<div class="grid md:grid-cols-2 gap-6 sm:gap-8 mb-12 sm:mb-16"> <div class="bg-white dark:bg-zinc-800 rounded-xl shadow-xl overflow-hidden group hover:-translate-y-1 transition-all duration-300 border border-gray-100 dark:border-zinc-700"> <div class="h-3 bg-secondary"></div> <div class="p-6 sm:p-8"> <div class="w-14 h-14 sm:w-16 sm:h-16 bg-secondary/10 dark:bg-secondary/20 rounded-full flex items-center justify-center mb-4 sm:mb-6 text-secondary"> <!-- <span class="material-symbols-outlined text-3xl sm:text-4xl"
          >person_add</span
        > --> <span class="text-3xl sm:text-4xl"></span> </div> <h3 class="text-xl sm:text-2xl font-bold text-secondary dark:text-white mb-2 sm:mb-3 tracking-tight">
Nuevo Ingreso
</h3> <p class="text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-4 sm:mb-6 leading-relaxed">
Si eres aspirante y deseas formar parte de nuestra comunidad
        universitaria, inicia aquí tu proceso de pre-registro y entrega de
        documentos.
</p> <ul class="mb-6 sm:mb-8 space-y-2"> <li class="flex items-center text-xs sm:text-sm text-gray-500 dark:text-zinc-400"> <!-- <span
            class="material-symbols-outlined text-green-500 text-base sm:text-lg mr-2"
            >check_circle</span
          > --> <span class="material-symbols-outlined text-green-500 text-base sm:text-lg mr-2"></span>
Convocatoria 2024-2025
</li> <li class="flex items-center text-xs sm:text-sm text-gray-500 dark:text-zinc-400"> <span class="material-symbols-outlined text-green-500 text-base sm:text-lg mr-2"></span>
Guía de pre-registro
</li> </ul> <a class="block w-full text-center bg-secondary text-white py-2.5 sm:py-3 rounded-lg font-bold text-sm sm:text-base hover:bg-opacity-90 transition-colors" href="/nuevo-ingreso/paso-1">
INICIAR INSCRIPCIÓN
</a> </div> </div> <div class="bg-white dark:bg-zinc-800 rounded-xl shadow-xl overflow-hidden group hover:-translate-y-1 transition-all duration-300 border border-gray-100 dark:border-zinc-700"> <div class="h-3 bg-primary"></div> <div class="p-6 sm:p-8"> <div class="w-14 h-14 sm:w-16 sm:h-16 bg-primary/10 dark:bg-primary/20 rounded-full flex items-center justify-center mb-4 sm:mb-6 text-primary"> <span class="material-symbols-outlined text-3xl sm:text-4xl"></span> </div> <h3 class="text-xl sm:text-2xl font-bold text-primary dark:text-white mb-2 sm:mb-3 tracking-tight">
Reinscripción
</h3> <p class="text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-4 sm:mb-6 leading-relaxed">
Para alumnos regulares que continúan sus estudios en el siguiente
        cuatrimestre. Consulta tus fechas y realiza tu pago en línea.
</p> <ul class="mb-6 sm:mb-8 space-y-2"> <li class="flex items-center text-xs sm:text-sm text-gray-500 dark:text-zinc-400"> <span class="material-symbols-outlined text-primary text-base sm:text-lg mr-2"></span>
Periodo: Mayo - Agosto
</li> <li class="flex items-center text-xs sm:text-sm text-gray-500 dark:text-zinc-400"> <span class="material-symbols-outlined text-primary text-base sm:text-lg mr-2"></span>
Pago referenciado disponible
</li> </ul> <a class="block w-full text-center bg-primary text-white py-2.5 sm:py-3 rounded-lg font-bold text-sm sm:text-base hover:bg-opacity-90 transition-colors" href="/reinscripcion/paso-1">
ACCESO ALUMNOS
</a> </div> </div> </div>`;
}, "C:/Users/Juan Vahir/Documents/Project/SIGE-PLUS/sige-astro/src/components/ServiceCards.astro", void 0);

const $$Tramites = createComponent(($$result, $$props, $$slots) => {
  const tramites = [
    {
      icon: "grade",
      title: "Consultar Calificaciones",
      description: "Accede a tu historial acad\xE9mico de manera inmediata y segura."
    },
    {
      icon: "receipt_long",
      title: "Referencia de Pago",
      description: "Genera y descarga tu formato de pago para tr\xE1mites escolares.",
      href: "/pagos-mensuales/paso-1"
    },
    {
      icon: "health_and_safety",
      title: "Seguro Facultativo",
      description: "Realiza tus tr\xE1mites de alta y vigencia ante el IMSS."
    },
    {
      icon: "description",
      title: "Constancias",
      description: "Solicitud de documentos oficiales para tr\xE1mites externos."
    },
    {
      icon: "school",
      title: "Titulaci\xF3n",
      description: "Gu\xEDa detallada y requisitos para el proceso de egreso."
    },
    {
      icon: "help_outline",
      title: "Preguntas Frecuentes",
      description: "Resuelve tus dudas administrativas de forma r\xE1pida."
    }
  ];
  return renderTemplate`${maybeRenderHead()}<section> <div class="mb-8 sm:mb-12 mt-8 sm:mt-12"> <h2 class="section-title text-xl sm:text-2xl font-bold px-4">
TRÁMITES FRECUENTES
</h2> </div> <div class="grid grid-cols-1 rounded-md sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8"> ${tramites.map((tramite) => renderTemplate`<a class="bg-white p-6 sm:p-8 border border-gray-100 shadow-lg flex flex-col items-center text-center group hover:border-secondary transition-colors"${addAttribute(tramite.href || "#", "href")}>  <h4 class="font-bold text-gray-800 uppercase text-xs sm:text-sm tracking-wide mb-2"> ${tramite.title} </h4> <p class="text-[10px] sm:text-xs text-gray-500"> ${tramite.description} </p> </a>`)} </div> </section>`;
}, "C:/Users/Juan Vahir/Documents/Project/SIGE-PLUS/sige-astro/src/components/Tramites.astro", void 0);

const $$Index = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${renderComponent($$result, "Layout", $$Layout, { "title": "Portal de Servicios Escolares - UTSH" }, { "default": ($$result2) => renderTemplate` ${renderComponent($$result2, "Header", $$Header, {})} ${renderComponent($$result2, "Hero", $$Hero, {})} ${maybeRenderHead()}<main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 mb-20"> ${renderComponent($$result2, "ServiceCards", $$ServiceCards, {})} ${renderComponent($$result2, "Tramites", $$Tramites, {})} </main> ${renderComponent($$result2, "Footer", $$Footer, {})} ` })}`;
}, "C:/Users/Juan Vahir/Documents/Project/SIGE-PLUS/sige-astro/src/pages/index.astro", void 0);

const $$file = "C:/Users/Juan Vahir/Documents/Project/SIGE-PLUS/sige-astro/src/pages/index.astro";
const $$url = "";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Index,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
