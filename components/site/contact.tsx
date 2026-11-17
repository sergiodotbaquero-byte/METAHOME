import { ArrowUpRight } from "lucide-react"
import { SectionLine } from "@/components/site/section-head"
import { buttonVariants } from "@/components/ui/button"
import { site, whatsappHref } from "@/lib/site"

/**
 * Contacto. Un panel en Negro Metalizado, un nivel por encima del fondo: a la
 * izquierda lo que hay que hacer; a la derecha, la trama y la barra con su luz.
 */
export function Contact() {
  return (
    <section id="contacto" aria-labelledby="contacto-title" className="py-24 md:py-36">
      <div className="shell">
        <SectionLine n={5} label="Contacto" crumb="contacto" />

        {/* overflow-clip, no hidden: el panel recorta la luz sin volverse contenedor de scroll (ver .reveal). */}
        <div className="reveal relative mt-12 grid overflow-clip rounded-md border border-white/[0.06] bg-negro shadow-[inset_0_1px_0_rgb(255_255_255/0.05),0_40px_80px_-40px_rgb(0_0_0/0.6)] md:mt-16 lg:grid-cols-12">
          <div className="p-6 py-10 sm:p-10 lg:col-span-7 lg:p-14">
            <h2 id="contacto-title" className="type-display max-w-[15ch] text-balance text-heading">
              Cuéntanos qué tiene que resolver tu página.
            </h2>
            <p className="type-body mt-6 max-w-[44ch] text-body">
              Escríbenos por WhatsApp. Te respondemos con preguntas, no con una plantilla.
            </p>
            <div className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-5">
              <a
                href={whatsappHref}
                target="_blank"
                rel="noopener noreferrer"
                className={buttonVariants({ size: "lg", className: "h-12 px-5 text-base" })}
              >
                Escribir por WhatsApp
                <ArrowUpRight data-icon="inline-end" />
              </a>
              {site.email ? (
                <a
                  href={`mailto:${site.email}`}
                  className="type-crumb rounded-sm text-ultramar-claro underline-offset-4 transition-colors duration-150 hover:text-white hover:underline"
                >
                  {site.email}
                </a>
              ) : (
                <span className="type-crumb text-gris-texto">[tu correo]</span>
              )}
            </div>
            <dl className="type-crumb mt-12 grid max-w-md grid-cols-[6.5rem_1fr] gap-y-3 border-t border-white/[0.08] pt-6 text-gris-texto">
              <dt>whatsapp</dt>
              <dd className="text-niebla">{site.whatsappLabel}</dd>
              <dt>ciudad</dt>
              <dd className="text-niebla">{site.city}</dd>
            </dl>
          </div>

          {/* La trama y la barra. Sin texto encima. */}
          <div aria-hidden="true" className="relative hidden min-h-80 lg:col-span-5 lg:block">
            <div className="trama absolute inset-0 [--trama-color:var(--color-nivel-mas)] [mask-image:linear-gradient(to_right,transparent,#000_40%)]" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,rgb(65_104_255/0.3),transparent_55%)]" />
            <svg viewBox="0 0 100 100" className="absolute inset-0 size-full">
              <path
                d="M22 78 78 22"
                className="stroke-ultramar"
                strokeWidth={7}
                strokeLinecap="round"
                vectorEffect="non-scaling-stroke"
              />
            </svg>
          </div>
        </div>
      </div>
    </section>
  )
}
