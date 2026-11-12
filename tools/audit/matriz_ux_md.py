#!/usr/bin/env python3
"""Genera docs/command-center/MATRIZ_UX_MOTORES.md desde generated/MATRIZ_UX_MOTORES.json (la fuente de verdad, validada contra la aplicación por
tools/regression/batch_fase3_1_home_auditoria.py). Uso: python3 tools/audit/matriz_ux_md.py"""
import json, pathlib
R = pathlib.Path(__file__).resolve().parents[2]
d = json.loads((R / 'docs/command-center/generated/MATRIZ_UX_MOTORES.json').read_text())
out = ['# Matriz de relación: elemento UX ↔ fuente ↔ motor ↔ estado (Subfase 3.1)', '',
       'Generada desde `generated/MATRIZ_UX_MOTORES.json` (`python3 tools/audit/matriz_ux_md.py`). La batería `batch_fase3_1_home_auditoria.py` comprueba contra la aplicación real que cada ruta `FP.*` declarada existe cuando el estado es Disponible o Parcial, y que lo «Por desarrollar» no existe aún en `js/`.', '',
       '**Los motores calculan; la experiencia visual presenta.** Ninguna fila pide duplicar lógica: cuando algo no existe, se indica la subfase que lo completa.', '', '## Estados']
out += [f'- **{k}**: {v}' for k, v in d['estados'].items()]
out += ['', '## Matriz', '', '| Id | Elemento UX | Fuente de información | Motor responsable | Estado | Se completa en |', '|---|---|---|---|---|---|']
for r in d['filas']:
    mot = ', '.join(f'`{m}`' for m in r['motores']) or (f"_especificación:_ `{r['especificacion']}`" if r.get('especificacion') else '—')
    nota = f" _{r['nota']}_" if r.get('nota') else ''
    out.append(f"| {r['id']} | {r['elemento']} | {r['fuente']} | {mot}{nota} | **{r['estado']}** | {r['completa']} |")
from collections import Counter
c = Counter(r['estado'] for r in d['filas'])
out += ['', f"**Resumen:** {c['Disponible']} Disponible · {c['Parcial']} Parcial · {c['Por desarrollar']} Por desarrollar (de {len(d['filas'])} elementos)."]
(R / 'docs/command-center/MATRIZ_UX_MOTORES.md').write_text('\n'.join(out) + '\n')
print('ok', dict(c))
