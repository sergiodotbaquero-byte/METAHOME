import { LogoApilado } from "@/components/brand/logo"
import { nav, site, whatsappHref } from "@/lib/site"

export function SiteFooter() {
  return (
    <footer className="border-t border-line bg-hondo">
      <div className="shell grid gap-12 py-16 md:grid-cols-12 md:py-20">
        <div className="md:col-span-5">
          <LogoApilado />
          <p className="mt-6 max-w-[30ch] text-gris-texto">{site.tagline} Diseño y desarrollo web.</p>
        </div>
        <nav aria-label="Pie de página" className="md:col-span-3">
          <ul className="type-crumb space-y-1 text-gris-texto md:space-y-1.5">
            {nav.map((item) => (
              <li key={item.href}>
                <a href={item.href} className="inline-block rounded-sm py-1.5 transition-colors duration-150 hover:text-white md:py-1">
                  <span aria-hidden="true" className="mr-2 text-ultramar-claro">
                    /
                  </span>
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <ul className="type-crumb space-y-1 text-gris-texto md:col-span-4 md:space-y-1.5">
          <li>
            <a
              href={whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block rounded-sm py-1.5 transition-colors duration-150 hover:text-white md:py-1"
            >
              whatsapp {site.whatsappLabel}
            </a>
          </li>
          <li>
            {site.email ? (
              <a href={`mailto:${site.email}`} className="inline-block rounded-sm py-1.5 transition-colors duration-150 hover:text-white md:py-1">
                {site.email}
              </a>
            ) : (
              <span className="inline-block py-1.5 md:py-1">[tu correo]</span>
            )}
          </li>
          <li>
            <span className="inline-block py-1.5 md:py-1">{site.city}</span>
          </li>
        </ul>
      </div>
      <div className="shell">
        <div className="type-crumb flex flex-wrap items-center justify-between gap-4 border-t border-line py-6 text-gris-tenue">
          <p>© 2026 {site.name}</p>
          <a href="#inicio" className="inline-block rounded-sm py-1.5 transition-colors duration-150 hover:text-white md:py-1">
            volver al inicio{" "}
            <span aria-hidden="true" className="text-ultramar-claro">
              /
            </span>
          </a>
        </div>
      </div>
      {/* De cierre, el mismo METALEVEL del inicio, apenas visible: se entró por el nombre y se sale por él. */}
      <div aria-hidden="true" className="overflow-clip pb-[env(safe-area-inset-bottom)]">
        <p className="-mr-[0.2em] bg-linear-to-b from-white/[0.08] to-white/0 bg-clip-text text-center text-[13vw] leading-[0.82] font-light tracking-[0.2em] text-transparent select-none">
          METALEVEL
        </p>
      </div>
    </footer>
  )
}
