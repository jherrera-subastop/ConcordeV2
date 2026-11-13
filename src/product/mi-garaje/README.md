# Mi Garaje: referencia de producto integrada

Fuente: VMC-Laptop, commit c3053a9b816a17eba9ef0f6299e2e0bcb52ee33f. La copia conserva componentes locales y reglas del prototipo sin sobrescribir los componentes canónicos de Concorde.

## Entradas
- /producto/mi-garaje: selector de recorridos
- /producto/mi-garaje/m/vmc: Mi Garaje
- /producto/mi-garaje/m/vmc-propuesta: detalle Basic y propuesta
- /producto/mi-garaje/m/vmc-valuar: formulario y resultado de valorización
- /producto/mi-garaje/m/vmc-publica: valorización y publicación vehicular
- /producto/mi-garaje/m/vmc-valorizaciones: valorizaciones guardadas
- /producto/mi-garaje/publicaciones: publicaciones y estados

## Alcance
Flujo usa catálogo, valores y propuestas de ejemplo y motor local. No prueba conexión al AVT real ni exactitud del precio. PublicationFlow representa estados/acciones de una publicación; el formulario está en models/Flujo.tsx. El formulario multicategoría de Vendo Mis Cosas es otra referencia, no reemplaza este flujo vehicular.

Las rutas, imports y activos están aislados para evitar colisiones. Requiere framer-motion y qrcode-generator. Las fuentes originales no fueron modificadas. No se considera QA visual aprobado ni refactor a API pública de biblioteca.
