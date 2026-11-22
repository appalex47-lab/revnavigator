#!/usr/bin/env python3
"""Genera docs/command-center/MATRIZ_TRAZABILIDAD_Z3.md o _Z4.md desde generated/MATRIZ_TRAZABILIDAD_Z#.json (la fuente de verdad).
Uso: python3 tools/audit/matriz_zona_md.py Z3|Z4   (con CC33_ROOT se lee/escribe en otra raíz, solo para pruebas de mutación)"""
import json, os, pathlib, sys
R = pathlib.Path(os.environ.get('CC33_ROOT') or pathlib.Path(__file__).resolve().parents[2]); Z = sys.argv[1]; assert Z in ('Z3', 'Z4')
d = json.loads((R / f'docs/command-center/generated/MATRIZ_TRAZABILIDAD_{Z}.json').read_text())
sub = d['subfase']
o = [f'# Matriz de trazabilidad de {Z} — Subfase {sub}', '', f'Generada desde `generated/MATRIZ_TRAZABILIDAD_{Z}.json` con `python3 tools/audit/matriz_zona_md.py {Z}` (no editar a mano). Conecta cada requisito con la decisión que lo origina, su componente visual (`data-wf-f` en el wireframe), la fuente de datos, el motor o contrato responsable, su estado, la evidencia y la dependencia pendiente. Las filas M-xx remiten a la matriz de 3.1.', '',
     '**No se presenta como disponible nada que solo esté propuesto en el diseño.** Las brechas se documentan como dependencias futuras; no se implementan.', '', '## Estados'] + [f'- **{k}**: {v}' for k, v in d['estados'].items()]
o += ['', '## Categorías de dependencia'] + [f'- **{k}**: {v}' for k, v in d['categoriasDependencia'].items()]
o += ['', '## Matriz', '', '| Id | Requisito | Decisión relacionada | Componente visual | Fuente de datos | Motor o contrato | Estado | Evidencia | Dependencia pendiente |', '|---|---|---|---|---|---|---|---|---|']
for r in d['filas']:
    mot = ', '.join(f'`{m}`' for m in r['motores']) or f"_especificación:_ `{r['especificacion']}`"
    dep = '; '.join(f"{x['categoria']} ({x['fase']}): {x['detalle']}" for x in r['dependencias']) or 'Ninguna'
    o.append(f"| {r['id']} | {r['requisito']} | {r['decision']} | {r['componente']} (`{r['wireframe']}`) | {r['fuente']} | {r['motor']}: {mot} | **{r['estado']}** | {r['evidencia']} | {dep} |")
c = {e: sum(1 for r in d['filas'] if r['estado'] == e) for e in d['estados']}
o += ['', f"**Resumen:** {len(d['filas'])} requisitos: {c['Disponible']} Disponible · {c['Parcial']} Parcial · {c['Por desarrollar']} Por desarrollar.", '', '## Dependencias por categoría', '']
cats = {k: [] for k in d['categoriasDependencia']}
for r in d['filas']:
    for x in r['dependencias']: cats[x['categoria']].append((r['id'], x['fase'], x['detalle']))
for k, v in cats.items(): o += [f"### {k} — {d['categoriasDependencia'][k]}", ''] + ([f'- {i} · Fase {f}: {t}' for i, f, t in v] or ['- (ninguna)']) + ['']
(R / f'docs/command-center/MATRIZ_TRAZABILIDAD_{Z}.md').write_text('\n'.join(o) + '\n'); print('ok', Z, c)
