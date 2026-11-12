#!/usr/bin/env python3
"""Subfase 3.5 — verifica que el PROTOTIPO, su documento, la ESPECIFICACIÓN UX/UI, las matrices de las zonas y ESTADO.md no se contradicen, y que lo aceptado no se tocó.
Incluye un oráculo independiente en Python sobre la coherencia entre capas de cada situación del prototipo. Solo lee archivos. CC33_ROOT cambia la raíz que se lee (solo para pruebas de mutación)."""
import hashlib, json, os, pathlib, re, shutil, subprocess, sys, tempfile
HERE = pathlib.Path(__file__).resolve().parents[2]; R = pathlib.Path(os.environ.get('CC33_ROOT') or HERE); D = R / 'docs/command-center'
rd = lambda p: (D / p).read_text()
doc, spec, est, html = rd('FASE_3_5_PROTOTIPO_VALIDACION_UX.md'), rd('ESPECIFICACION_UX_UI_COMMAND_CENTER.md'), rd('ESTADO.md'), rd('prototipo/home_3_5_prototipo.html')
sj = json.loads(rd('generated/PROTOTIPO_SITUACIONES.json'))['situaciones']; base = json.loads(rd('generated/HASHES_BASE_3_3.json'))
ok = 0; bad = []
def chk(name, cond, detail=''):
    global ok
    print(('✔ ' if cond else '✘ ') + name + ('' if cond else f' — {detail}'))
    if cond: ok += 1
    else: bad.append(name)
import sys as _s, pathlib as _p; _s.path.insert(0, str(_p.Path(__file__).resolve().parent)); from _autorizadas import hash_ok
def _pend(s): return bool(s.startswith('COMPLETADA CON LIMITACIONES DOCUMENTADAS') and 'no aceptada' in s and 'ACEPTADA' not in s.replace('no aceptada', ''))
def _acc(s): return bool(s.startswith('ACEPTADA CON LIMITACIONES DOCUMENTADAS') and 'aceptación formal' in s and 'no aceptada' not in s)
def _doc_ok(est_state, d): return (_acc(est_state) and d.startswith('ACEPTADA CON LIMITACIONES DOCUMENTADAS') and 'aceptación formal' in d and 'no aceptada' not in d) or (_pend(est_state) and d.startswith('COMPLETADA CON LIMITACIONES DOCUMENTADAS') and 'no aceptada' in d)
sha = lambda p: hashlib.sha256(p.read_bytes()).hexdigest()
chg = [k for k, h in base['documentos_aceptados'].items() if not hash_ok(D / k, k, h)]
chk('A1 ningún documento aceptado (fases 1 y 2, 3.1 y 3.2) cambió (por hash)', not chg and len(base['documentos_aceptados']) >= 20, chg)
sp = [k for k, h in base['especificacion_aceptada'].items() if not hash_ok(HERE / k, k, h)]; chk('A2 la especificación aceptada de Z1 y los contratos de Fase 2 no cambiaron (por hash)', not sp, sp)
cc = [k for k, h in base['codigo_aplicacion'].items() if not (R / k).exists() or sha(R / k) != h]; newjs = [str(f.relative_to(R)) for f in list((R / 'js').rglob('*.js')) + list((R / 'css').rglob('*.css')) if str(f.relative_to(R)) not in base['codigo_aplicacion']]
chk('A3 ningún archivo del código de la aplicación cambió ni apareció (249 archivos, por hash)', not cc and not newjs and len(base['codigo_aplicacion']) == 249, (cc + newjs)[:4])
tmp = pathlib.Path(tempfile.mkdtemp()); (tmp / 'docs/command-center/generated').mkdir(parents=True)
subprocess.run(['node', str(HERE / 'tools/audit/prototipo-generar.js')], env={**os.environ, 'CC35_OUT': str(tmp)}, check=True, capture_output=True)
for rel, nm in [('prototipo/home_3_5_prototipo.html', 'el prototipo'), ('generated/PROTOTIPO_SITUACIONES.json', 'PROTOTIPO_SITUACIONES.json')]:
    chk(f'B1 {nm} es exactamente lo que regenera el generador desde las especificaciones (sin edición a mano ni desactualización)', (tmp / 'docs/command-center' / rel).read_text() == rd(rel))
shutil.rmtree(tmp)
# ---------- C · documentos ↔ especificaciones ↔ matrices ----------
rl = json.loads(subprocess.check_output(['node', '-e', "const a=require('./tools/audit/z1-lectura-ejecutiva.js'),b=require('./tools/audit/z3-atencion.js'),c=require('./tools/audit/z4-acciones.js');console.log(JSON.stringify({z1:a.RULES,z3:b.RULES,z4:c.RULES}))"], cwd=HERE))
dr = {m[1]: m[2] for m in re.finditer(r'^\| ([RTA]\d+) \| (.+) \|$', spec, re.M)}; exp = {**rl['z1'], **rl['z3'], **rl['z4']}
chk('C1 las reglas R1–R14, T1–T6 y A1–A7 de la especificación UX/UI son exactamente las que ejecutan los validadores (texto idéntico)', dr == exp, [k for k in exp if dr.get(k) != exp[k]])
rows = {}
for line in doc.split('\n'):
    c = [x.strip() for x in line.strip().strip('|').split('|')]
    if len(c) == 7 and c[0].startswith('`') and c[0].strip('`') in {s['id'] for s in sj}: rows[c[0].strip('`')] = c
mism = [s['id'] for s in sj if rows.get(s['id']) != [f"`{s['id']}`", s['titulo'], s['z1Level'], s['z3Mode'], s['z3Header'] or '—', s['z4Mode'], s['z4Header'] or '—']]
chk('C2 la tabla de las 6 situaciones del documento coincide, fila por fila, con la salida generada', len(rows) == 6 and not mism, mism)
mat = {z: json.loads(rd(f'generated/MATRIZ_TRAZABILIDAD_{z}.json'))['filas'] for z in ('Z1', 'Z3', 'Z4')}; bad_c = []
for z, f in mat.items():
    m = re.search(rf'\| {z} \(matriz de 3\.\d\) \| (\d+) \| (\d+) \| (\d+) \| (\d+) \|', doc)
    c = (len(f), sum(r['estado'] == 'Disponible' for r in f), sum(r['estado'] == 'Parcial' for r in f), sum(r['estado'] == 'Por desarrollar' for r in f))
    if not m or tuple(map(int, m.groups())) != c: bad_c.append((z, c, m and m.groups()))
chk('C3 la tabla de dependencias del documento coincide con las matrices de Z1, Z3 y Z4', not bad_c, bad_c)
paths = set(re.findall(r'`([A-Za-z0-9_./-]+\.(?:md|html|js|py|json))`', doc + spec)); roots = [R, HERE, D, D / 'prototipo', D / 'generated', D / 'wireframes']
miss = [p for p in paths if not any((r / p).exists() for r in roots) and not p.startswith('ds-')]
chk('C4 todo archivo que citan el documento y la especificación existe', not miss and len(paths) >= 6, miss)
chk('C5 existen las 19 capturas del prototipo (6 situaciones × 3 anchos y 1 interacción)', len(list((D / 'prototipo/capturas_3_5').glob('*.png'))) == 19 and all((D / f'prototipo/capturas_3_5/prototipo_{n}_{s["id"]}.png').exists() for n in ('escritorio', 'tableta', 'movil') for s in sj))
chk('C6 el documento declara que la validación con usuarios, en móvil real y con lector de pantalla está PENDIENTE y que no hay datos reales', 'PENDIENTE: no se ejecutó' in doc and 'No hay pruebas con usuarios' in doc and 'Ninguna usa datos reales' in spec.replace('Ninguna usa datos reales; la validación', 'Ninguna usa datos reales; la validación') and 'datos simulados' in doc)
# ---------- D · oráculo independiente sobre las situaciones ----------
MODE = {'Alta': ('completo', 'completo'), 'Media': ('completo', 'completo'), 'Baja': ('solo_observado', 'datos_primero'), 'Insuficiente': ('solo_datos', 'solo_datos')}; bad_o = []
for s in sj:
    w = lambda m: bad_o.append(f"{s['id']}: {m}")
    if s['z1Level'] != s['z3Level']: w('la confiabilidad de Z1 y la de Z3 difieren')
    if (s['z3Mode'], s['z4Mode']) != MODE[s['z1Level']]: w(f'los modos {s["z3Mode"]}/{s["z4Mode"]} no corresponden a {s["z1Level"]}')
    if s['z1Level'] == 'Insuficiente' and s['z4Cards'] and not all(c.startswith('a:') for c in s['z4Cards']): w('ids de acción')
    if not s['z3Cards'] and s['z3Header']: w('cabecera de Z3 sin elementos')
    if s['z3Cards'] and not re.fullmatch(rf'{min(3, len(s["z3Cards"]))} de {len(s["z3Cards"])}', s['z3Header'] or ''): w('cabecera de Z3 incoherente')
    if s['z4Cards'] and not re.fullmatch(rf'{min(3, len(s["z4Cards"]))} de {len(s["z4Cards"])}', s['z4Header'] or ''): w('cabecera de Z4 incoherente')
    sec = re.search(rf'<div class="sit" data-sit="{s["id"]}"[^>]*>(.*?)(?=<div class="sit"|</main>)', html, re.S)
    if not sec: w('falta la situación en el prototipo'); continue
    ids = re.findall(r'<section[^>]* id="(z\d)-', sec.group(1)); 
    if ids != ['z1', 'z2', 'z3', 'z4', 'z5']: w(f'orden de zonas {ids}')
    bc = re.search(rf'data-bc="{s["id"]}".*?data-bc-level="(\w+)"', html, re.S)
    if not bc or bc.group(1) != s['z1Level']: w('la barra de contexto no coincide con Z1')
chk('D1 oráculo independiente: en las 6 situaciones la confiabilidad es la misma en BC, Z1, Z3 y Z4, los modos corresponden, las cabeceras «3 de N» son coherentes y las zonas siguen el orden Z1 a Z5', not bad_o and len(re.findall(r'class="sit" data-sit=', html)) == 6, bad_o[:5])
chk('D2 el prototipo se declara de baja fidelidad con datos simulados y sin identificadores internos en su texto visible', 'DATOS SIMULADOS' in html and not re.search(r'\b(sin_base|no_configurado|datos_insuficientes|solo_observado|solo_datos|datos_primero|sin_dato_actividad)\b', re.sub(r'<[^>]+>|<script.*?</script>|<style.*?</style>', ' ', html, flags=re.S)))
# ---------- E · ESTADO.md ----------
row = [l for l in est.split('\n') if '| 3.5 Prototipo y validación UX |' in l]; s35 = row[0].split('| 3.5 Prototipo y validación UX |')[1].strip().strip('|').strip() if row else ''
chk('E1 3.5 figura COMPLETADA CON LIMITACIONES DOCUMENTADAS pendiente de aceptación formal (no aceptada) o ACEPTADA CON LIMITACIONES DOCUMENTADAS con la aceptación formal registrada, y las Fases 4 a 6 siguen NO INICIADAS', (_pend(s35) or _acc(s35)) and len(re.findall(r'\| (?:4\.\d|5\.\d|6\.\d) [^|]+\| NO INICIADA \|', est)) == 15, s35)
m = re.search(r'^\*\*Estado:\*\*\s*(.+)$', doc, re.M); chk('E2 el documento declara el mismo estado que ESTADO.md', bool(m) and _doc_ok(s35, m.group(1)))
print(f'\n{ok} bien, {len(bad)} mal'); print('TODO CONSISTENTE' if not bad else 'CONTRADICCIONES: ' + '; '.join(bad)); sys.exit(1 if bad else 0)
