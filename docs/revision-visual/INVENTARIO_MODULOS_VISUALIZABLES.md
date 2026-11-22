# Inventario de módulos visualizables (aplicación real)

> Rama `ccr-a81af632-rirtu7`, commit `625daec`. Navegador real (Chromium emulado, política de seguridad de contenido **activa**), datos de prueba generados por la propia aplicación, contexto aislado. Solo se listan pantallas que existen en el menú (`index.html`); no hay módulos ficticios.
> **Leyenda.** *Existe*: la pantalla carga. *Funcional*: se verificó una interacción o un cálculo, no solo que se vea. *Integrado*: forma parte del flujo real de la aplicación (menú, datos compartidos). «Se muestra» = solo se comprobó la visualización.

| Módulo (ruta) | ¿Existe? | ¿Es funcional? | ¿Integrado? | Observaciones |
|---|---|---|---|---|
| **Inicio / Home** (`#inicio`) | Sí | **Sí**: cambiar el canal cambia el veredicto (Total 99.9 % → Ecommerce 99.4 %); 15 plegables se abren | Sí | Veredicto, confiabilidad en un chip, «Tu siguiente mejor paso», «Qué necesita atención», «Desde ayer», tabla por canal. Es la estructura **anterior** a Fase 3. |
| Indicadores principales (dentro del Inicio) | Sí | Sí (cumplimiento, brecha, forecast de cierre, hallazgos) | Sí | 11 gráficos/ilustraciones y 2 tablas en el Inicio |
| Carga de datos (`#carga`) | Sí | **Sí**: «Revisar todos los datasets generados» + confirmar cargó datos (88 reales, 120 de plan) | Sí | Plantillas y «Traer y revisar» (Sheets) no probados |
| Calidad de datos (`#calidad`) | Sí | Se muestra (2 advertencias de los datos de prueba, 11 tablas) | Sí | |
| Datos normalizados (`#datos`) | Sí | Se muestra con filtros y tablas; exportación no probada | Sí | |
| Metas y motor (`#resumen`) | Sí | **Sí**: «Datos de prueba» genera plan y venta | Sí | Página larga (≈ 11 500 px) |
| Plan (`#plan`) | Sí | **No verificado**: muestra «Sin meta» hasta capturar la meta anual; no se probó «Generar vista previa» | Sí | Estado vacío esperado |
| Estacionalidad (`#estacionalidad`) | Sí | Se muestra con tablas tras cargar datos | Sí | |
| Configuración de planeación (`#configuracion`) | Sí | Se muestra (40 controles) | Sí | |
| Proyección del próximo año (`#proyeccion`) | Sí | Se muestra con 6 tablas tras cargar los datasets; antes dice «Todavía no hay datos para proyectar» | Sí | |
| **Pacing & Forecast** (`#pacing`) | Sí | Se muestra (81 controles, 5 tablas); no se verificó un recálculo | Sí | Página muy larga (≈ 5 900 px en escritorio, 16 800 px en móvil) |
| Qué cambió desde ayer (`#cambios`) | Sí | Se muestra con contenido | Sí | |
| **Diagnóstico comercial** (`#diagnostico`) | Sí | Se muestra con lectura y tablas | Sí | «Por qué» con atribución |
| **Atribución** | Sí (dentro de Diagnóstico) | Se muestra | Sí | Motor unificado de la Fase 2 |
| **Impacto económico** | Parcial | Solo la **configuración de margen** (Ajustes: «Sin configurar»); no hay vista de impacto económico por hallazgo | Parcial | El Home **no** consume `FP.economics` (ver Fase 3) |
| Producto y evolución (`#prodevol`) | Sí | Tras cargar datos de producto aparece contenido (tabla y 8 gráficos al abrir la sub‑vista); una tarjeta no navegó en mi script | Sí | Requiere datos de producto |
| Tráfico y conversión (`#segmentos`) | Sí | Se mostró con datos (≈ 12 800 caracteres, 6 tablas) en una ejecución y como índice en otra | Sí | Comportamiento no concluyente: sin diagnóstico |
| Clientes y LTV (`#clientes`) | Sí | **No**: tras «Probar con datos de ejemplo» y confirmar la carga siguió vacío | Sí | Posible defecto o paso faltante: **no diagnosticado** |
| Recovery & Reforecast (`#reforecast`) | Sí | Se muestra (67 controles, 5 tablas) | Sí | |
| Recovery Center (`#recovery`) / **Recomendaciones y acciones** | Sí | Se muestra (85 controles) | Sí | |
| **Siguiente mejor paso** | Sí (en el Inicio) | Se muestra con su ruta de 5 pasos | Sí | |
| Cross‑sell (`#crosssell`) | Sí | Se muestra con datos (5 tablas) tras cargar productos con pedidos | Sí | |
| Promociones (`#promociones`) | Sí | Se muestra (pide cargar ofertas) | Sí | |
| Seguimiento y aprendizaje (`#medir`) | Sí | Estado vacío («Todavía no hay acciones para medir»); depende de acciones del Recovery Center | Sí | |
| **Narrativa ejecutiva** (`#narrativa`) | Sí | Se muestra (texto de cálculos existentes); la redacción con Cohere **no se probó** | Sí | Inteligencia narrativa determinista |
| Presentación (PDF) (`#presentacion`) | Sí | Se muestra (23 controles); generar el reporte no se probó | Sí | |
| Configuración de RevNavigator (`#ajustes`) | Sí | Se muestra (107 controles); sección «Margen comercial (opcional)» presente | Sí | |
| Ayuda (`#ayuda`) | Sí | Se muestra | Sí | |
| **Persistencia** | Sí | **Sí**: tras recargar, el Inicio conserva los datos (88 reales / 120 plan) en el almacenamiento local de ese navegador | Sí | Sincronización en la nube **no probada** (requiere sesión; no se inició) |
| **Prototipo del Home inteligente (Fase 3.5)** | Sí (archivo aparte) | **Sí**: 6 situaciones conmutables, filtros, «Ver contexto» | **No** | `docs/command-center/prototipo/home_3_5_prototipo.html`; datos simulados; no forma parte de la aplicación |
