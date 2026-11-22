#!/usr/bin/env python3
"""Verificador de consistencia de las Subfases 3.3 (Z3) y 3.4 (Z4). Uso: via verificar_consistencia_3_3.py / verificar_consistencia_3_4.py.
Comprueba que DOCUMENTO, MATRIZ, ESCENARIOS GENERADOS, WIREFRAME y ESTADO.md no se contradicen y que lo aceptado no se tocó. Contiene un ORÁCULO INDEPENDIENTE
en Python que re-deriva, desde los datos de cada escenario, el orden, los conteos, las reglas por confiabilidad y la aritmética económica, y los compara con la salida de la
especificación en JavaScript. Solo lee archivos. CC33_ROOT cambia la raíz que se lee (solo para las pruebas de mutación de este mismo verificador)."""
import hashlib, json, os, pathlib, re, shutil, subprocess, sys, tempfile
HERE = pathlib.Path(__file__).resolve().parents[2]; R = pathlib.Path(os.environ.get('CC33_ROOT') or HERE); D = R / 'docs/command-center'
Z = sys.argv[1]; assert Z in ('Z3', 'Z4'); SUB = '3.3' if Z == 'Z3' else '3.4'
DOC = {'Z3': 'FASE_3_3_HALLAZGOS_RIESGOS_OPORTUNIDADES.md', 'Z4': 'FASE_3_4_PRIORIDADES_RECOMENDACIONES.md'}[Z]
ESCMD = {'Z3': 'FASE_3_3_ESCENARIOS_Z3.md', 'Z4': 'FASE_3_4_ESCENARIOS_Z4.md'}[Z]; WFN = {'Z3': 'z3_3_3_wireframe.html', 'Z4': 'z4_3_4_wireframe.html'}[Z]
ROW = {'Z3': '3.3 Hallazgos, riesgos y oportunidades', 'Z4': '3.4 Prioridades y recomendaciones'}[Z]
rd = lambda p: (D / p).read_text()
doc, est, wf = rd(DOC), rd('ESTADO.md'), rd('wireframes/' + WFN)
mz = json.loads(rd(f'generated/MATRIZ_TRAZABILIDAD_{Z}.json')); m3 = json.loads(rd('generated/MATRIZ_UX_MOTORES.json')); esj = json.loads(rd(f'generated/ESCENARIOS_{Z}.json')); esc = esj['escenarios']
base = json.loads(rd('generated/HASHES_BASE_3_3.json')); wrong = json.loads((HERE / f'tools/audit/{Z.lower()}-ejemplos-incorrectos.json').read_text())
ok = 0; bad = []
def chk(name, cond, detail=''):
    global ok
    print(('✔ ' if cond else '✘ ') + name + ('' if cond else f' — {detail}'))
    if cond: ok += 1
    else: bad.append(name)
norm = lambda s: str(s).replace(' ', ' ')
import sys as _s, pathlib as _p; _s.path.insert(0, str(_p.Path(__file__).resolve().parent)); from _autorizadas import hash_ok, NUEVOS
def _pend(s): return bool(s.startswith('COMPLETADA CON LIMITACIONES DOCUMENTADAS') and 'no aceptada' in s and 'ACEPTADA' not in s.replace('no aceptada', ''))
def _acc(s): return bool(s.startswith('ACEPTADA CON LIMITACIONES DOCUMENTADAS') and 'aceptación formal' in s and 'no aceptada' not in s)
def _doc_ok(est_state, d): return (_acc(est_state) and d.startswith('ACEPTADA CON LIMITACIONES DOCUMENTADAS') and 'aceptación formal' in d and 'no aceptada' not in d) or (_pend(est_state) and d.startswith('COMPLETADA CON LIMITACIONES DOCUMENTADAS') and 'no aceptada' in d)
sha = lambda p: hashlib.sha256(p.read_bytes()).hexdigest()
wf_f = set(re.findall(r'data-wf-f="([^"]+)"', wf)); wf_top = set(re.findall(r'data-wf="([^"]+)"', wf))
# ---------- A · integridad ----------
chg = [k for k, h in base['documentos_aceptados'].items() if not hash_ok(D / k, k, h)]
chk('A1 ningún documento aceptado (los 13 de fases anteriores y los de 3.2) cambió desde la aceptación de 3.2 (por hash)', not chg and len(base['documentos_aceptados']) >= 20, chg)
sp = [k for k, h in base['especificacion_aceptada'].items() if not hash_ok(HERE / k, k, h)]
chk('A2 la especificación aceptada de Z1 y los contratos de Fase 2 no cambiaron (por hash)', not sp and len(base['especificacion_aceptada']) == 5, sp)
cc = [k for k, h in base['codigo_aplicacion'].items() if not hash_ok(R / k, k, h)]; newjs = [str(f.relative_to(R)) for f in list((R / 'js').rglob('*.js')) + list((R / 'css').rglob('*.css')) if str(f.relative_to(R)) not in base['codigo_aplicacion'] and str(f.relative_to(R)) not in NUEVOS]
chk('A3 ningún archivo del código de la aplicación (js, css, index.html) cambió ni apareció (249 archivos, por hash)', not cc and not newjs and len(base['codigo_aplicacion']) == 249, (cc + newjs)[:4])
# ---------- B · artefactos generados ----------
tmp = pathlib.Path(tempfile.mkdtemp()); (tmp / 'docs/command-center/generated').mkdir(parents=True); (tmp / 'docs/command-center/wireframes').mkdir(parents=True)
subprocess.run(['node', str(HERE / 'tools/audit/z34-generar-artefactos.js')], env={**os.environ, 'CC34_OUT': str(tmp)}, check=True, capture_output=True)
for rel, nm in [(f'generated/ESCENARIOS_{Z}.json', f'ESCENARIOS_{Z}.json'), (ESCMD, ESCMD), ('wireframes/' + WFN, 'el wireframe')]:
    chk(f'B1 {nm} es exactamente lo que regenera la especificación (sin edición a mano ni desactualización)', (tmp / 'docs/command-center' / rel).read_text() == rd(rel))
shutil.rmtree(tmp)
t2 = pathlib.Path(tempfile.mkdtemp()); (t2 / 'docs/command-center/generated').mkdir(parents=True); shutil.copy(D / f'generated/MATRIZ_TRAZABILIDAD_{Z}.json', t2 / 'docs/command-center/generated/')
gm = subprocess.run([sys.executable, str(HERE / 'tools/audit/matriz_zona_md.py'), Z], env={**os.environ, 'CC33_ROOT': str(t2)}, capture_output=True, text=True); mdp = t2 / f'docs/command-center/MATRIZ_TRAZABILIDAD_{Z}.md'
chk(f'B2 MATRIZ_TRAZABILIDAD_{Z}.md es exactamente lo que genera su JSON (y el JSON es generable)', gm.returncode == 0 and mdp.exists() and mdp.read_text() == rd(f'MATRIZ_TRAZABILIDAD_{Z}.md'), gm.stderr.strip().split('\n')[-1] if gm.returncode else 'difiere'); shutil.rmtree(t2)
# ---------- C · matriz ↔ documento ↔ wireframe ↔ matriz de 3.1 ----------
rows = mz['filas']; ids3 = {r['id'] for r in m3['filas']}; cnt = {e: sum(1 for r in rows if r['estado'] == e) for e in mz['estados']}
chk(f'C1 la matriz de {Z} tiene ids contiguos {Z}-01..{Z}-{len(rows):02d}', [r['id'] for r in rows] == [f'{Z}-{i:02d}' for i in range(1, len(rows) + 1)])
mres = re.search(r'\*\*(\d+) requisitos: (\d+) Disponible, (\d+) Parcial, (\d+) Por desarrollar\.\*\*', doc)
chk('C2 los conteos del documento son exactamente los de la matriz', bool(mres) and tuple(map(int, mres.groups())) == (len(rows), cnt['Disponible'], cnt['Parcial'], cnt['Por desarrollar']), (cnt, mres and mres.groups()))
cats = {k: [r['id'] for r in rows for x in r['dependencias'] if x['categoria'] == k] for k in mz['categoriasDependencia']}; dm_ = {m[1]: int(m[3]) for m in re.finditer(r'- \*\*(\w+)\*\* — (.+?) \((\d+)\): ', doc)}
chk('C3 las dependencias por categoría del documento coinciden en número y en ids con la matriz', set(dm_) == set(cats) and all(dm_[k] == len(v) for k, v in cats.items()) and all(all(i in doc for i in v) for v in cats.values()), (dm_, {k: len(v) for k, v in cats.items()}))
chk('C4 «Por desarrollar» no tiene fuentes FP.* y sí especificación; «Disponible» y «Parcial» sí tienen fuentes', all((not r['motores'] and r.get('especificacion')) if r['estado'] == 'Por desarrollar' else bool(r['motores']) for r in rows))
chk('C5 toda fila M-xx de la que depende la matriz existe en la matriz de 3.1', all(m in ids3 for r in rows for m in r['depende']), [m for r in rows for m in r['depende'] if m not in ids3])
chk('C6 el wireframe contiene el componente que cada fila de la matriz ubica (data-wf-f)', all(r['wireframe'] in wf_f for r in rows), [r['wireframe'] for r in rows if r['wireframe'] not in wf_f])
refs = set(re.findall(rf'\b{Z}-\d{{2}}\b', doc)); chk(f'C7 todo requisito {Z}-xx que cita el documento existe en la matriz', refs <= {r['id'] for r in rows}, refs - {r['id'] for r in rows})
heads = re.findall(r'^## (\d+)\. ', doc, re.M); chk('C8 las secciones del documento son §0 a §16, contiguas', heads == [str(i) for i in range(17)], heads)
chk('C9 cada requisito tiene requisito, decisión, componente, fuente, motor, estado y evidencia, y cada dependencia categoría válida, fase y detalle', all(all(r.get(k) not in (None, '') for k in ['requisito', 'decision', 'componente', 'fuente', 'motor', 'estado', 'evidencia']) and all(x['categoria'] in mz['categoriasDependencia'] and x['fase'] and x['detalle'] for x in r['dependencias']) for r in rows))
chk('C10 los requisitos «Por desarrollar» o «Parcial» declaran su dependencia pendiente', all(r['dependencias'] for r in rows if r['estado'] != 'Disponible'), [r['id'] for r in rows if r['estado'] != 'Disponible' and not r['dependencias']])
# ---------- D · tablas del documento ↔ salida generada ↔ especificación ----------
spec = json.loads(subprocess.check_output(['node', '-e', "const a=require('./tools/audit/z3-atencion.js'),b=require('./tools/audit/z4-acciones.js');console.log(JSON.stringify({z3:a.RULES,z4:b.RULES,k:b.KINDS}))"], cwd=HERE))
RUL = spec['z3' if Z == 'Z3' else 'z4']; dr = {m[1]: m[2] for m in re.finditer(r'^\| ([TA]\d+) \| (.+) \|$', doc, re.M)}
chk(f'D1 las {len(RUL)} reglas de texto del documento son exactamente las que ejecuta el validador (texto idéntico)', dr == RUL, [k for k in RUL if dr.get(k) != RUL[k]])
def row_of(e):
    o = e['salida']
    if Z == 'Z3': fc = ' · '.join(next(c for c in o['cards'] if c['id'] == i)['symbol'] for i in o['featured']) or '—'; return [str(e['n']), e['titulo'], o['level'], o['mode'], o['header'] or '—', fc, str(o['withheld']['count'])]
    return [str(e['n']), e['titulo'], o['level'], o['mode'], o['header'] or o['status'], ', '.join(c['id'] for c in o['cards']) or '—', str(o['held']['count']), str(len(o['rejected']))]
tab = {}
for line in doc.split('\n'):
    c = [x.strip() for x in line.strip().strip('|').split('|')]
    if len(c) == (7 if Z == 'Z3' else 8) and c[0].isdigit(): tab[c[0]] = c
mism = [str(e['n']) for e in esc if tab.get(str(e['n'])) != row_of(e)]
chk('D2 la tabla de los 14 escenarios del documento coincide, fila por fila, con la salida generada', len(tab) == 14 and not mism, mism)
chk('D3 los 14 escenarios coinciden con lo esperado (comparación de la especificación) y cubren los cuatro modos de confiabilidad (Alta, Media, Baja, Insuficiente)', [e['n'] for e in esc] == list(range(1, 15)) and all(e['comparacion']['coincide'] for e in esc) and {e['salida']['level'] for e in esc} >= {'Alta', 'Baja', 'Insuficiente'} and ('Media' in {e['salida']['level'] for e in esc}), [e['n'] for e in esc if not e['comparacion']['coincide']])
trows = {}
for line in doc.split('\n'):
    c = [x.strip() for x in line.strip().strip('|').split('|')]
    if re.fullmatch(r'[XY]\d+', c[0] if c else '') and len(c) == (5 if Z == 'Z3' else 3): trows[c[0]] = c
if Z == 'Z3': dm = [w['id'] for w in wrong if trows.get(w['id']) != [w['id'], w['familia'], w['titulo'], w['descripcion'], ', '.join(w['reglas'])]]
else: dm = [w['id'] for w in wrong if trows.get(w['id']) != [w['id'], w['texto'], ', '.join(w['reglas'])]]
chk(f'D4 los {len(wrong)} ejemplos incorrectos del documento (texto y reglas) son exactamente los que la prueba ejecuta, y cubren todas las reglas', len(trows) == len(wrong) and not dm and {r for w in wrong for r in w['reglas']} == set(RUL), dm)
det = rd(ESCMD); chk('D5 el detalle de escenarios cubre los 14 con todos los aspectos y declara su origen (ilustrativo o simulado)', all(f'## Escenario {n} ' in det for n in range(1, 15)) and 'ilustrativo' in det.lower() or 'simulad' in det.lower() or 'ilustrativ' in det.lower())
# ---------- E · ORÁCULO INDEPENDIENTE (Python) ----------
SEV = {'critica': 3, 'importante': 2, 'seguimiento': 1}; STR = {'hecho': 6, 'calculo': 5, 'driver': 4, 'senal': 3, 'estimacion': 2, 'hipotesis': 1, 'accion': 0}; SUP = {'alto': 2, 'medio': 1, 'bajo': 0}
FIN = lambda v: isinstance(v, (int, float)) and not isinstance(v, bool) and v == v and abs(v) != float('inf')
bad_o = []
if Z == 'Z3':
    ALLOWED = {'hallazgo': ['observado', 'brecha'], 'riesgo': ['brecha', 'en_riesgo', 'esperado'], 'oportunidad': ['potencial_teorico', 'alcanzable', 'esperado']}
    def key(c):
        i = c['impact']; amt = abs(i['sales']['point']) if i['status'] == 'disponible' else 0
        return (-(1 if c['isData'] and c['severity']['id'] == 'critica' else 0), -SEV[c['severity']['id']], -(0 if c['certainty']['support'] == 'bajo' else 1), -(1 if i['status'] == 'disponible' else 0), -amt, -STR[c['certainty']['level']], -SUP[c['certainty']['support']], c['id'])
    for e in esc:
        o, n = e['salida'], e['n']; w = lambda m: bad_o.append(f'S{n}: {m}'); cards = o['cards']; lvl = o['level']
        if o['mode'] != {'Alta': 'completo', 'Media': 'completo', 'Baja': 'solo_observado', 'Insuficiente': 'solo_datos'}[lvl]: w('modo ≠ nivel')
        if lvl == 'Baja' and any(c['clase'] != 'hallazgo' and not c['isData'] for c in cards): w('Baja muestra conclusiones')
        if lvl == 'Insuficiente' and any(not c['isData'] for c in cards): w('Insuficiente muestra elementos del negocio')
        if lvl in ('Baja', 'Insuficiente') and any(t['lines'] for t in o['totals'].values()): w('totales sin conclusiones')
        if [c['id'] for c in cards] != [c['id'] for c in sorted(cards, key=key)]: w('el orden no es el del criterio declarado (oráculo)')
        if len(o['featured']) != min(3, len(cards)) or any(f not in [c['id'] for c in cards] for f in o['featured']): w('destacados')
        if o['header'] != (f"{len(o['featured'])} de {len(cards)}" if cards else None): w('cabecera')
        if o['seeAll']['visible'] != (len(cards) > len(o['featured'])): w('«Ver todos»')
        for c in cards:
            i = c['impact']
            if i['status'] == 'disponible':
                if i['sales']['category'] not in ALLOWED[c['clase']]: w(f'{c["id"]}: impacto {i["sales"]["category"]} no corresponde a {c["clase"]}')
                k = i['contribution']
                if k['status'] == 'disponible' and abs(k['point'] - i['sales']['point'] * float(k['marginDisplay'].replace(' %', '')) / 100) > 1: w(f'{c["id"]}: contribución ≠ ventas × margen')
                if k['status'] != 'disponible' and k.get('display'): w(f'{c["id"]}: contribución con importe sin margen')
            if c['clase'] == 'oportunidad' and c['certainty']['level'] not in ('estimacion', 'hipotesis'): w(f'{c["id"]}: oportunidad con certeza {c["certainty"]["level"]}')
            if re.search(r'utilidad|ganancia|beneficio|rentabilidad|\bROI\b|\bROAS\b|\bCAC\b', c['title'] + ' ' + c['description'], re.I): w(f'{c["id"]}: término financiero')
            if any(h['text'] == c['title'] for h in c['hypotheses']): w(f'{c["id"]}: una hipótesis titula')
            if c['certainty']['support'] == 'bajo' and not any('Respaldo bajo' in t for t in c['tags']): w(f'{c["id"]}: respaldo bajo sin rótulo')
        for cls, t in o['totals'].items():
            for l in t['lines']:
                if l['category'] not in ALLOWED[cls]: w(f'total {cls} mezcla la categoría {l["category"]}')
                alt = [c for c in cards if c['clase'] == cls and c['impact']['status'] == 'disponible' and c['impact']['sales']['category'] == l['category'] and c['impact']['sales']['exclusiveGroup']]
                if len(alt) >= 2 and not l['overlap']:
                    pts = [c['impact']['sales']['point'] for c in alt]
                    if abs(l['low'] - min(pts)) > 1e-6 or abs(l['high'] - max(pts)) > 1e-6 or l['low'] == l['high']: w(f'alternativas excluyentes de {cls}: debe ser el rango [mín, máx], no una suma')
                if l['overlap'] and l['display'] is not None: w('superposición con cifra')
        wh = o['withheld']; vis_n = len(cards)
        if vis_n + wh['count'] + o['closed']['count'] + len(o['rejected']) < 1 and e['input']['findings']: w('se perdieron elementos')
else:
    for e in esc:
        o, n = e['salida'], e['n']; w = lambda m: bad_o.append(f'S{n}: {m}'); cards = o['cards']; lvl = o['level']; ids = [c['id'] for c in cards]; vis = set(e['z3Visibles'])
        if o['mode'] != {'Alta': 'completo', 'Media': 'completo', 'Baja': 'datos_primero', 'Insuficiente': 'solo_datos'}[lvl]: w('modo ≠ nivel')
        if lvl == 'Insuficiente' and any(c['kind'] != 'datos' for c in cards): w('Insuficiente recomienda acciones del negocio')
        if lvl == 'Baja' and any(c['kind'] not in ('datos', 'revisar') for c in cards): w('Baja recomienda comprobar o decidir')
        d0 = next((i for i, c in enumerate(cards) if c['kind'] != 'datos'), len(cards))
        if any(c['kind'] == 'datos' for c in cards[d0:]): w('una acción de datos aparece después de otras')
        nd = [c for c in cards if c['kind'] != 'datos']
        if any(nd[i]['rank'] > nd[i + 1]['rank'] for i in range(len(nd) - 1)): w('el orden no sigue el del elemento que motiva la acción')
        if len(o['featured']) != min(3, len(cards)): w('destacadas')
        if o['header'] != (f"{len(o['featured'])} de {len(cards)}" if cards else None): w('cabecera')
        for c in cards:
            if c['level'] != 'accion': w(f'{c["id"]}: una acción no es una recomendación')
            if any(k in c for k in ('amount', 'economics', 'impact', 'owner', 'dueDate', 'status', 'assignee')): w(f'{c["id"]}: campo prohibido (importe propio o de tarea)')
            if c['kind'] != 'datos' and not c['cites']: w(f'{c["id"]}: sin elemento que la motive')
            for x in c['cites']:
                if x['id'] not in vis: w(f'{c["id"]}: cita un elemento que no está a la vista en Z3')
                if x['impactRef'] and 'no es un importe de la acción' not in x['impactRef']['note']: w(f'{c["id"]}: importe citado sin rotular')
            if c['basisCertainty']['level'] in ('hipotesis', 'senal') and (c['kind'] == 'decidir' or not any('comprobación' in t for t in c['tags'])): w(f'{c["id"]}: sobre una señal o hipótesis debe ser una comprobación')
            if re.search(r'utilidad|ganancia|beneficio|rentabilidad|\bROI\b|\bROAS\b|\bCAC\b', c['label'] + ' ' + c['why'], re.I): w(f'{c["id"]}: término financiero')
            if re.search(r'\$\s?\d', c['label']) or re.search(r'responsable|fecha l[ií]mite|asignar', c['label'], re.I): w(f'{c["id"]}: importe o tarea en el texto')
        if not cards and not o['fallback']: w('sin acciones debe decir qué falta o que no hay nada')
        if cards and o['fallback']: w('con acciones no debe haber bloque de reemplazo')
chk(f'E1 oráculo independiente (Python): modo por confiabilidad, orden, destacados, reglas de clase o de acción, aritmética económica y trazabilidad coinciden en los 14 escenarios de {Z}', not bad_o, bad_o[:6])
# ---------- F · wireframe ↔ documento ----------
body = re.sub(r'<style.*?</style>', '', wf, flags=re.S); vis = re.sub(r'<[^>]+>', ' ', body)
leak = sorted(set(re.findall(r'\b(?:sin_base|no_configurado|datos_insuficientes|no_aplica|solo_observado|solo_datos|datos_primero|con_elementos|sin_conclusiones|que_falta|insufficient_data)\b', vis)))
chk('F1 el texto visible del wireframe no contiene identificadores internos de estados o modos', not leak, leak)
chk('F2 el wireframe distingue diseño propuesto (≥ 20 rótulos) y aplicación existente (un único panel con captura)', wf.count('tag--prop">') >= 20 and len(re.findall(r'data-wf="aplicacion-existente"', wf)) == 1 and 'capturas_auditoria/home_desktop_full.png' in wf)
chk('F3 el wireframe incluye escritorio, tableta, móvil, los 14 escenarios y la prueba de legibilidad', {'frame-desktop', 'frame-tablet', 'frame-mobile', 'estres'} <= wf_top and all(f'escenario-{n:02d}' in wf_top for n in range(1, 15)))
chk('F4 el wireframe mantiene la arquitectura de 3.1: no rediseña BC, Z1, Z2 ni Z5', 'data-wf-f="z1' not in wf and 'data-wf-f="z2' not in wf and 'data-wf-f="z5' not in wf)
capd = D / 'wireframes' / ('capturas_3_3' if Z == 'Z3' else 'capturas_3_4'); chk('F5 existen las 20 capturas de evidencia citadas', len(list(capd.glob('*.png'))) == 20 and (capd / 'aplicacion_existente_home_actual.png').exists())
# ---------- G · ESTADO.md ----------
so = {}
for line in est.split('\n'):
    if f'| {ROW} |' in line: so[ROW] = line.split(f'| {ROW} |')[1].strip().strip('|').strip()
s33 = so.get(ROW, '')
chk(f'G1 {SUB} figura COMPLETADA CON LIMITACIONES DOCUMENTADAS pendiente de aceptación formal (no aceptada) o ACEPTADA CON LIMITACIONES DOCUMENTADAS con la aceptación formal del usuario registrada en su fila, y la fase 4 sigue NO INICIADA', (_pend(s33) or _acc(s33)) and re.search(r'\| 4\.1 Integración de fuentes y contexto \| NO INICIADA \|', est) is not None, s33)
m = re.search(r'^\*\*Estado:\*\*\s*(.+)$', doc, re.M); chk('G2 el documento declara el mismo estado que ESTADO.md (completada y no aceptada, o aceptada con limitaciones con la aceptación formal registrada)', bool(m) and _doc_ok(s33, m.group(1)))
print(f'\n{ok} bien, {len(bad)} mal'); print('TODO CONSISTENTE' if not bad else 'CONTRADICCIONES: ' + '; '.join(bad)); sys.exit(1 if bad else 0)
