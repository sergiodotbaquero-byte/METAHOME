// Datos de METALEVEL code que se muestran en la página. Cámbialos aquí.

export const site = {
  name: "METALEVEL code",
  tagline: "Código de otro nivel.",
  description:
    "Diseño y desarrollo web. Hacemos páginas web pensadas para resolver una necesidad concreta. Bien hechas.",
  /**
   * WhatsApp, solo dígitos con el indicativo del país.
   * Tomado del enlace «Powered by METALEVEL code» del sitio de Faros Training.
   */
  whatsapp: "573017505981",
  whatsappLabel: "+57 301 750 5981",
  whatsappMessage: "Hola, vengo de la página de METALEVEL code.",
  /** Correo de contacto. Mientras sea null, la página muestra «[tu correo]». */
  email: null as string | null,
  city: "Pereira, Colombia",
  founders: [
    { name: "Sergio Baquero", role: "Cofundador" },
    { name: "Santiago Guerra Puertas", role: "Cofundador" },
  ],
}

export const whatsappHref = `https://wa.me/${site.whatsapp}?text=${encodeURIComponent(site.whatsappMessage)}`

export const nav = [
  { href: "#trabajo", label: "trabajo" },
  { href: "#proceso", label: "proceso" },
  { href: "#nosotros", label: "nosotros" },
  { href: "#contacto", label: "contacto" },
]
