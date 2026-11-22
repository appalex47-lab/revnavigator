# Investigación H-01 — «Clientes y LTV» vacío

> Rama `ccr-a81af632-rirtu7`, commit `625daec`. Solo lectura y pruebas en un navegador aislado (sin sesión, sin nube, datos de prueba de la propia app). Scripts de reproducción: `/tmp/q/aud/h01*.py` (no versionados).
> **Corrección a la revisión visual:** `docs/revision-visual/INVENTARIO_MODULOS_VISUALIZABLES.md` decía «No funcional / posible defecto». Esta investigación lo **corrige**: el módulo funciona; el vacío se debía a un paso de confirmación y a un tiempo de importación que mi script no esperó. (El documento anterior no se modificó.)

## 1. Dictamen
**Comportamiento esperado + limitación del flujo de demostración + brecha de UX. No es un defecto del motor, de la transformación ni de la presentación.** Confirmado con evidencia reproducible (3/3 ejecuciones).

## 2. Qué necesita el módulo
| Pregunta | Respuesta (evidencia) |
|---|---|
| Dataset | **Productos · venta** con **`id_pedido` e `id_cliente`** mapeados (`js/products/productStore.js:295`: el libro se crea solo si `idx.orderId` **y** `idx.customerId` existen). **No** usa los datasets de plan/real/histórico ni segmentos. |
| Estructura | Una fila por línea de pedido; el libro de clientes guarda **una entrada por pedido** (`js/products/customerStore.js`, clave `productCustomerLedger` en IndexedDB, almacén `meta`). |
| Campos obligatorios | fecha, canal, sku, venta, pedidos/unidades + `id_pedido` + `id_cliente` (ID anonimizado). El archivo de demo trae las 21 columnas. |
| Dependencia histórica | `warmupDays` 180 y reactivación 90/180/365 días (`state.cu.opts`); necesita historia de pedidos (el demo cubre 2025‑01‑01 a 2026‑09‑22). |
| Conexión al flujo | Sí: `commit` de producto → `FP.customerStore.commit(draft.ledger, …)` (`productStore.js:932`); la vista (`customers-view.js`) llama `FP.customerStore.analyze(...)`. |

## 3. Reproducción
Flujo: «Datos de prueba» → Clientes → «Probar con datos de ejemplo» (`p-mock-clientes`, `js/app.js:4350`).
1. El botón **solo prepara** (`stage`) el archivo `productos_venta_con_clientes_demo.csv` (~14 873 filas) y lleva a Carga de datos. **Nada entra al modelo hasta confirmar** («Importar venta de productos»).
2. Tras confirmar, la importación tarda **~13 s** (la pantalla muestra «Guardando» en Carga). A los ~5 s: `FP.customerStore.info()` = `null` y Clientes dice «Todavía no hay clientes cargados».
3. A los ~13 s: libro con **8 827 pedidos y 3 000 clientes** (4 canales). Clientes se actualiza **sin recargar** y muestra LTV, cohortes y retención (≈ 6 900 caracteres).
4. Con la importación terminada, recargar y volver conserva el libro.
Mi revisión visual esperó ≤ 5 s y navegó antes de que terminara; por eso vio el estado vacío.

## 4. Causa por capa
| Capa | Hallazgo |
|---|---|
| Generación de datos | Correcta (`customersCase`, 21 columnas incl. ids) |
| Transformación | Correcta (libro creado tras el commit) |
| Cálculo | Correcto (analiza el libro cuando existe; devuelve `no_ledger` si no) |
| Presentación | El estado vacío es correcto pero **no informa** de que hay un archivo pendiente de confirmar o una importación en curso |
| Filtros | No intervienen (sin filtros activos; canal «total») |

## 5. Hallazgos derivados
- **UX:** el estado vacío de Clientes y Cross‑sell no distingue «sin datos» de «archivo en revisión / importando».
- **Demostración:** `stage-all-generated` y `p-mock-clientes` exigen confirmaciones manuales; no existe un «cargar todo el demo» de un clic.
- **Sin defecto de datos:** no se inventaron clientes ni métricas.
