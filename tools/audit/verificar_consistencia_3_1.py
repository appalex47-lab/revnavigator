#!/usr/bin/env python3
"""Subfase 3.1 — verifica que el DOCUMENTO (FASE_3_1_ARQUITECTURA_INFORMACION.md), la MATRIZ (JSON y Markdown), el WIREFRAME (HTML) y ESTADO.md no se contradicen.
Solo lee archivos. Uso: python3 tools/audit/verificar_consistencia_3_1.py   (sale con código 1 si hay una contradicción)"""
import json, re, sys, pathlib, subprocess, tempfile, shutil
import os
R = pathlib.Path(os.environ.get('CC31_ROOT') or pathlib.Path(__file__).resolve().parents[2])   # CC31_ROOT solo se usa para pruebas de mutación sobre una copia
D = R / 'docs/command-center'
doc = (D / 'FASE_3_1_ARQUITECTURA_INFORMACION.md').read_text()
mdm = (D / 'MATRIZ_UX_MOTORES.md').read_text()
wf = (D / 'wireframes/home_3_1_wireframe.html').read_text()
est = (D / 'ESTADO.md').read_text()
mat = json.loads((D / 'generated/MATRIZ_UX_MOTORES.json').read_text())
rows = mat['filas']; ids = [r['id'] for r in rows]
ok = 0; bad = []
def chk(name, cond, detail=''):
    global ok
    print(('✔ ' if cond else '✘ ') + name + ('' if cond else f' — {detail}'))
    if cond: ok += 1
    else: bad.append(name)
wf_ids = set(re.findall(r'data-wf="([^"]+)"', wf))
# ---------- matriz ----------
chk('C1 la matriz JSON tiene ids únicos y contiguos M01..M33', ids == [f'M{i:02d}' for i in range(1, len(ids) + 1)] and len(ids) == 33, ids[-3:])
cnt = {e: sum(1 for r in rows if r['estado'] == e) for e in mat['estados']}
chk('C2 los conteos de la matriz (11 Disponible, 19 Parcial, 3 Por desarrollar) coinciden con el documento', cnt == {'Disponible': 11, 'Parcial': 19, 'Por desarrollar': 3} and '**33 elementos: 11 Disponible, 19 Parcial, 3 Por desarrollar.**' in doc, cnt)
chk('C3 el Markdown de la matriz declara los mismos conteos que el JSON', f"**Resumen:** {cnt['Disponible']} Disponible · {cnt['Parcial']} Parcial · {cnt['Por desarrollar']} Por desarrollar (de {len(rows)} elementos)." in mdm)
tmp = pathlib.Path(tempfile.mkdtemp()); shutil.copytree(R / 'tools/audit', tmp / 'tools/audit'); (tmp / 'docs/command-center/generated').mkdir(parents=True); shutil.copy(D / 'generated/MATRIZ_UX_MOTORES.json', tmp / 'docs/command-center/generated/')
subprocess.run([sys.executable, str(tmp / 'tools/audit/matriz_ux_md.py')], check=True, capture_output=True)
chk('C4 MATRIZ_UX_MOTORES.md es exactamente lo que genera el JSON (sin ediciones a mano)', (tmp / 'docs/command-center/MATRIZ_UX_MOTORES.md').read_text() == mdm); shutil.rmtree(tmp)
refs = sorted(set(re.findall(r'\bM\d{2}\b', doc)))
chk('C5 toda fila M-xx citada en el documento existe en la matriz', all(m in ids for m in refs), [m for m in refs if m not in ids])
chk('C6 las filas nuevas M27 a M33 están citadas en el documento', all(f'M{i}' in refs for i in range(27, 34)), [f'M{i}' for i in range(27, 34) if f'M{i}' not in refs])
chk('C7 cada fila «Por desarrollar» tiene su especificación y ninguna fuente FP.* (no existe en js/)', all(r.get('especificacion') and not r['motores'] for r in rows if r['estado'] == 'Por desarrollar'))
chk('C8 «Se completa en» solo cita subfases existentes (3.x, 4.x, 5.x) o «—»', all(re.fullmatch(r'—|((3|4|5)\.[1-5]( \(diseño\)| \(motor\))?)( · (3|4|5)\.[1-5]( \(diseño\)| \(motor\))?)*', r['completa']) for r in rows), [r['completa'] for r in rows if not re.fullmatch(r'—|((3|4|5)\.[1-5]( \(diseño\)| \(motor\))?)( · (3|4|5)\.[1-5]( \(diseño\)| \(motor\))?)*', r['completa'])])
# ---------- numeración y capas (aclaración A) ----------
heads = re.findall(r'^## (\d+)\. ', doc, re.M)
chk('C9 las secciones del documento son §0 a §16, contiguas y sin repetir', heads == [str(i) for i in range(0, 17)], heads)
chk('C10 el documento define NAV, BC y Z1–Z5 y no existe «Zona 0» en documento ni wireframe', all(x in doc for x in ['**NAV**', '**BC**', '**Z1 a Z5**']) and 'Zona 0' not in doc.replace('no existe «Zona 0»', '') and 'ZONA 0' not in wf.upper() and '0 · CONTEXTO' not in wf.upper())
chk('C11 el wireframe tiene las capas nav, bc y las cinco zonas z1..z5', {'nav', 'bc', 'z1', 'z2', 'z3', 'z4', 'z5'} <= wf_ids, wf_ids)
chk('C12 el wireframe rotula NAV, BC y Z1–Z5 con los mismos nombres que el documento', all(f'{z} · ' in wf for z in ['BC', 'Z1', 'Z2', 'Z3', 'Z4', 'Z5']) and 'Z2 · QUÉ OCURRIÓ Y POR QUÉ' in wf and 'Z3 · QUÉ MERECE ATENCIÓN' in wf and 'Z4 · QUÉ HAGO' in wf and 'Z5 · EVIDENCIA Y DETALLE' in wf and 'Z1 · LECTURA EJECUTIVA' in wf)
chk('C13 el documento nombra las mismas zonas que el wireframe (Z1 Lectura ejecutiva, Z2 Qué ocurrió y por qué, Z3 Qué merece atención, Z4 Qué hago, Z5 Evidencia y detalle)', all(t in doc for t in ['**Z1** Lectura ejecutiva', '**Z2** Qué ocurrió y por qué', '**Z3** Qué merece atención', '**Z4** Qué hago', '**Z5** Evidencia y detalle']))
# ---------- decisiones aprobadas ----------
tbl = {}
for line in doc.split('\n'):
    m = re.match(r'\| \*\*(D-0[1-4]|A\.|B\.)\*?\*?[^|]*\| \*\*([^|]+?)\*\* \|', line)
    if m: tbl[m.group(1)] = (m.group(2), line)
chk('C14 D-01 a D-04 figuran como Aprobada (D-02, D-03 y D-04 «con condición») y A y B como Incorporada', tbl.get('D-01', ('',))[0] == 'Aprobada' and all(tbl.get(k, ('',))[0] == 'Aprobada con condición' for k in ['D-02', 'D-03', 'D-04']) and tbl.get('A.', ('',))[0] == 'Incorporada' and tbl.get('B.', ('',))[0] == 'Incorporada', {k: v[0] for k, v in tbl.items()})
miss = []
for k, (_, line) in tbl.items():
    cells = [c.strip() for c in line.strip().strip('|').split('|')]
    for w in re.findall(r'`([a-z0-9-]+)`', cells[-1]):
        if w not in wf_ids and w not in ('z1…', 'z5'): miss.append((k, w))
    for m in re.findall(r'\bM\d{2}\b', cells[-2]):
        if m not in ids: miss.append((k, m))
chk('C15 todo elemento de wireframe y fila de matriz que la tabla de decisiones cita existe', not miss, miss)
chk('C16 el wireframe contiene cada elemento del que depende una decisión (data-wf requerido presente)', {'z2-detalle-atribucion', 'z3-lista', 'z3-clases', 'z3-seleccion', 'z4-ver-todas', 'z1-narrativa', 'z5-sin-recorrido', 'bc-confiabilidad', 'z1-condicion', 'var-confiabilidad-media', 'var-confiabilidad-baja'} <= wf_ids)
# ---------- D-01 ----------
chk('C17 D-01: Z2 integra «qué ocurrió», «por qué» y «dónde» y conserva el detalle de atribución y la hipótesis aparte (documento y wireframe)', {'z2-ocurrio', 'z2-porque', 'z2-donde', 'z2-detalle-atribucion', 'z2-hipotesis'} <= wf_ids and all(t in doc for t in ['**Qué ocurrió:**', '**Por qué:**', '**Dónde se concentra:**', 'Detalle metodológico y de atribución']))
# ---------- D-02 ----------
chk('C18 D-02: las tres clases (Hallazgo, Riesgo, Oportunidad) están en documento, wireframe y matriz (M27) con significado y tratamiento propios', all(f'{s} {c}' in wf for s, c in [('◆', 'Hallazgo'), ('▲', 'Riesgo'), ('●', 'Oportunidad')]) and all(f'**{c}**' in doc for c in ['Hallazgo', 'Riesgo', 'Oportunidad']) and 'M27' in ids and 'hallazgo' in rows[26]['elemento'].lower() and 'riesgo' in rows[26]['elemento'].lower() and 'oportunidad' in rows[26]['elemento'].lower() and 'se describe y se evidencia' in doc.lower() and 'impacto en riesgo' in doc.lower() and 'alternativas excluyentes' in doc)
chk('C19 D-02: no se confunden clases: el documento prohíbe sumar importes entre clases y el wireframe lo repite', 'no se suma al de otra' in doc and 'nunca se mezclan en un mismo importe' in wf)
# ---------- D-03 ----------
chk('C20 D-03: «3 de N / Ver todos» (hallazgos) y «3 de M / Ver todas» (acciones) en documento y wireframe; el universo no se limita', '3 de N' in doc and 'Ver todos (N)' in doc and '3 de M' in doc and 'Ver todas (M)' in doc and '3 de N' in wf and 'Ver todos (N)' in wf and '3 de M' in wf and 'Ver todas (M)' in wf and 'El universo total no se limita a tres' in doc)
chk('C21 D-03: los tres criterios de selección (urgencia, impacto, confiabilidad) están en documento y wireframe y los filtros por clase en ambos', all(t in doc for t in ['**Urgencia:**', '**Impacto:**', '**Confiabilidad:**']) and 'impacto, urgencia y confiabilidad' in wf and 'Todos · Hallazgos · Riesgos · Oportunidades' in wf and 'Todos · Hallazgos · Riesgos · Oportunidades' in doc and {'M28', 'M30'} <= set(refs))
# ---------- D-04 ----------
fold_titles = re.findall(r'<div class="fold"[^>]*><b>(.*?)</b>', wf)
chk('C22 D-04: el wireframe no contiene un bloque «Recorrido del sistema» ni «Resumen en texto» (solo la nota que explica que se retiraron)', not any(('Recorrido' in t or 'Resumen en texto' in t) for t in fold_titles) and 'z5-sin-recorrido' in wf_ids and wf.count('Resumen en texto') == 1 and 'ya no es un bloque' in wf)
chk('C23 D-04: la narrativa corta/larga se conserva dentro de Z1 (documento, wireframe y matriz M31)', 'Ver contexto' in wf and 'z1-narrativa' in wf_ids and '«Ver contexto ▸»' in doc and 'M31' in ids and 'Narrativa corta/larga' in rows[30]['elemento'])
chk('C24 D-04: cada pieza retirada tiene destino en el documento (no se pierde información) y el Recorrido pasa a ayuda', all(t in doc for t in ['**Resumen en texto**', '**Recorrido del sistema**', '**Preparación de datos**', '**¿Cómo voy en detalle?**', '**Tarjeta larga «Tu siguiente mejor paso»**', 'Ninguna información útil se pierde']) and 'vista de ayuda existente' in doc.lower() and 'M32' in ids and 'sale del Home principal' in rows[31]['elemento'])
chk('C25 D-04: las filas del «Resumen en texto» (Cómo voy, Cierre, Qué pesa, Canales, Atención, Desde ayer, Confianza) tienen destino en el documento', all(t in doc for t in ['«Cómo voy» y «Cierre» → Z1', '«Qué pesa» y «Canales» → Z2', '«Atención» → Z3', '«Desde ayer» → marca «nuevo» en Z3', '«Confianza» → BC y Z5']))
# ---------- aclaración B ----------
chk('C26 B: el documento define los cuatro niveles de confiabilidad (Alta, Media, Baja, Insuficiente) y la regla «nunca más contundente que su sustento»', all(f'| **{n}** |' in doc for n in ['Alta', 'Media', 'Baja', 'Insuficiente']) and 'nunca es mayor que la confiabilidad global' in doc)
chk('C27 B: el wireframe refleja la regla (BC con confiabilidad, Z1 lectura condicionada, variantes media y baja con «preliminar» y «no concluyente») y la matriz tiene M29', 'preliminar' in wf and 'Diagnóstico no concluyente' in wf and 'con avisos' in wf and 'Lectura condicionada'.upper() in wf.upper() and 'M29' in ids and 'Lectura preliminar' in doc and 'Diagnóstico no concluyente' in doc)
chk('C28 B: la confiabilidad se ve fuera de los plegables (BC y Z1) en documento y wireframe', 'nunca solo en un plegable' in doc and 'siempre visible' in wf and 'no plegados' in wf)
# ---------- sin restos de la versión anterior ----------
import re as _re
stale = [t for t in ['26 elementos', '9 Disponible, 15 Parcial', 'Decisiones que requieren tu validación', 'Qué lo explica (B + C)'] if t in doc or t in mdm]
stale += [t for t in ['D-11', 'D-13'] if _re.search(r'(?<![A-Z])' + t, doc)]
stale += ['Zona 0'] if 'Zona 0' in doc.replace('no existe «Zona 0»', '') else []
chk('C29 no quedan afirmaciones de la versión anterior (26 elementos, Zona 0, decisiones D-11/D-13, decisiones por validar)', not stale, stale)
chk('C30 el documento no promete código ni funcionalidades fuera de alcance (3.2, Fase 4 solo como dependencia)', 'No cambia código de la aplicación ni contratos metodológicos' in doc and 'Esta subfase solo define el destino' in doc)
# ---------- ESTADO.md ----------
names = ['1.1 Auditoría de arquitectura y código', '1.2 Inventario de módulos, datos e indicadores', '1.3 Auditoría de motores de cálculo y diagnósticos', '1.4 Auditoría de Cohere e IA', '1.5 Identificación de brechas y oportunidades',
 '2.1 Modelo de lectura ejecutiva', '2.2 Modelo de indicadores y drivers', '2.3 Motor de detección de desviaciones', '2.4 Modelo de riesgos y oportunidades', '2.5 Modelo de cuantificación económica',
 '3.1 Arquitectura de información', '3.2 Resumen ejecutivo', '3.3 Hallazgos, riesgos y oportunidades', '3.4 Prioridades y recomendaciones', '3.5 Prototipo y validación UX',
 '4.1 Integración de fuentes y contexto', '4.2 Motor de diagnósticos', '4.3 Patrones y desviaciones', '4.4 Priorización de riesgos y oportunidades', '4.5 Cálculo del impacto económico',
 '5.1 Arquitectura de contexto para IA', '5.2 Narrativa ejecutiva', '5.3 Explicación de causas y hallazgos', '5.4 Recomendaciones inteligentes', '5.5 Validación de calidad, seguridad y consistencia',
 '6.1 Integración del Command Center', '6.2 Validación funcional y matemática', '6.3 Seguridad, persistencia y sincronización', '6.4 Pruebas UX, móvil y rendimiento', '6.5 Liberación y documentación']
state_of = {}
for line in est.split('\n'):
    for n in names:
        if f'| {n} |' in line: state_of[n] = line.split(f'| {n} |')[1].strip().strip('|').strip()
chk('C31 ESTADO.md lista las 30 subfases con los nombres exactos del roadmap maestro', len(state_of) == 30, [n for n in names if n not in state_of])
# ---------- Máquina de estados del roadmap (endurecida) ----------
# El roadmap avanza con el proyecto, pero solo por caminos válidos. Rangos: 0 NO INICIADA · 1 EN EJECUCIÓN · 2 COMPLETADA (no aceptada) · 3 ACEPTADA (con o sin limitaciones).
# Se permite cualquier avance legítimo (p. ej. 3.2 aceptada y 3.3 en ejecución) pero se detectan: texto de estado desconocido o incompatible (p. ej. «COMPLETADA … ACEPTADA» a la vez),
# saltos (una subfase iniciada o completada mientras otra anterior sigue sin aceptar, o dos abiertas a la vez), retrocesos (contra el registro de máximos `generated/ESTADO_MAXIMOS.json`,
# que solo sube y se actualiza con `--registrar`) y contradicciones entre documentos (un documento nunca afirma más que ESTADO.md; el de la subfase abierta coincide exactamente).
def rank_of(txt):
    t = txt.strip()
    if t.startswith('NO INICIADA'): return 0 if t == 'NO INICIADA' else None
    if t.startswith('EN EJECUCIÓN'): return None if 'ACEPTADA' in t.replace('no aceptada', '') else 1
    if t.startswith('COMPLETADA Y ACEPTADA') or t.startswith('ACEPTADA'): return None if re.search(r'no aceptada|NO ACEPTADA|no iniciada', t) else 3
    if t.startswith('COMPLETADA'): return 2 if 'ACEPTADA' not in t.replace('no aceptada', '') and 'no aceptada' in t else None
    return None
AUTH_F = D / 'generated/AUTORIZACIONES.json'
AUTH = set((json.loads(AUTH_F.read_text()).get('ejecucion_continua') or {}).get('subfases') or []) if AUTH_F.exists() else set()
def machine_errors(ranks, hdr_exec):
    """Sin saltos ni retrocesos. Por defecto solo puede haber UNA subfase abierta (la primera sin aceptar). Excepción expresa: las subfases listadas en
    generated/AUTORIZACIONES.json (ejecución continua autorizada por el usuario) pueden estar abiertas o completadas en cadena, siempre que todas las anteriores
    estén al menos COMPLETADAS; ninguna puede figurar ACEPTADA mientras una anterior no lo esté."""
    e = [f'{n}: estado desconocido o incompatible «{state_of[n]}»' for n, r in zip(names, ranks) if r is None]
    if e: return e
    f = next((k for k, r in enumerate(ranks) if r < 3), None)
    if f is not None:
        for k in range(f + 1, 30):
            if ranks[k] == 0: continue
            chain = names[k][:3] in AUTH and names[f][:3] in AUTH and all(names[j][:3] in AUTH for j in range(f, k)) and all(ranks[j] >= 2 for j in range(f, k)) and ranks[k] <= 2
            if not chain: e.append(f'salto: {names[k]} ({["no iniciada", "en ejecución", "completada", "aceptada"][ranks[k]]}) con {names[f]} sin aceptar y sin autorización de ejecución continua válida')
        open_ph = {names[k][0] for k in range(f, 30) if 0 < ranks[k] < 3}
        if ranks[f] >= 1 and names[f][0] not in hdr_exec: e.append(f'la Fase {names[f][0]} tiene una subfase abierta y su encabezado no dice EN EJECUCIÓN')
        e += [f'la Fase {x} figura EN EJECUCIÓN sin tener la subfase abierta' for x in hdr_exec if x not in open_ph and x != names[f][0]]
    elif hdr_exec: e.append('todas las subfases aceptadas pero hay una fase EN EJECUCIÓN')
    return e
ranks = [rank_of(state_of[n]) if n in state_of else None for n in names]
hdr_exec = {m.group(1) for line in est.split('\n') for m in [re.match(r'\| \*\*(\d)\. [^|]*?\*\*[^|]*EN EJECUCIÓN[^|]*\|', line)] if m}
chk('C32 ESTADO.md: máquina de estados del roadmap (estados válidos y compatibles; sin saltos ni subfases abiertas en paralelo; las anteriores a la abierta están aceptadas y las posteriores sin iniciar)', not machine_errors(ranks, hdr_exec), machine_errors(ranks, hdr_exec))
MAX = D / 'generated/ESTADO_MAXIMOS.json'
if '--registrar' in sys.argv:
    cur = {n: r for n, r in zip(names, ranks) if r is not None}; old = json.loads(MAX.read_text()) if MAX.exists() else {}
    MAX.write_text(json.dumps({n: max(cur.get(n, 0), old.get(n, 0)) for n in names}, ensure_ascii=False, indent=1) + '\n'); print('registro de máximos actualizado')
hw = json.loads(MAX.read_text()) if MAX.exists() else None
regress = [f'{n}: figura «{state_of.get(n)}» y ya estuvo en rango {hw[n]}' for n, r in zip(names, ranks) if hw and (r is None or r < hw.get(n, 0))]
chk('C34 ESTADO.md no retrocede: ninguna subfase está por debajo del máximo registrado en generated/ESTADO_MAXIMOS.json (que cubre las 30 subfases y solo sube)', hw is not None and set(hw) == set(names) and not regress, regress or 'falta el registro de máximos')
def doc_rank(path, kind):
    f = D / path
    if not f.exists(): return None
    m = re.search(r'^\*\*Estado:\*\*\s*(.+)$', f.read_text(), re.M)
    if not m: return -1
    t = m.group(1)
    if re.search(r'no (está )?aceptada|todavía no aceptada', t): return 2 if t.startswith('COMPLETADA') else -1
    return 3 if re.match(r'(COMPLETADA Y )?ACEPTADA', t) else 2 if t.startswith('COMPLETADA') else 1 if t.startswith('EN EJECUCIÓN') else -1
x_err = []
for nm, path in [('3.1 Arquitectura de información', 'FASE_3_1_ARQUITECTURA_INFORMACION.md'), ('3.2 Resumen ejecutivo', 'FASE_3_2_RESUMEN_EJECUTIVO.md'), ('3.3 Hallazgos, riesgos y oportunidades', 'FASE_3_3_HALLAZGOS_RIESGOS_OPORTUNIDADES.md'), ('3.4 Prioridades y recomendaciones', 'FASE_3_4_PRIORIDADES_RECOMENDACIONES.md'), ('3.5 Prototipo y validación UX', 'FASE_3_5_PROTOTIPO_VALIDACION_UX.md')]:
    dr_, er_ = doc_rank(path, nm), ranks[names.index(nm)]
    if dr_ == -1: x_err.append(f'{path}: línea «Estado:» ausente o ilegible')
    elif dr_ is not None and er_ is not None:
        if dr_ > er_: x_err.append(f'{path} afirma un estado superior al de ESTADO.md')
        if er_ < 3 and dr_ != er_: x_err.append(f'{path} (subfase abierta) no coincide con ESTADO.md')
        if er_ == 3 and dr_ < 3 and 'aceptación formal' not in state_of[nm]: x_err.append(f'ESTADO.md acepta {nm} pero su fila no registra la aceptación formal')
chk('C35 los documentos de subfase no contradicen a ESTADO.md (ninguno afirma más; el de la subfase abierta coincide; una aceptación posterior queda registrada como aceptación formal)', not x_err, x_err)
cur = re.search(r'Subfase actual: (\d\.\d)', est); f_ = next((k for k, r in enumerate(ranks) if r is not None and r < 3), None)
opens = {names[k][:3] for k, r in enumerate(ranks) if r is not None and 0 < r < 3}   # con ejecución continua autorizada puede haber varias abiertas o completadas sin aceptar
chk('C36 «Subfase actual» de ESTADO.md es una subfase abierta del roadmap (la primera sin aceptar o, con ejecución continua autorizada, cualquiera de la cadena abierta)', f_ is None or ranks[f_] == 0 or (cur is not None and (cur.group(1) == names[f_][:3] or cur.group(1) in opens)), (cur and cur.group(1), sorted(opens)))
chk('C33 ESTADO.md registra D-01 a D-04 como aprobadas y la aceptación formal de 3.1', 'D-01' in est and 'D-04' in est and 'aprobad' in est.lower() and 'aceptación formal' in est)
print(f'\n{ok} bien, {len(bad)} mal'); print('TODO CONSISTENTE' if not bad else 'CONTRADICCIONES: ' + '; '.join(bad)); sys.exit(1 if bad else 0)
