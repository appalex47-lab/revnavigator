# Aclaración funcional H-01 y H-02 (derivadas de D-07) — propiedad única, referencias entre zonas y estructura de Z5

> Fecha: 12 de noviembre de 2026 · Autorización específica del usuario (resolución formal de H-01 y H-02). **Aclaración funcional derivada de D-07: no se crea D-08**; no hay decisión funcional nueva que D-07 no resuelva.
> Estado: **documentada, especificada de forma ejecutable (`tools/audit/z5-conjunto.js`) y probada con datos simulados; implementada solo en la especificación y el prototipo; no integrada en la aplicación real; sin validación externa.** No cambia el modelo de datos, el motor de cálculos ni ningún contrato.

## 1. Nomenclatura oficial (D-07)
| Zona | Nombre oficial | Responsabilidad |
|---|---|---|
| Z1 | Qué está pasando | Comunicar qué está pasando |
| Z2 | Contexto y desempeño | Aportar contexto y desempeño |
| Z3 | Qué merece atención | Identificar qué merece atención |
| Z4 | Qué puedo hacer | Presentar qué acciones pueden realizarse |
| Z5 | Oportunidades y visión de conjunto | Integrar oportunidades y ofrecer una visión de conjunto |

## 2. H-01 — Propiedad única y referencias entre zonas
**Interpretación autorizada.** Cada elemento de inteligencia comercial tiene **una única zona propietaria y una única fuente de verdad**, pero puede ser referenciado o resumido en otras zonas cuando cada aparición cumple una función distinta.

| Concepto | Definición | Ejemplo (una oportunidad) |
|---|---|---|
| **Propiedad** | La zona donde vive el elemento: su identificador, su importe, su certeza, su vigencia y sus límites | Z3 (con su identificador de elemento) |
| **Referencia** | Una mención que apunta al elemento por identificador; no es un elemento nuevo y no repite su importe | Z5 «Oportunidades»: «Ver el elemento en Z3» |
| **Resumen** | Una síntesis de varios elementos o de su relación, sin recalcular ni repetir importes | Z5 «Visión de conjunto»: «2 oportunidades son alternativas para la misma brecha; no se suman» |
| **Acción** | Una propuesta de la zona Z4 que cita el elemento que la motiva | Z4: «Evaluar las alternativas de recuperación» (cita la oportunidad) |

**Reglas (todas verificadas por pruebas):** (1) identidad inequívoca por identificador; (2) una instancia lógica y una fuente de verdad; (3) una zona propietaria; (4) otras zonas muestran referencias, resúmenes o acciones; (5) las referencias no crean elementos; (6) los importes no se duplican ni se suman más de una vez; (7) las relaciones conservan trazabilidad (oportunidad → evidencia → acción); (8) cada representación respeta la responsabilidad de su zona.
**Propiedad por tipo de elemento:** cifras, brecha y veredicto → Z1; contexto y desempeño (drivers, hipótesis aparte) → Z2; hallazgo, riesgo y oportunidad → Z3; acción → Z4; Z5 **no posee** elementos de negocio: integra referencias y visión de conjunto.
Las tres apariciones de una oportunidad (Z3 elemento, Z4 acción, Z5 visión global) corresponden al **mismo** elemento, no a tres oportunidades.

### Cambio exacto en el documento aceptado de 3.1 (autorizado)
Documento `FASE_3_1_ARQUITECTURA_INFORMACION.md`, §3.1 (línea 103), **una sola frase**:
- **Antes:** «Una pieza vive en **una sola** capa y zona.»
- **Después:** «Una pieza tiene **una sola capa y zona propietaria** y una sola fuente de verdad; otras zonas pueden mostrar referencias, resúmenes o acciones relacionadas con ella cuando cada aparición cumple una función distinta (aclaración H-01, derivada de D-07, 12-nov-2026: `ACLARACION_H01_H02_PROPIEDAD_Z5.md`).»
- **Justificación:** la frase anterior podía leerse como prohibir que una oportunidad apareciera en Z3, Z4 y Z5; la intención original (evitar duplicidad de información) se conserva y se hace explícita.
- **Consecuencias:** ninguna decisión aceptada cambia (D-01…D-04 de 3.1, arquitectura NAV · BC · Z1–Z5, reglas de Z3 y Z4). El cambio está registrado con hash en `generated/MODIFICACIONES_AUTORIZADAS.json`; cualquier otra modificación a ese documento se sigue detectando.
- **Discrepancias con la implementación:** la aplicación real no implementa ninguna zona de Fase 3; no hay contradicción funcional que corregir. En la derivación simulada se encontró y corrigió la suma de la brecha total y la del canal (ver §5).

## 3. H-02 — Estructura funcional de Z5
**Nombre oficial:** Oportunidades y visión de conjunto. Tres niveles:
| Nivel | Contenido | Reglas |
|---|---|---|
| **Principal · Oportunidades** | Las oportunidades identificadas y su relevancia (título, relevancia, certeza) como **referencias** a su elemento de Z3 y a sus acciones de Z4 | Sin importes propios; una sola aparición por oportunidad |
| **Principal · Visión de conjunto** | Cómo se relacionan las oportunidades con el desempeño (Z1), las prioridades (Z4) y el contexto (Z2); alternativas para la misma brecha declaradas como alternativas | Sin consolidar impactos superpuestos (D-06); sin cifras |
| **Secundario · Evidencia y detalle** (desplegable) | Evidencia disponible, fuentes, periodos analizados, cálculos y referencias, limitaciones, información faltante, nivel de confiabilidad; además canales, elementos descartados/retenidos y método | No se elimina; no se traslada a Z2; no duplica importes: las cifras del periodo se **referencian** a Z1 |
**Advertencias críticas** (confiabilidad no Alta, completitud no verificada, elementos retenidos, datos faltantes, hipótesis asociadas) se muestran **fuera del desplegable**, antes de los niveles principales («Antes de interpretar»). La evidencia está disponible sin dominar la lectura ejecutiva.
**Compatibilidad:** Z1 conserva la cifra y la completitud (D-05); Z2 el contexto; Z3 el elemento; Z4 las acciones. No hay sexta zona.
**Documentos:** el Z5 «Evidencia y detalle» de 3.1 (aceptado) sigue figurando allí; su contenido pasa a ser el **tercer nivel** de Z5 (equivalencia en `EQUIVALENCIAS_ZONAS_D07.md`). **No se editó 3.1 más allá de la frase de H-01.**
**Decisión de nomenclatura:** el prototipo y la especificación usan ahora el nombre oficial de Z5; los demás rótulos siguen la tabla de equivalencias.

## 4. Qué se implementó y qué no (no confundir con «hecho»)
| Nivel | H-01 | H-02 |
|---|---|---|
| Decisión aceptada | Sí | Sí |
| Especificación documentada | Sí (este documento y 3.1) | Sí (este documento) |
| Especificación ejecutable | Sí: `z5-conjunto.js` (reglas P0–P12) y relaciones de inclusión en `z3-atencion.js` | Sí: `z5-conjunto.js` |
| Prototipo | Sí (referencias a Z3 y acciones de Z4) | Sí (Z5 con tres niveles; evidencia plegada) |
| Pruebas técnicas | Sí (datos simulados): `test-fase3-propiedad-z5.js` | Sí |
| Validación externa | No | No |
| Integración en la aplicación real | No | No |
| Publicación | No | No |

## 5. Defecto relacionado (doble contabilización en Z3) — verificación
La brecha total y la del canal que la concentra describen el mismo dinero. Corregido en la derivación (ambas comparten el grupo de superposición): el total de Z3 no muestra cifra, la tarjeta del canal declara «Parte del importe de otro elemento: ya está incluida; no se suma» y la total «incluye la parte de otros elementos; no se suman»; el canal sigue identificándose con su título y su importe propio. Detector C20 y pruebas C1–C5 de `test-fase3-propiedad-z5.js` (más de 100 lecturas) con mutación. No se modificó `combineImpacts`.

## 6. Limitaciones
La visión de conjunto es cualitativa (sin cifras, por D-06); el orden de prioridad definitivo es de 4.4; el contenido real de Z5 (tabla de canales, método) se integra en la aplicación en fases posteriores; falta validación con usuarios, dispositivos y datos reales.
