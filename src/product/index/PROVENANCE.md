# Index: snapshot fiel para revisión local

- Fuente: https://github.com/AaronCoorahua/vmc-index-lab
- Commit: `359888ba499ff0a2f5af30cae6a4c814b528629d` (HEAD remoto verificado el 13/11/2026).
- Ruta original: `apps/index-lab/app/qa/home-index-rebase`.
- Ruta integrada: `/producto/index` (incluye selector desktop/mobile y variantes QA originales).
- Componentes: copia aislada de `apps/index-lab/concorde`, expuesta por el adapter original. No sustituye componentes globales de Concorde.
- Recursos: copia de `apps/index-lab/public` bajo `/producto/index/` para evitar colisiones.
- Cambios de adaptación: imports del adapter/alias, rutas de recursos y ruta de preview; tokens circunscritos al wrapper; fuentes originales Plus Jakarta Sans y Roboto Mono en layout de ruta.
- No se rediseñaron pantallas ni alteraron cifras o reglas de la fuente.
- Dependencias runtime: React, ReactDOM y Next existentes; sin paquetes adicionales. Fuente usa Next 16.4.0/React 19.2.8; destino usa las versiones del proyecto central.
- Estado: prototipo de laboratorio. Feed, valorizaciones, vehículos y actividad son simulados según fuente, NO resultados AVT verificados ni integración real.
- Vigencia de implementación verificada por commit, no aprobación comercial/UX. Contiene variantes experimentales del repositorio; no se declara toda variante aprobada.
- Navegación fuera de esta pantalla conserva enlaces fuente y puede requerir integración posterior. No se publicó ni se hizo push/merge.

## Comprobación estática

- Sin dependencias nuevas ni imports al workspace monorepo de origen.
- Detectados recursos por defecto ausentes también en el snapshot fuente: banners/negociable.png, banners/en_vivo.png, banners/empresa.png, banners/categoria.png y logo-preview.png. Referencias en componentes auxiliares AssetBanner, EmpresaBanner y HomepageMobile; la ruta HomeIndexRebase usa recursos explícitos distintos. No se inventaron reemplazos.
- Revisión visual en navegador pendiente: no se utilizó pantalla ni navegador del usuario.
