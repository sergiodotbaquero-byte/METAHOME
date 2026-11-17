import type { TumbleCard } from "@/components/ui/tumble-deck-showcase"
import { asset } from "@/lib/utils"

// Proyectos y capturas, en public/work/:
// - de escritorio, para la baraja de Trabajo: 640, 1080 y 1600 px, en 2,06 : 1;
// - de celular («-cel-»), para el túnel del inicio: 400 y 800 px, en 4 : 5.

export type Shot = {
  /** Nombre del archivo, sin el ancho ni la extensión. */
  file: string
  /** Qué parte del sitio se ve. */
  view: string
}

export type Project = {
  id: string
  name: string
  /** Nombre corto, para las etiquetas de las tarjetas. */
  short: string
  /** Sin url, la página no enlaza el proyecto (un panel privado, por ejemplo). */
  url?: string
  /** El dominio, o qué es cuando no hay enlace. */
  host: string
  client: string
  built: string
  solves: string
  /** Una aclaración bajo la baraja. */
  note?: string
  shots: Shot[]
}

export const projects: Project[] = [
  {
    id: "faros-training-center",
    name: "Faros Training Center",
    short: "faros",
    url: "https://faros-app--faros-training-center.us-central1.hosted.app/",
    host: "faros-training-center",
    client: "Faros Training. Entrenamiento acuático en Risaralda.",
    built: "Sitio web, inscripción por planes en cuatro pasos y acceso para atletas.",
    solves: "El atleta elige su plan desde el celular y entra a su cuenta para seguir entrenando.",
    shots: [
      { file: "faros-inicio", view: "Inicio" },
      { file: "faros-app-planes", view: "Arma tu plan · paso 1 de 4" },
      { file: "faros-login", view: "Acceso de atletas" },
      { file: "faros-media", view: "Publicaciones" },
      { file: "faros-opiniones", view: "Opiniones" },
      { file: "faros-planes", view: "Inscripción" },
      { file: "faros-info", view: "Quiénes somos" },
    ],
  },
  {
    id: "liceo-los-robles",
    name: "Liceo Los Robles",
    short: "liceo",
    url: "https://www.liceolosrobles.org/",
    host: "liceolosrobles.org",
    client: "Liceo Los Robles. Colegio infantil.",
    built: "Sitio del colegio, menú escolar y plataforma académica.",
    solves: "Las familias ven el menú del día, agendan una cita por WhatsApp y entran a la plataforma con su documento.",
    shots: [
      { file: "robles-inicio", view: "Inicio" },
      { file: "robles-carrusel", view: "Galería" },
      { file: "robles-momentos", view: "Momentos especiales" },
      { file: "robles-menu", view: "Menú escolar" },
      { file: "robles-plataforma", view: "Plataforma académica" },
      { file: "robles-historia", view: "Nuestra historia" },
      { file: "robles-mision", view: "Misión y visión" },
      { file: "robles-ubicacion", view: "Ubicación" },
    ],
  },
  {
    id: "sol-y-cafe",
    name: "Sol y Café",
    short: "sol y café",
    url: "https://foodsistem.web.app/",
    host: "foodsistem.web.app",
    client: "Sol y Café. Espresso y métodos de filtrado.",
    built: "Menú digital por mesa: cada mesa entra con su código y arma su pedido desde el celular.",
    solves: "El cliente ve fotos, ingredientes y precios sin esperar la carta, y pide desde su mesa.",
    shots: [
      { file: "sol-menu", view: "Menú" },
      { file: "sol-favoritos", view: "Favoritos" },
      { file: "sol-detalle", view: "Detalle de un producto" },
      { file: "sol-con-leche", view: "Con leche" },
      { file: "sol-inicio", view: "Código de la mesa" },
    ],
  },
  {
    id: "servirplus",
    name: "ServirPlus",
    short: "servirplus",
    host: "panel privado",
    client: "ServirPlus. Centro de selección de personal.",
    built: "Un asistente de WhatsApp con IA que filtra a los candidatos por vacante, y el panel donde el equipo los sigue.",
    solves: "El equipo sigue a cada candidato, de la hoja de vida al ingreso, sin perder conversaciones en WhatsApp.",
    note: "Los datos de los candidatos aparecen difuminados.",
    shots: [
      { file: "servir-panel", view: "Panel" },
      { file: "servir-candidatos", view: "Directorio de candidatos" },
      { file: "servir-whatsapp", view: "WhatsApp" },
      { file: "servir-vacantes", view: "Vacantes" },
      { file: "servir-ia", view: "Uso de IA" },
      { file: "servir-consola", view: "Consola" },
      { file: "servir-acceso", view: "Acceso" },
    ],
  },
]

const WIDTHS = [640, 1080, 1600]

export function cardFor(project: Project, shot: Shot): TumbleCard {
  return {
    src: asset(`/work/${shot.file}-1080.webp`),
    srcSet: WIDTHS.map((w) => `${asset(`/work/${shot.file}-${w}.webp`)} ${w}w`).join(", "),
    alt: `${project.name}: ${shot.view.toLowerCase()}`,
  }
}

/** Evento con el id de un proyecto: el portafolio lo elige (lo lanza el túnel del inicio). */
export const PROJECT_EVENT = "metalevel:proyecto"

export type TunnelShot = {
  projectId: string
  /** «faros», «liceo». */
  short: string
  /** Qué parte del sitio se ve. */
  view: string
  src: string
  srcSet: string
  alt: string
}

/** El túnel del inicio: los cuatro proyectos en el celular, alternados, tres de cada uno. [proyecto, archivo, vista] */
const tunnelPicks: [projectId: string, file: string, view: string][] = [
  ["faros-training-center", "faros-cel-inicio", "inicio"],
  ["liceo-los-robles", "robles-cel-inicio", "inicio"],
  ["sol-y-cafe", "sol-cel-menu", "menú"],
  ["servirplus", "servir-cel-ia", "uso de ia"],
  ["faros-training-center", "faros-cel-app-planes", "arma tu plan"],
  ["liceo-los-robles", "robles-cel-menu", "menú escolar"],
  ["sol-y-cafe", "sol-cel-detalle", "capuchino"],
  ["servirplus", "servir-cel-whatsapp", "whatsapp"],
  ["faros-training-center", "faros-cel-media", "publicaciones"],
  ["liceo-los-robles", "robles-cel-plataforma", "plataforma"],
  ["sol-y-cafe", "sol-cel-favoritos", "favoritos"],
  ["servirplus", "servir-cel-vacantes", "vacantes"],
]

export const heroTunnel: TunnelShot[] = tunnelPicks.map(([projectId, file, view]) => {
  const project = projects.find((p) => p.id === projectId)!
  return {
    projectId,
    short: project.short,
    view,
    src: asset(`/work/${file}-800.webp`),
    srcSet: `${asset(`/work/${file}-400.webp`)} 400w, ${asset(`/work/${file}-800.webp`)} 800w`,
    alt: `${project.name} en el celular: ${view}`,
  }
})
