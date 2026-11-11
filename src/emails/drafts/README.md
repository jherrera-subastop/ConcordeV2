# Cinco borradores de correo en Concorde

Base: `AaronCoorahua/ConcordeV2`, rama principal `master`, commit `f92fcc9`.
Estos borradores son para revisión. Integrar este código no los incorpora a los 50 correos de producción ni habilita envíos, campañas o nuevas condiciones legales.

## Revisión

- Galería: `/correos/borradores`.
- Accesos desde `/correos` y `/correos/variantes#borradores`.
- Editor: `/correos/borradores/{id}`. Incluye asunto, preencabezado, pendientes, controles de banner/footer y copia de HTML.
- Vista individual: `/correos/borradores/{id}/vista`. Su aviso de borrador no se copia al HTML del correo.
- Las ediciones del editor son temporales; el contenido persistente está en los cinco módulos de esta carpeta.

Se reutilizan `generateEmail`, las secciones existentes, las tipologías de banner, el footer Compacto y `BannerLab`. Los borradores no pertenecen a `EMAILS`. El catálogo de 50 correos, su contenido y su renderer permanecen intactos.

## Composiciones vigentes

1. **Valorización → publicación**. Banner centrado morado. Título «¡Ya valorizaste tu vehículo! Estás a un paso de encontrar el precio que buscas.». Texto sobre Negociable y aceptar, contraproponer o rechazar propuestas. Panel de pago único en vidrio claro, título de 26/34 y monto de 24/32. Conserva el símbolo existente `>S< 25`, sin añadir otro CTA. Después aparecen la miniatura del video, el lema «Tu vehículo, tu precio, tu trato.» y «¡Publica ahora!» hacia `https://www.vmcsubastas.com/zona/publicar`.
2. **Publicación en revisión**. Banner centrado negociable. Texto breve sin plazo prometido, enlace a Mi Garaje y referencia a la campana. Ejemplo móvil en iPhone, una sola publicación EN REVISIÓN y nubecita PUBLICADA, expresamente condicionada a la aprobación. CTA «¡Ir a mi Garaje!» a `https://www.vmcsubastas.com/zona`.
3. **Publicación exitosa**. Banner centrado negociable. Conserva el tutorial existente de `83f8032`: siete pasos, nota de 24 horas, video y miniatura originales de 47 s. Usa «vehículo», saludo común y cuerpo de 14/22. El destino `{{url_mi_garaje}}` sigue pendiente.
4. **Condiciones: aviso previo**. Banner Texto apilado Dark y CTA Secondary morado. Conserva el texto solicitado y sus cuatro viñetas. `xx/12/2026`, el enlace de condiciones y el PDF final son pendientes explícitos, no fechas ni versiones confirmadas.
5. **Condiciones: entrada en vigencia**. Banner Texto apilado Dark y CTA Secondary morado. Conserva los cuatro pasos solicitados, con «opción de aceptar». El borrador no acredita que exista una nueva versión vigente ni que el flujo descrito esté implementado.

Los cinco saludos completos son **Hola, {{nombre}}**. El cuerpo de lectura usa 14 px/22 px mediante estilos inline. Se preservan las jerarquías de títulos, pasos y CTA. Los banners legales conservan el logo actual `logo-correos2.svg`; en móvil se adapta solo su título a 24 px. El footer Compacto se reorganiza en móvil. El botón de ayuda «¡Vamos!» enlaza a `https://www.vmcsubastas.com/centro-de-ayuda` incluso al probar otros footers.

## Recursos y alcance de publicación

### Video 01

Se incluye el MP4 original `vende-spot-v7-v7.mp4` con autorización expresa de Julio para publicarlo en este repositorio público. Tiene 31.045.449 bytes, 1080 × 1920, 30 fps y 50,7 s. SHA-256: `f764d1ae235fe1ea4748139721df60c5ca619085dc080c7d524f3f0a9abd31f0`. No se ha modificado ni transcodificado.

La miniatura corresponde al fotograma de los 7 s. Ambos recursos se conservan en `public/correos/borradores/valorizacion-publicacion/` y funcionan mediante rutas relativas en la previsualización web. La miniatura y el rótulo «Ver video» enlazan al MP4; el correo no lo adjunta ni incrusta. Antes de enviar correos se deben configurar y verificar URLs HTTPS absolutas del entorno de envío. Publicar en GitHub no verifica por sí mismo un despliegue ni configura esas URLs.

### Ejemplo móvil 02

El visual vigente es `public/correos/borradores/publicacion-revision/mi-garaje-iphone.png`. Es una composición ilustrativa de la demo Mi Garaje, commit `c880184333ba7bf6731cca006d0a06df8e8d0928`, no una captura de una cuenta real.

Conserva header, logo, campana, fotografía y badges de la demo. Se ocultan datos de cuenta y promociones; solo se muestra una fila. La nubecita no tapa el header ni la publicación y su conector termina junto al badge EN REVISIÓN. No se inventa el texto de una notificación de aprobación.

Se conservan la composición HTML final, la captura móvil recortada, el badge original y `mobile-capture.json`, con geometría y hashes. Las capturas exploratorias y composiciones anteriores no forman parte del PR.

`scripts/capture-email-02-mobile.cjs` permite regenerar el ejemplo a partir de una demo **local**. Es una utilidad opcional, no una dependencia de la aplicación ni del build. Requiere Playwright instalado por separado y la misma demo fuente:

- `PLAYWRIGHT_PATH`: paquete Playwright local; por defecto, `playwright`.
- `CHROME_PATH`: ejecutable de Chromium; si se omite, se usa el navegador de Playwright.
- `MI_GARAJE_DEMO_URL`: URL de la demo en localhost; por defecto, `http://127.0.0.1:3226/m/vmc?propuesta=0&llegada=publicacion&pag=glass`.

No apuntar esta captura a una cuenta de producción. Regenerar los recursos modifica los hashes y requiere volver a revisar las imágenes.

## Antes de cualquier envío

- Confirmar disparadores y destinatarios; comprobar los recorridos autenticados de los CTA.
- Mapear `{{nombre}}` al campo real, escapar su valor y definir el saludo sin nombre. Este catálogo no implementa personalización.
- Resolver `{{url_mi_garaje}}`, `{{url_nuevas_condiciones}}` y `{{url_ingresar_vmc}}` según los módulos correspondientes.
- Sustituir rutas relativas de imágenes, logos y videos por URLs HTTPS aprobadas y verificadas para el entorno de envío. Una previsualización web no configura esas URLs automáticamente.
- Aprobar versión, fecha de vigencia, texto, enlace y PDF de las nuevas condiciones. Sustituir `xx/12/2026` solo con fecha aprobada. El PDF aún no está proporcionado ni adjuntado.
- Validar el flujo de aceptación descrito en 05: ventana automática, desplazamiento y botón Aceptar. No modificar cuentas ni aceptar condiciones mediante este catálogo.
- Revalidar tarifa y reglas comerciales. El 0% se refiere a la comisión de VMC al vendedor sobre la venta, no a servicios adicionales ni recargas; no se garantiza venta, precio mínimo o propuestas. Referencias consultadas el 10/11/2026: [landing SubasCars](https://www.vmcsubastas.com/landing-subascars) y [CyT IV.11.2](https://www.vmcsubastas.com/condiciones-y-terminos).
- Probar el HTML final en Gmail, Outlook, móvil y modo oscuro. Las pruebas en navegador no equivalen a pruebas de correo real.

## Comprobaciones

- `node scripts/check-email-drafts.cjs`: separación del catálogo, cinco borradores, contenido, recursos y hashes del mockup, video original enlazado sin incrustar, CTA, saludos y controles legales.
- `node scripts/check-email-draft-typography.cjs`: 33 secciones de lectura a 14/22, jerarquía explícita del panel 01 y conservación de estilos y contenido restantes.
- `node scripts/check-email-01-concorde.cjs`: panel de precio, copia exacta y fallback legible.
- `node scripts/check-email-03.cjs`: tutorial, siete pasos y video original sin alteraciones no solicitadas.
- `node node_modules/typescript/bin/tsc --noEmit`.
- ESLint de todos los archivos nuevos y modificados.
- `npm run build -- --webpack`: 157 páginas.
- Vistas reales a 320, 375 y 1280 px, sin desbordamiento ni imágenes rotas; recorrido galería/editor, siguiente, Atrás/Adelante, vista individual, retorno y 404.

El lint global registra 86 errores y 53 avisos en archivos existentes sin cambios. El lint dirigido de este PR pasa. No se han enviado correos ni se ha modificado una cuenta o campaña.
