#!/usr/bin/env python3
"""Genera docs/command-center/MATRIZ_TRAZABILIDAD_Z1.md desde generated/MATRIZ_TRAZABILIDAD_Z1.json (la fuente de verdad, validada contra la aplicación por
tools/regression/batch_fase3_2_z1_wireframe.py y contra el documento y el wireframe por tools/audit/verificar_consistencia_3_2.py).
Uso: python3 tools/audit/matriz_z1_md.py   (con CC32_ROOT se escribe/lee en otra raíz, solo para pruebas de mutación)"""
import json, os, pathlib
R = pathlib.Path(os.environ.get('CC32_ROOT') or pathlib.Path(__file__).resolve().parents[2])
d = json.loads((R / 'docs/command-center/generated/MATRIZ_TRAZABILIDAD_Z1.json').read_text())
o = ['# Matriz de trazabilidad de Z1 — Lectura ejecutiva (Subfase 3.2)', '',
     'Generada desde `generated/MATRIZ_TRAZABILIDAD_Z1.json` con `python3 tools/audit/matriz_z1_md.py` (no editar a mano). Conecta cada requisito de Z1 con la decisión que lo origina (D-01 a D-06), su componente visual en el wireframe (`wireframes/z1_3_2_wireframe.html`, atributo `data-wf`), la fuente de datos, el motor o contrato responsable, su estado, la evidencia y la dependencia pendiente. Las filas M-xx remiten a la matriz de 3.1.', '',
     '**No se presenta como disponible nada que solo esté propuesto en el diseño.** Las brechas se documentan como dependencias futuras; no se implementan.', '', '## Estados']
o += [f'- **{k}**: {v}' for k, v in d['estados'].items()]
o += ['', '## Categorías de dependencia (Fase 4 y Fase 5)']
o += [f'- **{k}**: {v}' for k, v in d['categoriasDependencia'].items()]
o += ['', '## Matriz', '', '| Id | Requisito | Decisión relacionada | Componente visual | Fuente de datos | Motor o contrato | Estado | Evidencia | Dependencia pendiente |', '|---|---|---|---|---|---|---|---|---|']
for r in d['filas']:
    mot = ', '.join(f'`{m}`' for m in r['motores']) or f"_especificación:_ `{r['especificacion']}`"
    dep = '; '.join(f"{x['categoria']} ({x['fase']}): {x['detalle']}" for x in r['dependencias']) or 'Ninguna'
    o.append(f"| {r['id']} | {r['requisito']} | {r['decision']} | {r['componente']} (`{r['wireframe']}`) | {r['fuente']} | {r['motor']}: {mot} | **{r['estado']}** | {r['evidencia']} | {dep} |")
c = {e: sum(1 for r in d['filas'] if r['estado'] == e) for e in d['estados']}
o += ['', f"**Resumen:** {len(d['filas'])} requisitos: {c['Disponible']} Disponible · {c['Parcial']} Parcial · {c['Por desarrollar']} Por desarrollar.", '', '## Dependencias por categoría y fase', '']
cats = {k: [] for k in d['categoriasDependencia']}
for r in d['filas']:
    for x in r['dependencias']: cats[x['categoria']].append((r['id'], x['fase'], x['detalle']))
for k, v in cats.items():
    o += [f"### {k} — {d['categoriasDependencia'][k]}", ''] + ([f'- {i} · Fase {f}: {t}' for i, f, t in v] or ['- (ninguna)']) + ['']
(R / 'docs/command-center/MATRIZ_TRAZABILIDAD_Z1.md').write_text('\n'.join(o) + '\n')
print('ok', c)
