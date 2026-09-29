# Comparación de técnicas de renderizado

## 1. ¿Qué es el renderizado web y por qué importa?

Renderizar es el proceso de convertir el código de la aplicación (componentes, plantillas y datos) en el HTML que el usuario ve en pantalla. La pregunta clave que diferencia cada técnica es: **¿dónde y cuándo se genera ese HTML?**

Esta decisión impacta directamente en:

- **Qué tan rápido el usuario ve contenido** y qué tan rápido puede interactuar con él.
- **SEO y vistas previas**: lo que reciben los buscadores y las redes sociales al compartir un enlace.
- **Costo e infraestructura**: servir archivos estáticos no cuesta lo mismo que mantener un servidor procesando cada petición.
- **Complejidad del desarrollo**: algunas técnicas obligan a escribir código que funcione tanto en el navegador como en el servidor.

| Técnica | ¿Dónde se genera el HTML? | ¿Cuándo? |
|---|---|---|
| CSR | En el navegador | En cada visita, después de descargar y ejecutar el JavaScript |
| SSR | En el servidor | En cada petición |
| Pre-render (SSG) | En el servidor o CI | Una sola vez, durante el build |

## 2. Las técnicas de renderizado

### 2.1 CSR (Client-Side Rendering)

Es el modo por defecto de una aplicación Angular. El navegador recibe un `index.html` que funciona como un croquis casi vacío: solo contiene la etiqueta `<app-root></app-root>` y las referencias a los archivos JavaScript. No trae ni los datos ni la estructura de la página.

Flujo:

1. El navegador recibe el `index.html` con `<app-root>` vacío.
2. Descarga, interpreta y ejecuta el JavaScript de Angular.
3. Angular construye todo el DOM, incluso el contenido fijo como títulos y textos.
4. Se hacen las peticiones a las APIs y se pintan los datos.

Hasta el paso 3 el usuario ve una pantalla en blanco. Un buscador o una vista previa en redes sociales que no ejecute JavaScript ve exactamente eso: una página vacía.

- **Ventajas:** servidor muy simple (solo entrega archivos estáticos), navegación entre páginas muy fluida una vez cargada la aplicación, no hay que preocuparse por el entorno del servidor.
- **Desventajas:** pantalla en blanco inicial (peor FCP y LCP), SEO y vistas previas limitados, todo el trabajo recae en el dispositivo del usuario, lo cual se nota en equipos de gama baja.

### 2.2 SSR (Server-Side Rendering)

En cada petición, el servidor ejecuta Angular, arma la página con sus datos y envía el HTML ya construido. El usuario ve el contenido apenas llega la respuesta.

Sin embargo, el navegador **sigue descargando el mismo JavaScript** de la aplicación. Mientras eso sucede, la página se ve pero no responde a los clics. Cuando Angular carga, reutiliza el HTML existente y le conecta los eventos: este proceso se llama **hidratación**.

> SSR = el usuario **ve** el contenido antes, pero no puede **interactuar** antes.

- **Ventajas:** contenido visible más rápido (mejor FCP y LCP), buen SEO y vistas previas, contenido siempre actualizado y personalizable por usuario.
- **Desventajas:** requiere un servidor Node corriendo (más costo y operación), el tiempo hasta el primer byte (TTFB) puede aumentar porque el servidor trabaja en cada petición, y el código debe funcionar en el servidor, donde no existen `window`, `document` ni `localStorage`.

### 2.3 Pre-render (SSG - Static Site Generation)

El HTML de cada ruta se genera **una sola vez, durante el build**, y se guarda como archivos estáticos que pueden servirse desde un CDN. Cuando el usuario entra, recibe una página ya armada sin que ningún servidor tenga que procesar nada.

Al igual que en SSR, las páginas pre-renderizadas **también se hidratan**: después de cargar el JavaScript, la página es completamente interactiva.

- **Ventajas:** la opción más rápida y barata de servir, excelente SEO, no necesita servidor en ejecución.
- **Desventajas:** el contenido es igual para todos los usuarios y queda desactualizado hasta el siguiente build; no sirve para páginas personalizadas ni para contenido que cambia constantemente; con miles de rutas, el tiempo de build crece.

## 3. Tabla comparativa

Leyenda: ✅ favorable · ⚠️ depende / intermedio · ❌ desfavorable

| Criterio | CSR | SSR | SSG |
|---|---|---|---|
| Velocidad para **ver** contenido (FCP/LCP) | ❌ | ✅ | ✅ |
| Tiempo hasta el primer byte (TTFB) | ✅ | ⚠️ | ✅ |
| SEO / vistas previas | ❌ | ✅ | ✅ |
| Contenido siempre actualizado | ✅ | ✅ | ❌ |
| Personalización por usuario | ✅ | ✅ | ❌ |
| Costo de infraestructura | ✅ | ❌ | ✅ |
| Simplicidad de desarrollo | ✅ | ❌ | ⚠️ |

Observaciones:

- **TTFB:** en CSR el primer byte llega rápido porque es un archivo estático, pero ese HTML está vacío. En SSR el servidor debe ejecutar Angular y esperar las APIs antes de responder.
- **Costo:** CSR y SSG se sirven como archivos estáticos desde un CDN. SSR requiere un servidor Node en ejecución que escale con el tráfico.
- **Simplicidad:** SSG comparte las restricciones de código de SSR (Angular se ejecuta en Node durante el build: no hay `window`, `document` ni `localStorage`), aunque no requiere operar un servidor.

## 4. ¿Cuándo usar cada técnica? Casos de negocio

### 4.1 Detalle de producto en un e-commerce → SSR

- El negocio depende de que los productos aparezcan en los buscadores: si alguien busca un producto, la página debe estar bien posicionada. Con SSR el buscador recibe el HTML completo con nombre, descripción y precio.
- El producto casi no cambia, pero el precio y el stock sí. SSR genera la página en cada petición, así que siempre muestra datos actualizados.
- ¿Por qué no SSG? El precio quedaría desactualizado hasta el siguiente build y, con miles de productos, el tiempo de build sería enorme.

### 4.2 Dashboard bancario (detrás de login) → CSR

- No necesita SEO: ningún buscador debe indexar una página privada.
- Es una aplicación muy interactiva en la que el usuario pasa mucho tiempo; el costo de la carga inicial se paga una sola vez y luego la navegación es fluida.
- Cada página es distinta para cada usuario, así que no se puede cachear: con SSR el servidor trabajaría en cada petición sin ningún beneficio de SEO a cambio.
- Nota: CSR no es "más seguro" que SSR por sí mismo; los datos siempre pasan por las APIs del servidor. La decisión es de costo/beneficio, no de seguridad.

### 4.3 Blog o landing corporativa → Pre-render (SSG)

- El contenido es igual para todos los usuarios y cambia muy poco (por ejemplo, una vez al mes).
- Generarlo una sola vez en el build y servirlo desde un CDN es lo más rápido y lo más barato: no hace falta un servidor en ejecución.
- Cuando el contenido cambia, basta con volver a hacer build y deploy.

### 4.4 Renderizado híbrido: combinar técnicas en una misma aplicación

No es necesario elegir una sola técnica para toda la aplicación: cada ruta puede usar la que mejor se ajuste a su contenido. Por ejemplo, en un e-commerce hipotético:

| Ruta | Técnica | Motivo |
|---|---|---|
| `/quienes-somos`, `/blog/*` | Pre-render | Contenido estático, igual para todos |
| `/producto/:id` | SSR | SEO + precio y stock actualizados |
| `/carrito`, `/checkout` | CSR | Personalizado, sin valor de SEO |

En Angular 17, con `@angular/ssr` se pueden combinar SSR y pre-render en la misma aplicación, indicando qué rutas se pre-renderizan en el build.

## 5. Errores comunes

Estos errores aplican a SSR y a pre-render, ya que en ambos casos Angular se ejecuta en Node.js.

### 5.1 Usar APIs del navegador en el servidor

- **Qué pasa:** en el servidor no existen `window`, `document` ni `localStorage`. Código como `localStorage.getItem('token')` en un constructor lanza `ReferenceError: localStorage is not defined` y el render en el servidor falla.
- **Cómo evitarlo:** proteger ese código con `isPlatformBrowser(inject(PLATFORM_ID))` o ejecutarlo dentro de `afterNextRender()`, que solo corre en el navegador. Si el servidor necesita un dato del usuario (como un token), debe viajar en una cookie.

### 5.2 Hydration mismatch

- **Qué pasa:** el HTML generado en el servidor no coincide con lo que calcula el navegador al hidratar (por ejemplo, mostrar la hora actual o el tamaño de la pantalla). Si solo difiere un texto, el usuario ve un "salto" en el contenido; si difiere la estructura del DOM, Angular lanza el error `NG0500`. También lo provocan la manipulación manual del DOM y el HTML inválido (por ejemplo, un `<div>` dentro de un `<p>`).
- **Cómo evitarlo:** renderizar contenido determinístico en el servidor y calcular los valores propios del navegador después de la hidratación con `afterNextRender()`. Como último recurso, `ngSkipHydration` excluye un componente de la hidratación.

### 5.3 Peticiones HTTP duplicadas

- **Qué pasa:** el componente se crea dos veces, una en el servidor y otra en el navegador al hidratar, así que la misma API se llama dos veces.
- **Cómo evitarlo:** `provideClientHydration()` activa por defecto el caché de transferencia de `HttpClient`: la respuesta obtenida en el servidor se serializa dentro del HTML (TransferState) y el navegador la reutiliza. Solo aplica a peticiones hechas con `HttpClient` (no con `fetch` directo) y, por defecto, a peticiones GET.

### 5.4 Estado compartido entre usuarios en el servidor

- **Qué pasa:** el servidor Node atiende a todos los usuarios en el mismo proceso. Si se guarda información del usuario en una variable global o estática, una petición puede sobrescribir los datos de otra y un usuario podría ver la información de otro: es una fuga de datos, un incidente de seguridad.
- **Cómo evitarlo:** nunca guardar estado de usuario en variables globales. Angular crea una instancia nueva de la aplicación por cada petición, así que ese estado debe vivir en servicios gestionados por la inyección de dependencias.

### 5.5 Elegir la técnica equivocada para el contexto

- Usar SSR en páginas privadas sin necesidad de SEO (costo de servidor sin beneficio), o pre-render en contenido que cambia constantemente (datos desactualizados). Ver sección 4.

## 6. Decisión para las fases 2 y 3

### Contexto de negocio: Alexa Bijoux

Catálogo web de bisutería artesanal (sin carrito ni login). La dueña de la marca publica sus diseños en Contentful (CMS headless) de forma ocasional.

- **Objetivo principal: SEO y visibilidad.** Que los diseños aparezcan en Google y que los enlaces compartidos en Instagram o WhatsApp muestren foto, nombre y descripción.
- **Contenido igual para todos** y que cambia poco (se publican diseños nuevos de vez en cuando).
- **Sin presupuesto para hosting:** el sitio se publicará en el plan gratuito de Vercel.
- **Única funcionalidad personalizada:** la página de favoritos, guardada en el `localStorage` de cada usuario.

### Técnicas evaluadas

| Técnica | ¿Cumple el objetivo de SEO? | Decisión |
|---|---|---|
| CSR | No: el HTML inicial está vacío | Línea base para medir (fase 2) |
| SSR | Sí | Descartada: generar cada página en cada visita es innecesario para contenido que cambia poco. En Vercel, SSR se ejecuta en funciones serverless que consumen los límites del plan gratuito y pueden tener arranques en frío (peor TTFB). Su única ventaja (ver un diseño nuevo al instante) no lo justifica |
| Pre-render (SSG) | Sí | Técnica elegida (fase 3) |

### Fase 2: CSR como línea base

Se configura la aplicación en modo 100% CSR y se documenta su comportamiento: HTML inicial vacío, tiempo en blanco hasta que se ejecuta el JavaScript y lo que ven los buscadores y las vistas previas de redes sociales. Se miden sus métricas como punto de comparación.

### Fase 3: Pre-render (SSG) con renderizado híbrido

Se pre-renderizan en el build las páginas públicas: inicio, catálogo, categorías, detalle de cada producto y Quiénes somos. Consideraciones:

- **Rutas con parámetros:** las páginas `/producto/:slug` necesitan la lista de slugs obtenida desde Contentful en el momento del build.
- **Contenido desactualizado:** cuando se publica un diseño nuevo, el sitio no cambia hasta el siguiente build. Se resuelve con un webhook de Contentful que llama a un Deploy Hook de Vercel y dispara un rebuild automático.
- **Despliegue estático:** el `vercel.json` actual envía todas las rutas al servidor SSR; con SSG se ajusta para servir los archivos generados directamente desde el CDN de Vercel, sin funciones serverless.
- **Favoritos se queda en CSR:** depende del `localStorage` de cada usuario, así que pre-renderizarla no aporta SEO y genera un "salto" de contenido al hidratar.

### Cómo se compararán

Se medirán ambas versiones con las mismas herramientas (Lighthouse y la pestaña Performance de Chrome DevTools), comparando TTFB, FCP, LCP, el HTML inicial recibido (lo que ve un buscador) y la experiencia percibida por el usuario.
