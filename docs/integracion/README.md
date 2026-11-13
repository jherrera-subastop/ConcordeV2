# Concorde VMC: pantallas actuales integradas

Fecha: 2026-11-13. Rama: julio/concorde-integracion-20261113.

## Punto de entrada
Abre `/producto`. El registro de fuentes está en `public/producto/registry.json` y cada pantalla puede previsualizarse en 390, 768 o 1440 px. Los bloques y correos anteriores se preservan.

## Qué se integró
- Index/Homepage: AaronCoorahua/vmc-index-lab, remoto main 359888ba. Incluye sus componentes y selector responsive originales.
- Mi Garaje, detalle Negociable Basic, publicación y valorización: checkout Mi-Garaje-Lab c3053a9, procedente de ahuacchillo/VMC-Laptop. El formulario real es models/Flujo.tsx, no PublicationFlow (que representa estados).
- Ganá Ya comprador/vendedor: entrega local ENTREGA-GANAYA-2026-11-13-LIMPIA. Se conserva el widget de prueba y flujos de la entrega. No es una nueva integración backend.

Cada fuente está aislada en `src/product` y sus recursos en subdirectorios propios. No se sobrescribieron componentes canónicos con variantes de producto. Ésta es una consolidación funcional de referencias, no una declaración de que todas las variantes ya estén normalizadas o aprobadas para producción.

## Regla de composición para nuevas pantallas
1. Identificar función y recorrido; para publicar usar el formulario existente, para catálogo el Index, para detalle la ficha Basic, para Ganá Ya su flujo actual.
2. Revisar registry.json, procedencia, rama/commit y estado. Comparar implementaciones de la misma pieza antes de elegir. Una fecha reciente no demuestra aprobación.
3. Conservar logo, header/sidebar, tipografía, jerarquía, estados y responsive de la referencia elegida. No recrear una pantalla genérica a partir de dos componentes.
4. Revisar APIs/tokens reales antes de reutilizar. Si hay variantes en fuentes distintas, documentar la elegida y su motivo; no mezclar estilos silenciosamente.
5. Promover una variante al catálogo común sólo tras revisar compatibilidad, accesibilidad, estados y pantallas consumidoras. Mostrar diferencias; conservar la anterior si sigue en uso.
6. Vendo Mis Cosas multicategoría es un requerimiento nuevo, no la misma cosa que publicar vehículos. Usar la estructura pertinente sin inventar reglas de categorías/pagos/estados.

## Límites importantes
Datos, saldos, precio, feed y resultados AVT dentro de estos prototipos son simulaciones de sus fuentes. No son cotizaciones verificadas del servicio AVT. Las variantes integradas no implican aprobaciones de negocio. El Index conserva algunas referencias de assets auxiliares ausentes en su propio repositorio; véase PROVENANCE.md.

## Sincronización futura
Mantener el fork propio y el upstream de Aaron separados. Registrar fuente/commit y comparar cambios antes de traerlos; no hacer pull ciego sobre trabajo local. No push, merge ni despliegue forman parte de esta entrega.

## Validación ejecutada
- `npx tsc --noEmit`: OK.
- `npm run build`: OK, 173 páginas. Advertencia heredada: app/blocks/zona/page.tsx traza next.config.ts y podría incluir más archivos en NFT de lo esperado.
- `node src/product/mi-garaje/verify-integration.cjs`: OK, 130 archivos, rutas/activos.
- Chromium headless aislado: 18 cargas (9 rutas x 390/1440), HTTP200, sin pageerror ni recursos HTTP4xx/5xx. Capturas/results.json en qa. No se usó navegador del usuario.
- Las 8 rutas de producto no desbordan horizontalmente. El catálogo auxiliar /producto conserva desbordamiento en 390px por header común/cadenas de procedencia; pendiente ajuste responsive del catálogo, no de las pantallas integradas.
- QA de carga no equivale a validar exhaustivamente todos los estados y transacciones. Pendientes pruebas de interacción completas, comparación visual exhaustiva contra originales y normalización del catálogo canónico.
- npm ci informó 18 vulnerabilidades del árbol base; no se aplicó audit fix ni se cambiaron versiones principales para evitar alteraciones fuera de alcance.
- Correos existentes sin cambios. No push/merge/deploy.
