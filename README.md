# METALEVEL code — página de presentación

Código de otro nivel. Una sola página: METALEVEL al centro de un túnel de páginas que hemos hecho, la idea, el trabajo, el proceso, nosotros y contacto.

Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS v4, shadcn (Base UI), Framer Motion, GSAP y lucide-react.

## Correrla

```bash
npm install
npm run dev
```

Abre http://localhost:3000.

La página se exporta como sitio estático (`output: "export"`): `npm run build` deja todo en `out/`, y `npm start` lo sirve en http://localhost:4173 para mirarlo tal como quedará publicado.

## Publicarla en GitHub Pages

Se publica sola en https://sergiodotbaquero-byte.github.io/METAHOME/ cada vez que se sube algo a `main`. Lo hace la Action `.github/workflows/pages.yml`, que también se puede correr a mano desde la pestaña Actions.

Una sola vez, en el repositorio: **Settings → Pages → Build and deployment → Source: «GitHub Actions»**. Con «Deploy from a branch», GitHub publicaría el README con Jekyll en vez de la página; por eso no hace falta un `_config.yml`. El título y la descripción salen de la propia página (`lib/site.ts`).

- La página vive bajo `/METAHOME`. La Action pasa esa ruta en `NEXT_PUBLIC_BASE_PATH`, y Next la agrega a sus enlaces, estilos y scripts. Una imagen de `public/` en un `<img>` propio la necesita también: escríbela con `asset("/work/…")` (`lib/utils.ts`).
- La Action también define `NEXT_PUBLIC_SITE_URL` con el dominio, para que la vista previa del enlace en WhatsApp y redes encuentre su imagen. En otro hosting, defínela tú (por ejemplo `https://tudominio.com`).
- Para ver en local la versión con la ruta base: `NEXT_PUBLIC_BASE_PATH=/METAHOME npm run build` y después `NEXT_PUBLIC_BASE_PATH=/METAHOME npm start`, en http://localhost:4173/METAHOME/. En Git Bash, antepón `MSYS_NO_PATHCONV=1` para que no convierta `/METAHOME` en una ruta de Windows.
- Con un dominio propio, la ruta base queda vacía sola.

## Dónde se cambia cada cosa

| Qué | Dónde |
| --- | --- |
| WhatsApp, correo, ciudad, fundadores | `lib/site.ts` |
| Proyectos, textos y capturas (las del túnel y las de la baraja) | `lib/work.ts` |
| Colores, escala tipográfica, la trama, el movimiento ligado al scroll | `app/globals.css` |
| La luz del inicio | `.luz` en `app/globals.css`; se pone en `components/site/hero.tsx` |
| Secciones | `components/site/` |
| La escalera del proceso | `components/site/process.tsx`, `escalera.tsx` y `.escalera` en `app/globals.css` |
| Logo (símbolo Ruta 4 «Giro» y nombre) | `components/brand/logo.tsx` |
| El túnel del inicio | `components/ui/perspective-tunnel-hero.tsx` |
| La baraja de Trabajo | `components/ui/tumble-deck-showcase.tsx` |
| Imagen para compartir el enlace | `app/opengraph-image.jpg` |

Pendiente: el correo. Mientras `email` sea `null` en `lib/site.ts`, la página muestra «[tu correo]».

## Las capturas

Hay cuatro proyectos: Faros Training Center, Liceo Los Robles, Sol y Café y ServirPlus. Sus capturas están en `public/work/`, en dos juegos:

- celular (`*-cel-*`), para el túnel: recortadas a 4 : 5, en 400 y 800 px;
- escritorio, para la baraja: en 2,06 : 1, en 640, 1080 y 1600 px.

Para volver a tomarlas, todas o solo algunas (`faros`, `robles`, `sol`, `servir`):

```bash
npm run capturas
```

```bash
npm run capturas -- sol servir
```

Usa el Edge o el Chrome instalados. Si sumas un proyecto, agrégalo en `scripts/capturar.mjs` y en `lib/work.ts`.

- **Sol y Café** abre el menú con el código de mesa 1001, uno de los códigos de prueba que publica la misma página. Solo mira: nada se agrega ni se pide.
- **ServirPlus**: sin sesión, solo se captura la pantalla de acceso. El panel está detrás del inicio de sesión y tiene datos de candidatos reales, así que va aparte:

```bash
npm run capturas -- servir-panel
```

Abre una ventana visible del navegador. Una persona inicia sesión ahí, a mano: el script nunca escribe, lee ni guarda la contraseña. Ya adentro recorre Panel, Candidatos, WhatsApp, Vacantes, Uso IA y Consola. Antes de cada captura difumina en la página todo lo que no es de la interfaz: nombres, teléfonos, cédulas, correos, mensajes y fotos. La sesión vive en un perfil temporal que se borra al cerrar la ventana. Revisa las capturas antes de publicarlas. En la página, ServirPlus no enlaza al panel (es privado) y lleva la nota «Los datos de los candidatos aparecen difuminados».

## Los dos componentes

**El túnel** (`perspective-tunnel-hero.tsx`). Las tarjetas salen del fondo alrededor del nombre y pasan de largo. El nombre se acerca desde el primer scroll: crece parejo hasta 1,25 veces su tamaño (`ANCHOR_GROWTH`) y al final acelera hasta atravesarse. Las tarjetas nunca lo tapan: el componente mide el bloque del nombre y traza el carril de cada tarjeta para que aparezca justo por fuera del tamaño que el nombre alcanza mientras ella está cerca, y desde ahí solo se aleje. Las que salen tarde encuentran un nombre más grande y aparecen más afuera. Si el nombre cambia de tamaño, los carriles se rehacen solos. Lo mueve el scroll de la página: el inicio es una pista alta con el escenario fijo en pantalla (`travel` pantallas de recorrido), así que funciona con rueda, trackpad, dedo, teclado y barra de desplazamiento, y al terminar la página sigue. Con movimiento reducido, el túnel queda quieto. Un clic en una tarjeta lleva a su proyecto en Trabajo.

**La baraja** (`tumble-deck-showcase.tsx`). Es el Tumble Deck Showcase, con tres modos de entrada:

- `capture`: el original. La rueda y el arrastre vertical pasan las cartas, y la página no baja mientras el puntero está encima.
- `inline`: el que usa Trabajo. Arriba y abajo sigue siendo scroll; las cartas se pasan de lado, con clic, con flechas o con `handleRef.step()`.
- `external`: sin entrada propia; la mueve `handleRef`.

## La luz del inicio

En el inicio entra una luz por la esquina de arriba a la derecha. Viene en franjas de Ultramar a 45°, paralelas a la barra y a la trama, con franjas de sombra entre ellas, y se apaga hacia abajo a la izquierda. Lleva un grano fino, que además evita los escalones en el degradado oscuro.

- Vive en el escenario fijo del túnel: se queda arriba, con el título, mientras se vuela, y se va con él. El resto de la página no la tiene.
- Se apaga antes del borde de abajo del inicio, así que no deja un corte al pasar a La idea.
- Las medidas van en `vmax`, centradas en la esquina, así que se ve igual en un celular vertical que en una pantalla ancha.
- Se enciende una vez al cargar. Con movimiento reducido solo aparece, sin desplazarse.

## El movimiento

- Los títulos y los bloques suben un poco y aparecen mientras entran en pantalla, al ritmo del scroll. Es CSS puro (`.reveal`, `animation-timeline: view()`): no usa JavaScript y, donde el navegador no lo soporta, todo queda quieto y visible. Un `.reveal` no puede ir dentro de un contenedor con `overflow: hidden` o `auto`; ahí se usa `overflow: clip`.
- La línea de cada sección se traza al entrar. La escalera del proceso se dibuja una vez, de abajo arriba, cuando aparece.
- La marca de las pestañas de Trabajo se desliza con el clic; con el teclado salta, sin animar.
- Los botones se hunden un poco al presionarlos (`scale(0.97)`).
- Con movimiento reducido no se desplaza nada: el túnel queda quieto, la escalera ya está dibujada y los bloques solo aparecen.

## En el celular

- La página llega de borde a borde (`viewport-fit=cover`). La barra superior, el contenido y el pie se apartan de la muesca con `env(safe-area-inset-*)`.
- Sin el destello gris al tocar. Los toques responden sin esperar un doble toque. Al mantener el dedo sobre un botón o una pestaña no se selecciona su texto.
- Los estados de hover solo existen donde hay puntero (Tailwind v4 ya lo hace así).
- La barra superior se vuelve translúcida pasado el inicio; con transparencia reducida, sólida.

## La marca, en corto

- 60 · 30 · 10: Negro Metalizado `#2A2E36`, Gris Niebla `#D9DCE1`, Azul Ultramar `#4168FF`.
- La página vive un nivel por debajo del Negro Metalizado: el fondo es el Nivel −1 (`#1B1E24`), el código, la baraja y el pie bajan al Nivel −2 (`#131519`), y el Negro Metalizado queda para lo que sube (el panel de contacto, las tarjetas del túnel).
- Dos familias y ninguna más: Jost y JetBrains Mono.
- Cuatro recursos: la barra (siempre a 45° y hacia arriba a la derecha), la línea de nivel, la trama (nunca debajo de un texto) y el código como imagen.
- El nombre se escribe METALEVEL code. Nunca Metalevel, MetaLevel ni Meta Level.
- La voz: segura, nunca gritona. Sin signos de exclamación, sin superlativos, sin jerga.
