#!/usr/bin/env python3
"""Clasifica TODOS los cambios pendientes del repositorio (modificados y sin rastrear) en los commits PROPUESTOS y escribe docs/command-center/PROPUESTA_CONSERVACION_GIT.md.
NO ejecuta git add, commit, push ni nada que modifique el repositorio: solo lee `git status`. Falla si un archivo queda sin clasificar o clasificado dos veces.
Uso: python3 tools/audit/propuesta_conservacion.py"""
import json, pathlib, re, subprocess, collections
R = pathlib.Path(__file__).resolve().parents[2]; D = R / 'docs/command-center'
st = subprocess.check_output(['git', '-C', str(R), 'status', '--short', '-uall'], text=True).splitlines()
files = {l[3:]: l[:2].strip() for l in st}                     # ruta -> M | ??
head = subprocess.check_output(['git', '-C', str(R), 'rev-parse', '--short', 'HEAD'], text=True).strip()
branch = subprocess.check_output(['git', '-C', str(R), 'branch', '--show-current'], text=True).strip()
base = json.loads((D / 'generated/HASHES_BASE_3_3.json').read_text())
acc_docs = {'docs/command-center/' + k for k in base['documentos_aceptados']}
F12_DOCS = {'docs/command-center/' + k for k in base['documentos_aceptados'] if not k.startswith(('FASE_3_2', 'MATRIZ_TRAZABILIDAD_Z1', 'AUDITORIA_FINAL', 'ESCENARIOS_Z1', 'z1_3_2', 'generated/ESCENARIOS_Z1', 'generated/MATRIZ_TRAZABILIDAD_Z1', 'wireframes/z1_3_2'))}
CONTRATOS = {'tools/audit/' + k.split('/')[-1] for k in ['command-center-contracts.js']}
def cat(f):
    if f == 'js/economics/impactModel.js' or f == 'index.html' or f.startswith('js/'): return 'C1'
    if f in ('ARCHITECTURE.md', 'docs/presentation-intelligence/PROMPT_PARA_OTRA_IA.md'): return 'C3'
    if f.endswith('.png'): return 'C7'
    if f.startswith('tools/regression/') or f.startswith('tools/test-'):
        return 'C5' if re.search(r'fase3|capturas_fase3', f) else 'C2'
    if f in CONTRATOS: return 'C3'
    if f in F12_DOCS: return 'C3'
    if f.startswith('docs/command-center/generated/') and any(x in f for x in ('CATALOGO', 'INVENTARIO', 'MATRIZ_AUDITORIA')) : return 'C3'
    if f.startswith('docs/command-center/') or f.startswith('tools/audit/'): return 'C4'
    return 'X'
groups = collections.defaultdict(list)
for f in sorted(files): groups[cat(f)].append(f)
NAMES = {
 'C1': ('Código de la aplicación (Fases 1 y 2) — PRODUCCIÓN', 'Fase 1: CSP en `index.html` y 5 textos de interfaz/comentarios de Cohere (documentados en `FASE_1_AUDITORIA.md` §F y probados por `test-fase1-ia-sin-clave-local.js`). Fase 2: atribución unificada, economía dual y margen opcional (`ACEPTACION_FASE_2.md`; lista de archivos en `ESTADO.md` «Archivos modificados»). **Cambia el comportamiento de la aplicación al integrarse**: requiere tu aprobación expresa antes de cualquier rama de producción.', 'Fase 1 y 2 (aceptadas)'),
 'C2': ('Pruebas de las Fases 1 y 2', 'Pruebas de código y de navegador de las Fases 1 y 2 (atribución, economía dual, contratos, CSP, XSS, IA sin clave local, consistencia de cálculos, margen, modelo real) y `run_batch.py` (el ejecutor de lotes de navegador con CSP).', 'Fase 1 y 2 (aceptadas)'),
 'C3': ('Documentos y contratos aceptados (Fases 1–2 y 3.1)', 'Los documentos aceptados de `docs/command-center/` (Fases 1 y 2 y la arquitectura 3.1, esta con la **aclaración H-01 autorizada**), `command-center-contracts.js`, `ARCHITECTURE.md` y `PROMPT_PARA_OTRA_IA.md` (notas de Fase 1).', 'Aceptados'),
 'C4': ('Fase 3 — documentos, especificaciones ejecutables, prototipo y artefactos generados', 'Documentos de 3.2 (aceptada, con la corrección D-05 autorizada), de 3.3–3.5 (pendientes de aceptación) y de la ronda de calidad, D-05, D-07, H-01 y H-02; especificaciones `tools/audit/` (Z1, Z3, Z4, Z5, coherencia, escenarios comerciales, verificadores y registro de modificaciones autorizadas); wireframes y prototipo HTML; JSON y matrices generados.', 'Fase 3 (3.1–3.2 aceptadas; 3.3–3.5 pendientes)'),
 'C5': ('Fase 3 — pruebas y lotes de navegador', '`tools/test-fase3-*.js`, `batch_fase3_*.py` y `capturas_fase3_*.py`.', 'Fase 3'),
 'C7': ('Evidencias visuales (capturas PNG)', 'Capturas de Chromium emulado de los wireframes y del prototipo; consumidas por los verificadores documentales (ver auditoría de capturas).', 'Fase 3'),
 'X': ('SIN CLASIFICAR (procedencia no demostrada)', 'Ninguna regla los cubre.', '—'),
}
if groups.get('X'): print('SIN CLASIFICAR:', groups['X']); raise SystemExit(1)
assert sum(len(v) for v in groups.values()) == len(files)
L = [f'# Propuesta de conservación del trabajo en Git (NO ejecutada)', '',
 f'> Generado por `tools/audit/propuesta_conservacion.py` (solo lee `git status`). Rama `{branch}` · HEAD `{head}` · {sum(1 for v in files.values() if v == "M")} archivos modificados y {sum(1 for v in files.values() if v == "??")} nuevos (en `-uall`).',
 '> **No se ejecutó ni se ejecutará ningún commit, push, merge, despliegue o publicación sin tu autorización expresa.** La autorización para conservar una ronda anterior no se aplica a estos cambios.', '',
 '**Rama de destino propuesta:** la rama de trabajo existente `' + branch + '` (nunca `main` ni una rama de producción; sin PR ni merge). **Orden propuesto:** C1+C2 → C3 → C4+C5 → C7 (cuatro commits; C1 y C2 pueden ir juntos).', '']
ORDER = ['C1', 'C2', 'C3', 'C4', 'C5', 'C7']
MSG = {'C1': 'Fases 1 y 2: CSP, textos de Cohere, atribución unificada y modelo económico dual (código de la aplicación)', 'C2': 'Fases 1 y 2: pruebas de código y de navegador', 'C3': 'Docs: documentos y contratos aceptados de las Fases 1–2 y 3.1 (con la aclaración H-01)', 'C4': 'Fase 3: diseño de Z1–Z5, especificaciones, prototipo y artefactos; cierre de D-05, D-07, H-01 y H-02', 'C5': 'Fase 3: pruebas y lotes de navegador', 'C7': 'Fase 3: capturas de evidencia (Chromium emulado)'}
L += ['## Resumen', '', '| Commit | Contenido | Archivos | Mensaje propuesto |', '|---|---|---|---|']
for k in ORDER: L.append(f'| {k} | {NAMES[k][0]} | {len(groups[k])} | `{MSG[k]}` |')
L += ['', '**Clases pedidas:** cambios de código → C1 · documentos aceptados → C3 (y los de 3.2 dentro de C4, marcados abajo) · especificaciones y prototipos de Fase 3 → C4 · pruebas → C2 y C5 · evidencias visuales → C7 · **cambios ajenos o de procedencia no demostrada → ninguno** (los cinco archivos de texto de Cohere y `ARCHITECTURE.md`/`PROMPT_PARA_OTRA_IA.md` tienen procedencia demostrada en Fase 1; ver `INFORME_CIERRE_H01_H02_FASE_3.md`).', '']
for k in ORDER:
    name, why, fase = NAMES[k]
    L += [f'## {k} · {name}', '', f'*Procedencia / fase:* {fase}. {why}', '', f'Mensaje propuesto: `{MSG[k]}`', '', '<details><summary>Lista de archivos (' + str(len(groups[k])) + ')</summary>', '']
    for f in groups[k]: L.append(f'- `{f}` ({"modificado" if files[f] == "M" else "nuevo"})')
    L += ['', '</details>', '']
L += ['## Verificación posterior (si autorizas el commit y el push)', '',
 '1. `git status` limpio y `git log` con los commits propuestos, en la rama de trabajo.', '2. El HEAD remoto de la rama coincide con el local.', '3. Desde un clon limpio de esa rama: `node tools/selftest-node.js`, los `tools/test-*.js`, `python3 tools/audit/verificar_consistencia_3_1.py … 3_5.py` y los lotes de navegador con `tools/regression/run_batch.py`.', '4. Comparar los hashes de `generated/MODIFICACIONES_AUTORIZADAS.json` y de la línea base de `generated/HASHES_BASE_3_3.json`.', '5. Confirmar que no se subió nada a la rama de producción y que la aplicación publicada no cambió.']
(D / 'PROPUESTA_CONSERVACION_GIT.md').write_text('\n'.join(L) + '\n')
print({k: len(v) for k, v in groups.items()}, 'total', len(files))
