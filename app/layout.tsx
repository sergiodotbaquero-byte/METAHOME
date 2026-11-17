import type { Metadata, Viewport } from "next"
import { JetBrains_Mono, Jost } from "next/font/google"
import { site } from "@/lib/site"
import "./globals.css"

// Dos familias y ninguna más. Las dos son gratuitas y están en Google Fonts.
const jost = Jost({
  variable: "--font-jost",
  subsets: ["latin"],
  display: "swap",
})

const jetbrains = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
  display: "swap",
})

export const metadata: Metadata = {
  // Dominio público, para que la vista previa del enlace (WhatsApp, redes) encuentre su imagen.
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  title: `${site.name} — ${site.tagline}`,
  description: site.description,
  applicationName: site.name,
  authors: site.founders.map((f) => ({ name: f.name })),
  openGraph: {
    type: "website",
    locale: "es_CO",
    siteName: site.name,
    title: `${site.name} — ${site.tagline}`,
    description: site.description,
  },
}

export const viewport: Viewport = {
  // El color de la barra del navegador en el celular: el mismo fondo del inicio.
  themeColor: "#1b1e24",
  colorScheme: "dark",
  // La página llega de borde a borde; lo que importa se aparta de la muesca con env(safe-area-inset-*).
  viewportFit: "cover",
}

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="es"
      className={`${jost.variable} ${jetbrains.variable} dark antialiased`}
      // El nombre de la barra aparece cuando el METALEVEL del inicio ya pasó.
      style={{ "--hero-pass": "0" } as React.CSSProperties}
    >
      <body>{children}</body>
    </html>
  )
}
