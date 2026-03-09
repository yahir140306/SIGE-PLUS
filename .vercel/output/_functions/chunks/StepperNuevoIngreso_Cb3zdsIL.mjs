import { e as createComponent, m as maybeRenderHead, g as addAttribute, r as renderTemplate, h as createAstro } from './astro/server_CxmVvn8Q.mjs';
import 'piccolore';
import 'clsx';

const $$Astro = createAstro();
const $$StepperNuevoIngreso = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$StepperNuevoIngreso;
  const { currentStep } = Astro2.props;
  const steps = [
    { number: 1, label: "Datos Personales" },
    { number: 2, label: "Antecedentes Acad\xE9micos" },
    { number: 3, label: "Selecci\xF3n de Carrera" },
    { number: 4, label: "Documentaci\xF3n" }
  ];
  const progressPercentage = currentStep / 4 * 100;
  return renderTemplate`${maybeRenderHead()}<div class="mb-12"> <div class="flex items-center justify-between mb-4"> <span class="text-sm font-bold text-primary uppercase tracking-wider">Paso ${currentStep} de 4</span> <span class="text-sm font-medium text-slate-500 dark:text-slate-400">${progressPercentage}% Completado</span> </div> <div class="w-full bg-slate-200 dark:bg-white/10 h-2 rounded-full overflow-hidden"> <div class="bg-primary h-full rounded-full transition-all duration-500"${addAttribute(`width: ${progressPercentage}%;`, "style")}></div> </div> <div class="relative pt-8"> <div class="absolute top-1/2 left-0 w-full h-1 bg-slate-200 dark:bg-slate-700 -translate-y-1/2 z-0 rounded-full"></div> <div class="absolute top-1/2 left-0 h-1 bg-primary -translate-y-1/2 z-0 rounded-full transition-all duration-500"${addAttribute(`width: ${(currentStep - 1) * 33.33}%;`, "style")}></div> <div class="relative z-10 flex justify-between gap-2"> ${steps.map((step) => renderTemplate`<div class="flex flex-col items-center gap-2 flex-1 min-w-0"> <div${addAttribute(`size-8 sm:size-10 rounded-full flex items-center justify-center font-bold text-xs sm:text-base border-4 border-background-light dark:border-background-dark transition-all ${step.number < currentStep ? "bg-primary text-white" : step.number === currentStep ? "bg-background-light dark:bg-background-dark border-primary text-primary shadow-lg" : "bg-slate-200 dark:bg-slate-700 text-slate-500"}`, "class")}> ${step.number < currentStep ? renderTemplate`<span class="material-symbols-outlined text-xs sm:text-sm">
check
</span>` : step.number} </div> <span${addAttribute(`text-[9px] sm:text-xs font-bold text-center max-w-[60px] sm:max-w-[80px] uppercase leading-tight ${step.number === currentStep ? "text-primary" : step.number < currentStep ? "text-slate-500" : "text-slate-400"}`, "class")}> ${step.label} </span> </div>`)} </div> </div> </div>`;
}, "C:/Users/Juan Vahir/Documents/Project/SIGE-PLUS/sige-astro/src/components/StepperNuevoIngreso.astro", void 0);

export { $$StepperNuevoIngreso as $ };
