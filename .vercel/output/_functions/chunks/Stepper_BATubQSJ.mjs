import { e as createComponent, m as maybeRenderHead, g as addAttribute, r as renderTemplate, h as createAstro } from './astro/server_CxmVvn8Q.mjs';
import 'piccolore';
import 'clsx';

const $$Astro = createAstro();
const $$Stepper = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$Stepper;
  const { currentStep } = Astro2.props;
  const steps = [
    { number: 1, label: "Validaci\xF3n" },
    { number: 2, label: "Documentos" },
    { number: 3, label: "Pago" },
    { number: 4, label: "Finalizar" }
  ];
  return renderTemplate`${maybeRenderHead()}<div class="mb-10"> <div class="flex items-center justify-between relative mb-4"> <div class="absolute top-1/2 left-0 w-full h-1 bg-slate-200 dark:bg-slate-700 -z-10 transform -translate-y-1/2"></div> ${steps.map((step) => renderTemplate`<div class="flex flex-col items-center flex-1 min-w-0"> <div${addAttribute(`size-8 sm:size-10 rounded-full flex items-center justify-center font-bold text-xs sm:text-base ring-4 ring-background-light dark:ring-background-dark transition-all ${step.number < currentStep ? "bg-primary text-white" : step.number === currentStep ? "bg-primary text-white" : "bg-slate-200 dark:bg-slate-700 text-slate-500"}`, "class")}> ${step.number < currentStep ? renderTemplate`<span class="material-symbols-outlined text-sm sm:text-lg">
check
</span>` : step.number} </div> <span${addAttribute(`text-[9px] sm:text-xs mt-2 font-medium uppercase tracking-tighter text-center leading-tight max-w-[60px] sm:max-w-[80px] ${step.number === currentStep ? "text-primary font-bold" : "text-slate-500"}`, "class")}> ${step.label} </span> </div>`)} </div> </div>`;
}, "C:/Users/Juan Vahir/Documents/Project/SIGE-PLUS/sige-astro/src/components/Stepper.astro", void 0);

export { $$Stepper as $ };
