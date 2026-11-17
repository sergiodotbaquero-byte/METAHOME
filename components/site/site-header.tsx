import { ArrowUpRight } from "lucide-react"
import { Simbolo, Wordmark } from "@/components/brand/logo"
import { SectionNav } from "@/components/site/section-nav"
import { buttonVariants } from "@/components/ui/button"
import { whatsappHref } from "@/lib/site"

/**
 * Barra fija. Sobre el inicio es transparente y solo muestra el símbolo: el
 * nombre aparece cuando el METALEVEL grande ya quedó atrás (--hero-pass).
 * Después se vuelve un material translúcido (globals.css).
 */
export function SiteHeader() {
  return (
    <header className="site-header fixed inset-x-0 top-0 z-50 pt-[env(safe-area-inset-top)]">
      <div className="shell flex h-16 items-center justify-between gap-6">
        <a href="#inicio" className="flex items-center gap-3 rounded-sm text-white" aria-label="METALEVEL code, ir al inicio">
          <Simbolo small className="size-7 shrink-0" />
          <Wordmark className="header-name text-[0.92rem] text-white" codeClassName="hidden min-[400px]:inline" />
        </a>
        <SectionNav />
        <a
          href={whatsappHref}
          target="_blank"
          rel="noopener noreferrer"
          className={buttonVariants({ size: "lg", className: "h-10 px-3.5 text-[0.9rem] md:h-9" })}
        >
          Hablemos
          <ArrowUpRight data-icon="inline-end" />
        </a>
      </div>
    </header>
  )
}
