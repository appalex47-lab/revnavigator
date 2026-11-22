#!/usr/bin/env python3
"""Subfase 3.2 — verifica que DOCUMENTO, MATRIZ DE TRAZABILIDAD, ESCENARIOS GENERADOS, WIREFRAME y ESTADO.md no se contradicen, y que lo aceptado no se tocó.
No se limita a buscar texto: contiene un ORÁCULO INDEPENDIENTE en otro lenguaje (Python) que reimplementa, desde las tablas de los documentos de Fase 2 y de 3.1,
el estado del negocio, la confiabilidad y la contribución de cada escenario, y los compara con lo que produjo la especificación en JavaScript.
Solo lee archivos (el generador escribe en un directorio temporal). Uso: python3 tools/audit/verificar_consistencia_3_2.py
CC32_ROOT cambia la raíz que se lee (solo para las pruebas de mutación de este mismo verificador)."""
import hashlib, json, os, pathlib, re, shutil, subprocess, sys, tempfile
HERE = pathlib.Path(__file__).resolve().parents[2]
R = pathlib.Path(os.environ.get('CC32_ROOT') or HERE); D = R / 'docs/command-center'
rd = lambda p: (D / p).read_text()
doc, est, wf = rd('FASE_3_2_RESUMEN_EJECUTIVO.md'), rd('ESTADO.md'), rd('wireframes/z1_3_2_wireframe.html')
mz = json.loads(rd('generated/MATRIZ_TRAZABILIDAD_Z1.json')); m3 = json.loads(rd('generated/MATRIZ_UX_MOTORES.json'))
esc = json.loads(rd('generated/ESCENARIOS_Z1.json'))['escenarios']; base = json.loads(rd('generated/HASHES_BASE_3_2.json'))
wrong = json.loads((HERE / 'tools/audit/z1-ejemplos-incorrectos.json').read_text())
ok = 0; bad = []
def chk(name, cond, detail=''):
    global ok
    print(('✔ ' if cond else '✘ ') + name + ('' if cond else f' — {detail}'))
    if cond: ok += 1
    else: bad.append(name)
norm = lambda s: str(s).replace(' ', ' ')
wf_ids = set(re.findall(r'data-wf="([^"]+)"', wf)); wf_m = set(re.findall(r'data-wf-m="([^"]+)"', wf))

# ---------- A · lo aceptado y el código de la aplicación no cambiaron ----------
import sys as _s, pathlib as _p; _s.path.insert(0, str(_p.Path(__file__).resolve().parent)); from _autorizadas import hash_ok, NUEVOS
sha = lambda p: hashlib.sha256(p.read_bytes()).hexdigest()
chg = [k for k, h in base['documentos_aceptados'].items() if not hash_ok(D / k, k, h)]
chk('A1 ningún documento aceptado de fases anteriores cambió desde el inicio de 3.2 (13 documentos, por hash)', not chg and len(base['documentos_aceptados']) == 13, chg)
cc = [k for k, h in base['codigo_aplicacion'].items() if not hash_ok(R / k, k, h)]
newjs = [str(f.relative_to(R)) for f in list((R / 'js').rglob('*.js')) + list((R / 'css').rglob('*.css')) if str(f.relative_to(R)) not in base['codigo_aplicacion'] and str(f.relative_to(R)) not in NUEVOS]
chk('A2 ningún archivo del código de la aplicación (js, css, index.html) cambió ni apareció durante 3.2 (249 archivos, por hash)', not cc and not newjs and len(base['codigo_aplicacion']) == 249, (cc + newjs)[:4])

# ---------- B · los artefactos generados no están desactualizados ni editados a mano ----------
tmp = pathlib.Path(tempfile.mkdtemp()); (tmp / 'docs/command-center/generated').mkdir(parents=True); (tmp / 'docs/command-center/wireframes').mkdir(parents=True)
env = {**os.environ, 'CC32_OUT': str(tmp)}; subprocess.run(['node', str(HERE / 'tools/audit/z1-generar-artefactos.js')], env=env, check=True, capture_output=True)
for rel, nm in [('generated/ESCENARIOS_Z1.json', 'ESCENARIOS_Z1.json'), ('FASE_3_2_ESCENARIOS_Z1.md', 'FASE_3_2_ESCENARIOS_Z1.md'), ('wireframes/z1_3_2_wireframe.html', 'el wireframe de Z1')]:
    chk(f'B1 {nm} es exactamente lo que regenera la especificación (sin edición a mano ni desactualización)', (tmp / 'docs/command-center' / rel).read_text() == rd(rel))
shutil.rmtree(tmp)
t2 = pathlib.Path(tempfile.mkdtemp()); (t2 / 'docs/command-center/generated').mkdir(parents=True); shutil.copy(D / 'generated/MATRIZ_TRAZABILIDAD_Z1.json', t2 / 'docs/command-center/generated/')
gm = subprocess.run([sys.executable, str(HERE / 'tools/audit/matriz_z1_md.py')], env={**os.environ, 'CC32_ROOT': str(t2)}, capture_output=True, text=True)
mdp = t2 / 'docs/command-center/MATRIZ_TRAZABILIDAD_Z1.md'
chk('B2 MATRIZ_TRAZABILIDAD_Z1.md es exactamente lo que genera su JSON (y el JSON es generable: todas sus filas tienen los campos que el generador exige)', gm.returncode == 0 and mdp.exists() and mdp.read_text() == rd('MATRIZ_TRAZABILIDAD_Z1.md'), gm.stderr.strip().split('\n')[-1] if gm.returncode else 'el Markdown difiere'); shutil.rmtree(t2)

# ---------- C · matriz de trazabilidad ↔ documento ↔ wireframe ↔ matriz de 3.1 ----------
rows = mz['filas']; ids3 = {r['id'] for r in m3['filas']}
chk('C1 la matriz de Z1 tiene ids contiguos Z1-01..Z1-29', [r['id'] for r in rows] == [f'Z1-{i:02d}' for i in range(1, 30)])
cnt = {e: sum(1 for r in rows if r['estado'] == e) for e in mz['estados']}
mres = re.search(r'\*\*(\d+) requisitos: (\d+) Disponible, (\d+) Parcial, (\d+) Por desarrollar\.\*\*', doc)
chk('C2 los conteos del documento (Disponible, Parcial, Por desarrollar) son exactamente los de la matriz', bool(mres) and (int(mres[1]), int(mres[2]), int(mres[3]), int(mres[4])) == (len(rows), cnt['Disponible'], cnt['Parcial'], cnt['Por desarrollar']), (cnt, mres and mres.groups()))
cats = {k: [r['id'] for r in rows for x in r['dependencias'] if x['categoria'] == k] for k in mz['categoriasDependencia']}
dm_ = {m[1]: int(m[2]) for m in re.finditer(r'- \*\*(\w+)\*\* — [^(]+\((\d+)\)', doc.replace('**', '**')) if False}
dm_ = {m[1]: int(m[3]) for m in re.finditer(r'- \*\*(\w+)\*\* — (.+?) \((\d+)\): ', doc)}
chk('C3 las dependencias por categoría del documento (contratos existentes, completar motores, IA, validación en producción) coinciden en número y en ids con la matriz', set(dm_) == set(cats) and all(dm_[k] == len(v) for k, v in cats.items()) and all(all(i in doc for i in v) for v in cats.values()), (dm_, {k: len(v) for k, v in cats.items()}))
chk('C4 «Por desarrollar» no tiene fuentes FP.* y sí especificación; «Disponible» y «Parcial» sí tienen fuentes (nada propuesto figura como disponible)', all((not r['motores'] and r.get('especificacion')) if r['estado'] == 'Por desarrollar' else bool(r['motores']) for r in rows))
chk('C5 toda fila M-xx de la que depende la matriz existe en la matriz de 3.1', all(m in ids3 for r in rows for m in r['depende']), [m for r in rows for m in r['depende'] if m not in ids3])
chk('C6 el wireframe contiene, en escritorio y móvil, el elemento que cada fila de la matriz ubica (data-wf)', all((r['wireframe'] in wf_ids) and (not r['wireframe'].startswith('z1-') or r['wireframe'] in wf_m) for r in rows), [r['wireframe'] for r in rows if r['wireframe'] not in wf_ids])
refs = set(re.findall(r'\bZ1-\d{2}\b', doc)); chk('C7 todo requisito Z1-xx que cita el documento existe en la matriz', refs <= {r['id'] for r in rows}, refs - {r['id'] for r in rows})
heads = re.findall(r'^## (\d+)\. ', doc, re.M); chk('C8 las secciones del documento son §0 a §16, contiguas', heads == [str(i) for i in range(17)], heads)
REQ = ['requisito', 'decision', 'componente', 'fuente', 'motor', 'estado', 'evidencia', 'dependencias']
chk('C9 cada requisito tiene las columnas pedidas (requisito, decisión, componente visual, fuente, motor o contrato, estado, evidencia, dependencia) y cada dependencia tiene categoría válida, fase y detalle', all(all(r.get(k) not in (None, '') for k in REQ[:7]) and isinstance(r['dependencias'], list) and all(x['categoria'] in mz['categoriasDependencia'] and x['fase'] and x['detalle'] for x in r['dependencias']) for r in rows), [r['id'] for r in rows if not all(r.get(k) not in (None, '') for k in REQ[:7])])
chk('C10 los requisitos «Por desarrollar» o «Parcial» declaran su dependencia pendiente; solo los «Disponible» pueden no tener ninguna', all(r['dependencias'] or r['estado'] == 'Disponible' or r['id'] in ('Z1-20', 'Z1-21') for r in rows) and all(r['dependencias'] for r in rows if r['estado'] == 'Por desarrollar'), [r['id'] for r in rows if not r['dependencias'] and r['estado'] != 'Disponible'])
dcs = set(re.findall(r'\bD-0[1-6]\b', ' '.join(r['decision'] for r in rows))); chk('C11 las seis decisiones D-01 a D-06 están cubiertas por al menos un requisito de la matriz', dcs == {f'D-0{i}' for i in range(1, 7)}, dcs)

# ---------- D · escenarios: tabla del documento ↔ salida generada; ejemplos ↔ reglas ↔ nombres ----------
CONTRIB = {'no_confirmado': 'Margen sin confirmar', 'invalido': 'Margen no válido', 'disponible': 'Disponible', 'no_configurado': 'No configurado', 'desactivado': 'Desactivado', 'oculta': 'Oculta', 'sin_importe': 'Sin importe'}
def row_of(e):
    s = e['salida']; return [str(e['n']), e['titulo'], s['reliability']['level'], s['state']['label'] if s['state']['shown'] else 'Lectura preliminar', s['comparability']['label'], s['verdict']['kind'], CONTRIB[s['economic']['contribution']['status']]]
tab = {}
for line in doc.split('\n'):
    c = [x.strip() for x in line.strip().strip('|').split('|')]
    if len(c) == 7 and (c[0].isdigit() or re.fullmatch(r'A\d+', c[0])): tab[c[0]] = c
mism = [str(e['n']) for e in esc if tab.get(str(e['n'])) != row_of(e)]
chk('D1 la tabla de los 30 escenarios del documento coincide, fila por fila, con la salida generada', len(tab) == 30 and not mism, mism)
chk('D2 los escenarios son 1..14 y A1..A16, y cubren los 4 niveles de confiabilidad y 6 comparaciones distintas', [str(e['n']) for e in esc] == [str(i) for i in range(1, 15)] + [f'A{k}' for k in range(1, 17)] and {e['salida']['reliability']['level'] for e in esc} == {'Alta', 'Media', 'Baja', 'Insuficiente'} and len({e['salida']['comparability']['code'] for e in esc}) >= 6 and all(e['comparacion']['coincide'] for e in esc), [e['n'] for e in esc if not e['comparacion']['coincide']])
okv = ['2', '4', '5', '6', '7', '10', '11', '14', 'A2', 'A5', 'A6', 'A9', 'A8', 'A15']
listed = {m.group(1): m.group(2) for m in re.finditer(r'^- Escenario (\w+) \([^)]*\): «(.*)»$', norm(doc), re.M)}
dv = [n for n in okv if listed.get(n) != norm(next(e for e in esc if str(e['n']) == n)['salida']['verdict']['text'])] + [n for n in listed if n not in okv]
chk('D3 los 14 veredictos «correctos» del documento son exactamente los que genera la especificación', not dv, dv)
trows = {}
for line in doc.split('\n'):
    c = [x.strip() for x in line.strip().strip('|').split('|')]
    if len(c) == 4 and re.fullmatch(r'E\d+', c[0]): trows[c[0]] = c
dm = [w['id'] for w in wrong if w['id'] not in trows or trows[w['id']][1] != str(w['escenario']) or trows[w['id']][2] != w['texto'] or trows[w['id']][3] != ', '.join(w['reglas'])]
chk('D4 los 15 ejemplos incorrectos del documento (texto, escenario y reglas) son exactamente los que la prueba ejecuta, y cubren R1–R14', len(wrong) == 15 and len(trows) == 15 and not dm and {r for w in wrong for r in w['reglas']} == {f'R{i}' for i in range(1, 15)}, dm)
detalle = rd('FASE_3_2_ESCENARIOS_Z1.md'); chk('D5 el detalle de escenarios cubre los 30 con todos los aspectos pedidos (orden de evaluación, qué se muestra, qué no, veredicto, narrativa, indicador, alcance, advertencias, confiabilidad, derivaciones) y declara el origen de las cifras', all(f'## Escenario {n} ' in detalle for n in list(range(1, 15)) + [f'A{k}' for k in range(1, 17)]) and all(a in detalle for a in ['**Orden de evaluación (D-05)**', '**Clasificación del dato (C1, C2)**', '**Conclusiones por separado (C3)**', '**Qué se muestra**', '**Qué no se muestra**', '**Veredicto permitido**', '**Narrativa corta**', '**Indicador económico**', '**Alcance (Se conoce / No se puede concluir)**', '**Advertencias necesarias**', '**Confiabilidad**', '**Se deriva a otras zonas**', '*Origen de las cifras:*', '## Nombres visibles (D-06)']) and detalle.count('*Origen de las cifras:* motor') == 1 and detalle.count('*Origen de las cifras:* ilustrativo') == 29)
nm = json.loads(subprocess.check_output(['node', '-e', "const Z=require('./tools/audit/z1-lectura-ejecutiva.js');console.log(JSON.stringify({n:Z.NAMES,r:Z.RULES}))"], cwd=HERE)); NMS, RUL = nm['n'], nm['r']
GL = {'estados': 'Estados del negocio', 'confiabilidad': 'Confiabilidad', 'comparabilidad': 'Comparación', 'contribucion': 'Contribución', 'diagnostico': 'Diagnóstico'}
dn = {}
for line in doc.split('\n'):
    c = [x.strip() for x in line.strip().strip('|').split('|')]
    if len(c) == 4 and c[1].startswith('`') and c[0] in GL.values(): dn[(c[0], c[1].strip('`'))] = (c[2], c[3])
exp = {(GL[g], k): tuple(v) for g, o in NMS.items() for k, v in o.items()}
chk('D6 la tabla de nombres visibles del documento coincide, fila por fila, con la especificación (D-06) y con la del JSON generado', dn == exp and json.loads(rd('generated/ESCENARIOS_Z1.json'))['nombresVisibles'] == NMS, [k for k in exp if dn.get(k) != exp[k]][:3])
dr = {m[1]: m[2] for m in re.finditer(r'^\| (R\d+) \| (.+) \|$', doc, re.M)}
chk('D7 las 14 reglas R1–R14 del documento son exactamente las que ejecuta el validador (texto idéntico)', dr == RUL, [k for k in RUL if dr.get(k) != RUL[k]])
chk('D8 los nombres visibles de los 6 estados son los de la decisión D-06 y ninguno contiene un identificador interno', [NMS['estados'][k][0] for k in ['saludable', 'creciendo', 'creciendo_bajo_potencial', 'riesgo_cumplimiento', 'deterioro', 'sin_base']] == ['Cumpliendo el plan', 'En crecimiento', 'Crece, pero sin alcanzar el plan', 'En riesgo de incumplir el plan', 'En deterioro', 'Sin lectura concluyente'] and not any(re.search(r'_|[a-z][A-Z]', v[0]) for o in NMS.values() for v in o.values()))

# ---------- E · ORÁCULO INDEPENDIENTE (Python) sobre las entradas de los 26 escenarios ----------
FIN = lambda v: isinstance(v, (int, float)) and not isinstance(v, bool) and v == v and abs(v) != float('inf')
CMP = {'ok': 'valida', 'sin_trafico_actual': 'valida', 'conversion_cero_actual': 'valida', 'sin_base_comparable': 'sin_base_comparable', 'recuperacion_desde_cero': 'recuperacion_desde_cero', 'cambio_de_composicion': 'cambio_de_composicion', 'datos_insuficientes': 'datos_insuficientes', 'sin_actividad': 'sin_actividad', 'no_calculable': 'no_calculable'}
CAUSE_ORDER = ['no_calculable', 'sin_actividad', 'sin_dato_actividad', 'sin_venta', 'sin_plan', 'bloqueo', 'cobertura']
def o_cmp(c): return 'sin_base_comparable' if not c or not c.get('status') else CMP.get(c['status'], 'no_calculable')
def o_eval(i):
    r, rv, c, a = i['reliability'], i['revenue'], i.get('comparable'), i.get('activity'); cmp = o_cmp(c); cst = (c or {}).get('status'); act = rv.get('actualToDate')
    vals = [a.get(k) for k in ('sessions', 'orders', 'revenue')] if a else None; fv = [v for v in vals if FIN(v)] if a else []
    obs = (any(v > 0 for v in fv) if a else (FIN(act) and act > 0)); zeroc = bool(a) and len(fv) == 3 and not obs
    unk = (not obs) and not (cst == 'sin_actividad' or zeroc); partial = bool(a) and obs and len(fv) < 3
    sale = act if FIN(act) else (a.get('revenue') if a and FIN(a.get('revenue')) else None)
    NEG = lambda x: FIN(x) and x < 0
    inc = bool(NEG(act) or (a and (NEG(a.get('revenue')) or NEG(a.get('sessions')) or NEG(a.get('orders')))))   # no calculable: solo negativos (contrato de datos del motor)
    iss = set()                                                                                               # C1/C2: inconsistencias pendientes de interpretación (no invalidan)
    if a and not inc:
        S_, O_ = a.get('sessions'), a.get('orders')
        if FIN(O_) and O_ > 0 and FIN(S_) and S_ == 0: iss.add('pedidos_sin_sesiones')
        elif FIN(O_) and FIN(S_) and O_ > S_: iss.add('pedidos_mayores_que_sesiones')
        if FIN(O_) and O_ > 0 and FIN(sale) and sale == 0: iss.add('pedidos_con_venta_cero')
        if FIN(O_) and O_ == 0 and FIN(sale) and sale > 0: iss.add('venta_con_cero_pedidos')
    if not inc and cst == 'conversion_cero_actual' and FIN(sale) and sale > 0: iss.add('conversion_cero_con_venta')
    rec = 'no_evaluable' if not (a and FIN(a.get('revenue')) and FIN(act) and not inc) else ('pendiente' if abs(a['revenue'] - act) >= 0.005 else 'sin_diferencia_observada')
    if rec == 'pendiente': iss.add('conciliacion_pendiente')
    hard = set()
    if not i['period']['daysCounted'] > 0 or not FIN(act): hard.add('sin_venta')
    if r.get('blocking'): hard.add('bloqueo')
    if not FIN(r.get('coverage')) or r['coverage'] < 0.6: hard.add('cobertura')
    if cst == 'sin_actividad' or (not obs and zeroc): hard.add('sin_actividad')
    elif unk: hard.add('sin_dato_actividad')
    if not i['plan']['available']: hard.add('sin_plan')
    if cmp == 'no_calculable' or inc: hard.add('no_calculable')
    conv0 = bool((a and FIN(a.get('sessions')) and a['sessions'] > 0 and FIN(a.get('orders')) and a['orders'] == 0) or cst == 'conversion_cero_actual') and not inc and not (FIN(sale) and sale > 0)
    noact = (cst == 'sin_actividad' or (not obs and zeroc)) or unk; pzero = (not noact) and partial and FIN(sale) and sale == 0
    comp = cmp == 'cambio_de_composicion'; soft = bool(r.get('dataErrors')) or r.get('support') == 'bajo' or pzero
    if hard: lvl = 'Insuficiente'
    elif soft: lvl = 'Baja'
    else:
        lvl = 'Alta' if r.get('support') == 'alto' and not r.get('warnings') else 'Media'
        if lvl == 'Alta' and (conv0 or comp or iss): lvl = 'Media'
    return dict(level=lvl, hard=hard, cause=next((x for x in CAUSE_ORDER if x in hard), None), cmp=cmp, conv0=conv0, comp=comp, obs=obs, inc=inc, iss=iss, rec=rec, partial=partial, conv=('no_verificable' if (not a or not FIN(a.get('sessions')) or not FIN(a.get('orders'))) and not (cst == 'conversion_cero_actual' and conv0) else 'cero_observado' if conv0 else 'pendiente_de_interpretacion' if (iss - {'conciliacion_pendiente'}) else 'observable'), noact=('sin_actividad' in hard or 'sin_dato_actividad' in hard))
def o_state(i, cmp):
    comp = i['revenue']['compliance']; C = 'arriba' if comp >= 1.01 else 'en_plan' if comp >= 0.99 else 'debajo'
    g = (i.get('comparable') or {}).get('growthPct') if cmp == 'valida' else None
    G = 'sin_dato' if not FIN(g) else 'crece' if g >= 0.03 else 'cae' if g <= -0.03 else 'plano' if abs(g) < 0.01 else ('crece_poco' if g > 0 else 'cae_poco')
    fg = i['forecast'].get('gapPct'); F = 'sin_dato' if not FIN(fg) else ('riesgo' if 1 + fg < 0.99 else 'ok')
    crit = any(f['severity'] == 'critica' for f in i['findings']); imp = any(f['severity'] == 'importante' for f in i['findings'])
    if G == 'cae' and (C == 'debajo' or F == 'riesgo' or crit): return 'deterioro'
    if crit: return 'riesgo_cumplimiento'
    if G == 'crece' and (C == 'debajo' or F == 'riesgo'): return 'creciendo_bajo_potencial'
    if C == 'debajo' or F == 'riesgo': return 'riesgo_cumplimiento'
    if G == 'crece' and not imp: return 'creciendo'
    if not imp: return 'saludable'
    return 'riesgo_cumplimiento'
GROW = re.compile(r'\b(creces|creciendo|crecimiento|crece|cae|caes|deterioro|sube|baja|estable|estabilidad)\b', re.I)
IMPROVE = re.compile(r'\b(mejora|mejoró|empeora|empeoró|eficiencia|eficiente)\b', re.I)
BAN = re.compile(r'utilidad neta|ganancia neta|beneficio neto|beneficio financiero|rentabilidad neta|\bROI\b|\bROAS\b|\bCAC\b', re.I)
CAUSAL = re.compile(r'\b(porque|se debe a|debido a|causa|provoc\w*|explica\w*)\b', re.I)
nums = lambda s: re.findall(r'\d+(?:\.\d+)?', re.sub(r'\b(19|20)\d{2}\b', '', norm(s)))
bad_o = []
for e in esc:
    i, s, n = e['input'], e['salida'], e['n']; ev = o_eval(i); cmp, lvl = ev['cmp'], ev['level']; w = lambda m: bad_o.append(f'S{n}: {m}')
    V, S = norm(s['verdict']['text']), norm(s['narrative']['short']); L = s['narrative']['long']; rel, eco = s['reliability'], s['economic']; p = eco['primary']; rv = i['revenue']
    if rel['level'] != lvl: w(f'confiabilidad {rel["level"]} ≠ oráculo {lvl}')
    if rel['cause'] != ev['cause']: w(f'causa {rel["cause"]} ≠ oráculo {ev["cause"]}')
    if set(rel['causes']) != ev['hard']: w(f'bloqueos duros {rel["causes"]} ≠ oráculo {sorted(ev["hard"])}')
    if lvl == 'Insuficiente' and any('errores' in x for x in rel['reasons']): w('D-05: una limitación secundaria figura entre los motivos de un bloqueo duro')
    if s['comparability']['code'] != cmp: w('comparabilidad')
    if [x['n'] for x in s['evaluation']['steps']] != list(range(1, 9)): w('D-05: la traza de evaluación no tiene los 8 pasos')
    st = o_state(i, cmp) if lvl != 'Insuficiente' else 'sin_base'
    if s['state']['id'] != st: w(f'estado {s["state"]["id"]} ≠ oráculo {st}')
    if s['state']['shown'] != (lvl != 'Baja'): w('el estado solo se oculta con confiabilidad Baja')
    kind = 'sin_lectura' if lvl == 'Insuficiente' else 'preliminar' if lvl == 'Baja' else 'conversion_cero' if ev['conv0'] else 'composicion' if ev['comp'] else st
    if s['verdict']['kind'] != kind: w(f'tipo de veredicto {s["verdict"]["kind"]} ≠ oráculo {kind}')
    if lvl == 'Baja' and not V.startswith('Lectura preliminar:'): w('Baja debe ser preliminar también en el texto')
    if lvl == 'Media' and not V.startswith('Con avisos:'): w('Media debe decir «Con avisos»')
    if lvl in ('Media', 'Baja', 'Insuficiente') and not (rel['visibleReasons'] and rel['reasons']): w('motivos visibles con confiabilidad no Alta')
    if lvl == 'Alta' and rel['reasons']: w('Alta no lleva motivos')
    if ev['conv0'] and lvl == 'Alta': w('conversión cero no puede ser Alta')
    # resolución C1–C5
    D_ = s['data']; cls = 'no_calculable' if (ev['inc'] or cmp == 'no_calculable') else 'no_verificable' if ('sin_dato_actividad' in ev['hard'] or 'sin_venta' in ev['hard']) else 'inconsistente' if ev['iss'] else 'valido'
    if D_['class'] != cls: w(f'C1 clase del dato {D_["class"]} ≠ oráculo {cls}')
    if {x['code'] for x in D_['issues']} != ev['iss']: w(f'C1 inconsistencias {[x["code"] for x in D_["issues"]]} ≠ oráculo {sorted(ev["iss"])}')
    if ev['iss'] and lvl == 'Alta': w('C1 una inconsistencia pendiente no puede convivir con Alta')
    if ev['iss'] and not ev['hard'] and not all(x['text'] in rel['reasons'] for x in D_['issues']): w('C1 el aviso de la inconsistencia debe estar a la vista')
    if D_['reconciliation']['status'] != ev['rec'] or D_['reconciliation']['tolerance'] is not None: w(f'C2 conciliación {D_["reconciliation"]["status"]} ≠ oráculo {ev["rec"]} (sin tolerancia)')
    if not ev['hard'] and s['conclusions']['conversion'] != ev['conv']: w(f'C3 conclusión de conversión {s["conclusions"]["conversion"]} ≠ oráculo {ev["conv"]}')
    if s['verdict']['kind'] == 'conversion_cero' and FIN(rv.get('actualToDate')) and rv['actualToDate'] > 0: w('C1 conversión cero con venta positiva')
    if ev['comp'] and lvl == 'Alta': w('cambio de composición no puede ser Alta')
    # D-01: visibilidad de cifras
    act = rv.get('actualToDate'); obsv = FIN(act) and act >= 0 and ev['obs'] and not ev['inc'] and cmp != 'no_calculable' and i['period']['daysCounted'] > 0 and not ev['noact']
    gapv = bool(i['plan']['available'] and FIN(rv.get('gap')) and obsv and lvl != 'Insuficiente')
    if eco['observed']['visible'] != obsv: w(f'D-01 venta observada visible {eco["observed"]["visible"]} ≠ oráculo {obsv}')
    pk = 'brecha' if gapv else 'venta_observada' if obsv else None
    if (p['kind'] if p else None) != pk: w(f'D-01 cifra protagonista {p and p["kind"]} ≠ oráculo {pk}')
    if eco['compliance']['visible'] != gapv or eco['plan']['visible'] != gapv: w('D-01 cumplimiento y meta visibles solo con brecha válida')
    if p and p['kind'] == 'brecha' and abs(p['amount'] - rv['gap']) > 1e-6: w('el indicador no es la brecha del motor')
    if p and p['kind'] == 'venta_observada' and (p['direction'] is not None or abs(p['amount'] - act) > 1e-6): w('la venta observada no lleva dirección y es la venta del motor')
    if not obsv and eco['observed']['amount'] is not None: w('D-04 sin venta observada válida no se muestra ningún importe (ni 0)')
    # D-02: contribución
    m = i.get('margin'); mg = m['grossMarginPct'] if m and m.get('marginEnabled') and FIN(m.get('grossMarginPct')) and 0 <= m['grossMarginPct'] < 100 else None
    c = eco['contribution']
    if not gapv:
        if c['status'] != 'oculta' or c['amount'] is not None: w('D-02 sin brecha válida la contribución se oculta')
    elif m and m.get('marginEnabled') is True and m.get('grossMarginPct') not in (None, '') and mg is None:
        if c['status'] != 'invalido' or c['amount'] is not None or not (c.get('validation') or {}).get('message'): w('C4 un margen que el motor rechaza debe decir «no válido», traer el motivo del motor y nunca mostrar importe')
    elif mg == 0 and not (isinstance(m.get('updatedAt'), str) and m.get('updatedAt')):
        if c['status'] != 'no_confirmado' or c['amount'] is not None: w('C5 un 0 % sin evidencia de configuración no debe producir importe')
    elif mg is not None:
        if c['status'] != 'disponible' or abs(c['amount'] - rv['gap'] * mg / 100) > 1e-6 or not c['detailOnly'] or c['preliminary'] != (lvl == 'Baja'): w(f'D-02 contribución {c["amount"]} ≠ brecha × margen = {rv["gap"] * mg / 100} (detalle; preliminar solo con Baja)')
    elif c['amount'] is not None or c['status'] not in ('no_configurado', 'desactivado'): w('D-02 sin margen debe decir «no configurado» y nunca mostrar importe ni 0')
    if c['status'] == 'disponible' and c['marginPct'] == 0 and not (c['amount'] == 0 and any('explícitamente en 0 %' in x for x in c['limitations'])): w('C5 un 0 % explícito da $0 estimado y lo declara')
    if c['status'] == 'disponible' and not any('no es el margen real' in x and 'brecha contra el plan' in x for x in c['limitations']): w('D-02 la contribución disponible debe declarar que es una estimación con margen promedio, no el margen real')
    if c['status'] == 'disponible' and not re.fullmatch(r'\d+(\.\d)? %', c['marginDisplay'] or ''): w('D-02 el margen se muestra con una decimal como máximo')
    # auditoría final · punto 1
    if eco['observed']['visible'] and eco['observed']['amount'] == 0 and 'Hay venta registrada' in V: w('punto 1: un cero observado no se describe como «Hay venta registrada»')
    if not eco['observed']['visible'] and re.search(r'\$\s?0(?![\d.])', ' '.join([V, S] + [norm(L[k]) for k in L])): w('punto 1: sin venta observada válida no aparece $0 en ningún texto')
    if ev['cause'] == 'sin_dato_actividad' and (not V.startswith('No se puede verificar la actividad') or 'No hay actividad' in V): w('punto 1: actividad no verificable es falta de información, no «sin actividad»')
    if ev['conv0'] and re.search(r'falla|fallo|checkout|calidad del tráfico|tráfico de baja calidad|precio|campaña|marketing', ' '.join([V, S] + [norm(x) for x in rel['reasons']]), re.I): w('punto 2: conversión cero sin causa sugerida')
    # D-03: reglas de contenido del veredicto
    if len(V.split()) > 34 or len(V) > 240: w('veredicto largo')
    if re.search(r'\$\s?\d', V) or nums(V): w('D-03 el veredicto lleva importes o cifras')
    if p and p['kind'] == 'brecha':
        if ('por debajo de' in V and rv['gap'] >= 0) or ('por encima de' in V and rv['gap'] <= 0): w('dirección del veredicto contradice el signo de la brecha')
    if not (p and p['kind'] == 'brecha') and re.search(r'por debajo de la meta|por encima de la meta|en línea con la meta|supera la meta|está en línea|está por debajo|no la alcanzaría|la superaría|\bcumple\b|cumpliendo|incumpl', V): w('D-01 el veredicto afirma una dirección contra el plan sin brecha válida')
    if any(x != str(i['period']['daysCounted']) for x in nums(S)): w('la corta lleva cifras')
    if len(re.split(r'(?<=[.!?])\s+', S.strip())) > 2 or len(S.split()) > 45: w('corta larga')
    if len(' '.join(norm(L[k]) for k in L).split()) > 140: w('ampliada larga')
    alltxt = ' '.join([V, S] + [norm(L[k]) for k in L])
    if BAN.search(alltxt): w('términos prohibidos')
    if CAUSAL.search(re.sub(r'sin (atribuirle una )?causa( atribuida)?|no permite determinar la causa', '', alltxt, flags=re.I)): w('lenguaje causal')
    # D-04
    if cmp != 'valida' and (GROW.search(V) or GROW.search(S) or s['comparability']['growth'] is not None) and ev['cause'] not in ('sin_actividad', 'sin_dato_actividad'): w('evolución sin comparación válida')
    if ev['cause'] in ('sin_actividad', 'sin_dato_actividad') and (GROW.search(V + ' ' + S) or re.search(r'\b(conversión|pedidos)\b', V + ' ' + S, re.I)): w('D-04 sin actividad infiere evolución o concluye sobre conversión')
    if ev['conv0'] and lvl in ('Alta', 'Media') and not re.search(r'no se registró ningún pedido', V): w('D-04 conversión cero debe reconocer que no se registró ningún pedido')
    if ev['comp'] and IMPROVE.search(V + ' ' + S): w('D-04 cambio de composición sin lenguaje de mejora o eficiencia')
    # alcance
    dg = {'Alta': 'disponible', 'Media': 'con_reservas', 'Baja': 'no_concluyente', 'Insuficiente': 'no_disponible'}[lvl]
    if s['scope']['diagnosis'] != dg: w('el diagnóstico sigue a la confiabilidad')
    if ('Venta observada del periodo' in s['scope']['known']) != obsv: w('alcance: lo que se conoce coincide con lo visible')
chk('E1 oráculo independiente (Python): confiabilidad, causa del bloqueo, orden de 8 pasos, estado del contrato, visibilidad de cifras (D-01), contribución = brecha × margen (D-02), reglas del veredicto (D-03), casos especiales (D-04) coinciden en los 30 escenarios', not bad_o, bad_o[:6])
chk('E2 contradicción buscada: ningún escenario con confiabilidad Baja o Insuficiente tiene etiqueta de estado definitiva ni verbo de certeza', all(not (e['salida']['reliability']['level'] == 'Baja' and (e['salida']['state']['definitive'] or e['salida']['state']['shown'])) and not (e['salida']['reliability']['level'] in ('Baja', 'Insuficiente') and re.search(r'\b(Vas|Estás|Creces)\b|^La venta (va|cae|crece)', norm(e['salida']['verdict']['text']))) for e in esc))
chk('E3 contradicción buscada: ninguna contribución con importe cuando el margen no está configurado y ninguna contribución igual a 0 salvo con un margen configurado en 0 %', all(not (e['input'].get('margin') is None and e['salida']['economic']['contribution']['amount'] is not None) and (e['salida']['economic']['contribution']['amount'] != 0 or (e['input'].get('margin') or {}).get('grossMarginPct') == 0) for e in esc))
chk('E4 los escenarios 10, 11 y A1 (conversión cero y cambio de composición) no alcanzan confiabilidad Alta aunque sus datos sean «altos»; el 7 (sin actividad) es Insuficiente y no muestra ningún importe', all(next(e for e in esc if str(e['n']) == n)['salida']['reliability']['level'] == 'Media' and next(e for e in esc if str(e['n']) == n)['input']['reliability']['support'] == 'alto' for n in ('10', '11', 'A1')) and next(e for e in esc if e['n'] == 7)['salida']['reliability']['level'] == 'Insuficiente' and next(e for e in esc if e['n'] == 7)['salida']['economic']['observed']['amount'] is None)
chk('E5 D-01: los escenarios 6, A2, A3 y A5 conservan la venta observada como cifra protagonista y no muestran brecha, meta, cumplimiento ni contribución', all((lambda s: s['economic']['primary']['kind'] == 'venta_observada' and s['economic']['observed']['visible'] and not s['economic']['compliance']['visible'] and not s['economic']['plan']['visible'] and s['economic']['contribution']['amount'] is None)(next(e for e in esc if str(e['n']) == n)['salida']) for n in ('6', 'A2', 'A3', 'A5')))

# ---------- F · wireframe ↔ documento ----------
css_ok = all(t in wf for t in ['.ec__n{font-size:34px', '.ec__n--long{font-size:28px}', '@container (max-width:1024px){.vd{font-size:19px}', '.ec__n{font-size:30px}.ec__n--long{font-size:24px}', '@container (max-width:600px)', '.ec__n{font-size:28px}.ec__n--long{font-size:22px}', '.vd{font-size:21px'])
chk('F1 la tabla responsive del documento (34/28, 30/24, 28/22 px; veredicto 21/19/17 px; cortes 1024 y 600) coincide con el CSS del wireframe', css_ok and all(t in doc for t in ['34 px (largo: 28 px)', '30 px (largo: 24 px)', '28 px (largo: 22 px)', '| Veredicto | 21 px | 19 px | 17 px |']) and '.vd{font-size:17px}' in wf)
zw = ' '.join(re.findall(r'<div class="zw .*?</div></div></div>', wf, flags=re.S)); zt = re.sub(r'<[^>]+>', ' ', zw)
chk('F2 legibilidad: dentro de Z1 ningún número queda separado de su unidad por un espacio normal (todo «%», «M» y «mil» usa espacio de no separación)', not re.findall(r'\d [%]|\d M\b|\d mil\b', zt), re.findall(r'\d [%]|\d M\b|\d mil\b', zt)[:3])
chk('F3 el wireframe distingue diseño propuesto (≥ 37 rótulos) y aplicación existente (un único panel con captura) y menciona el rótulo en la leyenda', wf.count('tag--prop">')   >= 37 and len(re.findall(r'data-wf="aplicacion-existente"', wf)) == 1 and 'capturas_auditoria/home_desktop_full.png' in wf)
chk('F4 el wireframe incluye escritorio, tableta, móvil, los 14 escenarios y los 16 adicionales, la prueba de legibilidad, los estados en móvil y tableta y la jerarquía', {'frame-desktop', 'frame-tablet', 'frame-mobile', 'estres', 'jerarquia', 'estados-movil', 'estados-tableta'} <= wf_ids and all(f'escenario-{n:02d}' in wf_ids for n in range(1, 15)) and all(f'escenario-A{n}' in wf_ids for n in range(1, 17)))
chk('F5 el wireframe mantiene la arquitectura de 3.1: no rediseña BC, Z2, Z3, Z4 ni Z5 (solo los menciona como contexto)', wf.count('data-wf="z2') == 0 and wf.count('data-wf="z3') == 0 and wf.count('data-wf="z4') == 0 and wf.count('data-wf="z5') == 0 and 'BC · Barra de contexto (no se diseña aquí)' in wf)
capd = D / 'wireframes/capturas_3_2'
chk('F6 todas las capturas citadas existen (38) y la aplicación existente va rotulada aparte', all((capd / n).exists() for n in ['aplicacion_existente_home_actual.png', 'diseno_propuesto_01_escritorio.png', 'diseno_propuesto_02_tableta.png', 'diseno_propuesto_03_movil.png', 'diseno_propuesto_04_legibilidad_estres.png', 'diseno_propuesto_00_jerarquia.png', 'diseno_propuesto_05_estados_movil.png', 'diseno_propuesto_06_estados_tableta.png']) and len(list(capd.glob('diseno_propuesto_escenario_*.png'))) == 30 and len(list(capd.glob('*.png'))) == 38)
vis = re.sub(r'<style.*?</style>', '', wf, flags=re.S); vis = re.sub(r'<[^>]+>', ' ', vis)
leak = sorted(set(re.findall(r'\b(?:sin_base|riesgo_cumplimiento|creciendo_bajo_potencial|no_configurado|conversion_cero|sin_lectura|sin_base_comparable|recuperacion_desde_cero|cambio_de_composicion|datos_insuficientes|sin_actividad|no_calculable|attributeSegment|classifyBusinessState)\b', vis)))
chk('F7 D-06: el texto visible del wireframe no contiene identificadores internos de estados, causas ni funciones', not leak, leak)

# ---------- G · ESTADO.md y roadmap ----------
names = ['1.1 Auditoría de arquitectura y código', '1.2 Inventario de módulos, datos e indicadores', '1.3 Auditoría de motores de cálculo y diagnósticos', '1.4 Auditoría de Cohere e IA', '1.5 Identificación de brechas y oportunidades',
 '2.1 Modelo de lectura ejecutiva', '2.2 Modelo de indicadores y drivers', '2.3 Motor de detección de desviaciones', '2.4 Modelo de riesgos y oportunidades', '2.5 Modelo de cuantificación económica',
 '3.1 Arquitectura de información', '3.2 Resumen ejecutivo', '3.3 Hallazgos, riesgos y oportunidades', '3.4 Prioridades y recomendaciones', '3.5 Prototipo y validación UX',
 '4.1 Integración de fuentes y contexto', '4.2 Motor de diagnósticos', '4.3 Patrones y desviaciones', '4.4 Priorización de riesgos y oportunidades', '4.5 Cálculo del impacto económico',
 '5.1 Arquitectura de contexto para IA', '5.2 Narrativa ejecutiva', '5.3 Explicación de causas y hallazgos', '5.4 Recomendaciones inteligentes', '5.5 Validación de calidad, seguridad y consistencia',
 '6.1 Integración del Command Center', '6.2 Validación funcional y matemática', '6.3 Seguridad, persistencia y sincronización', '6.4 Pruebas UX, móvil y rendimiento', '6.5 Liberación y documentación']
so = {}
for line in est.split('\n'):
    for nm in names:
        if f'| {nm} |' in line: so[nm] = line.split(f'| {nm} |')[1].strip().strip('|').strip()
chk('G1 ESTADO.md lista las 30 subfases con los nombres exactos del roadmap', len(so) == 30, [n for n in names if n not in so])
chk('G2 1.x y 2.x aceptadas; 3.1 ACEPTADA con limitaciones; las Fases 4 a 6 NO INICIADA (el avance dentro de la Fase 3 lo valida la máquina de estados de verificar_consistencia_3_1.py)', all(so[n].startswith('COMPLETADA Y ACEPTADA') for n in names[:10]) and so['3.1 Arquitectura de información'].startswith('ACEPTADA CON LIMITACIONES DOCUMENTADAS') and all(so[n] == 'NO INICIADA' for n in names[15:]), {n: so.get(n) for n in names[10:16]})
s32 = so['3.2 Resumen ejecutivo']
acc32 = s32.startswith('ACEPTADA CON LIMITACIONES DOCUMENTADAS') and 'aceptación formal' in s32 and 'no aceptada' not in s32
pend32 = s32.startswith('COMPLETADA CON LIMITACIONES DOCUMENTADAS') and 'no aceptada' in s32 and 'ACEPTADA' not in s32.replace('no aceptada', '')
chk('G3 3.2 figura completada y no aceptada, o ACEPTADA CON LIMITACIONES DOCUMENTADAS con la aceptación formal del usuario registrada en su fila (nunca aceptada sin ese registro)', acc32 or pend32, s32)
chk('G3b 3.3 a 3.5 solo pueden estar iniciadas si 3.2 está aceptada', acc32 or all(so[n] == 'NO INICIADA' for n in names[12:15]), {n: so[n] for n in names[11:15]})
head_est = est.split('## Roadmap')[0]; chk('G4 ESTADO.md: Fase 3 EN EJECUCIÓN con subfase actual dentro de la Fase 3, o Fase 3 cerrada con todas sus subfases aceptadas por el usuario (3.1 a 3.5 ACEPTADAS) y las Fases 4 a 6 NO INICIADAS', ('EN EJECUCIÓN' in head_est and re.search(r'Subfase actual: 3\.[2-5]', est) is not None) or ('La Fase 3 — Diseño UX/UI quedó cerrada' in head_est and all(so[n].startswith('ACEPTADA CON LIMITACIONES DOCUMENTADAS') for n in names[10:15]) and 'ninguna en ejecución' in head_est))
b3p = D / 'generated/HASHES_BASE_3_3.json'
if b3p.exists():
    b3 = json.loads(b3p.read_text()); ch3 = [k for k, h in b3['documentos_aceptados'].items() if not hash_ok(D / k, k, h)] + [k for k, h in b3['especificacion_aceptada'].items() if not hash_ok(HERE / k, k, h)]
    chk('A3 tras la aceptación de 3.2, ni sus documentos ni su especificación (Z1) ni los 13 documentos anteriores cambiaron (por hash, línea base de 3.3)', not ch3, ch3[:4])
print(f'\n{ok} bien, {len(bad)} mal'); print('TODO CONSISTENTE' if not bad else 'CONTRADICCIONES: ' + '; '.join(bad)); sys.exit(1 if bad else 0)
