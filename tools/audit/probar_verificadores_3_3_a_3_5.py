#!/usr/bin/env python3
"""Pruebas NEGATIVAS de los verificadores de consistencia de 3.3, 3.4 y 3.5: se copia lo necesario a un directorio temporal (CC33_ROOT), se introduce UNA contradicción concreta
y se exige que el verificador falle en el check esperado. Una mutación que sobreviva es un hueco del verificador. Solo lee el repositorio real.
Uso: python3 tools/audit/probar_verificadores_3_3_a_3_5.py"""
import json, os, pathlib, re, shutil, subprocess, sys, tempfile
HERE = pathlib.Path(__file__).resolve().parents[2]; ok = 0; bad = []
def chk(name, cond, detail=''):
    global ok
    print(('✔ ' if cond else '✘ ') + name + ('' if cond else f' — {detail}'))
    if cond: ok += 1
    else: bad.append(name)
def fresh():
    t = pathlib.Path(tempfile.mkdtemp()); shutil.copytree(HERE / 'docs/command-center', t / 'docs/command-center'); shutil.copytree(HERE / 'js', t / 'js'); shutil.copytree(HERE / 'css', t / 'css'); shutil.copy(HERE / 'index.html', t / 'index.html'); return t
def run(t, v):
    r = subprocess.run([sys.executable, str(HERE / f'tools/audit/verificar_consistencia_3_{v}.py')], env={**os.environ, 'CC33_ROOT': str(t)}, capture_output=True, text=True)
    return r.returncode, {m.group(1) for m in re.finditer(r'^✘ ([A-G]\d+)', r.stdout, re.M)}
D = lambda t, rel: t / 'docs/command-center' / rel
def edit(t, rel, fn): p = D(t, rel); p.write_text(fn(p.read_text()))
def jedit(t, rel, fn): p = D(t, rel); d = json.loads(p.read_text()); fn(d); p.write_text(json.dumps(d, ensure_ascii=False, indent=1))
sc = lambda d, n: next(e for e in d['escenarios'] if e['n'] == n)
def case(v, name, mutate, expect):
    t = fresh()
    try: mutate(t); rc, ids = run(t, v); chk(f'3.{v} · {name}: detectada en {"/".join(sorted(expect))}', rc != 0 and bool(ids & set(expect)), ids)
    finally: shutil.rmtree(t)
for v in (3, 4, 5):
    t = fresh(); rc, ids = run(t, v); shutil.rmtree(t); chk(f'3.{v} · línea base: el repositorio real es consistente', rc == 0, ids)
DOC3, DOC4 = 'FASE_3_3_HALLAZGOS_RIESGOS_OPORTUNIDADES.md', 'FASE_3_4_PRIORIDADES_RECOMENDACIONES.md'
# ---------------- 3.3 (Z3) ----------------
case(3, 'un documento aceptado cambia', lambda t: edit(t, 'MODELO_LECTURA_EJECUTIVA.md', lambda x: x + '\nx\n'), {'A1'})
case(3, 'se altera la especificación aceptada de Z1 (hash)', lambda t: edit(t, 'FASE_3_2_RESUMEN_EJECUTIVO.md', lambda x: x + '\nx\n'), {'A1'})
case(3, 'cambia un archivo de js/', lambda t: (t / 'js/app.js').write_text((t / 'js/app.js').read_text() + '\n//x\n'), {'A3'})
case(3, 'un escenario generado se edita a mano', lambda t: jedit(t, 'generated/ESCENARIOS_Z3.json', lambda d: sc(d, 1)['salida'].__setitem__('header', '5 de 7')), {'B1', 'E1'})
case(3, 'el wireframe se edita a mano', lambda t: edit(t, 'wireframes/z3_3_3_wireframe.html', lambda x: x.replace('Qué merece atención', 'Qué merece atenciòn', 1)), {'B1'})
case(3, 'la matriz en Markdown se edita a mano', lambda t: edit(t, 'MATRIZ_TRAZABILIDAD_Z3.md', lambda x: x.replace('Por desarrollar', 'Disponible', 1)), {'B2'})
case(3, 'un requisito «Disponible» pierde sus fuentes', lambda t: jedit(t, 'generated/MATRIZ_TRAZABILIDAD_Z3.json', lambda d: next(r for r in d['filas'] if r['estado'] == 'Disponible').__setitem__('motores', [])), {'C4', 'B2'})
case(3, 'un requisito «Por desarrollar» pierde su dependencia', lambda t: jedit(t, 'generated/MATRIZ_TRAZABILIDAD_Z3.json', lambda d: next(r for r in d['filas'] if r['estado'] == 'Por desarrollar').__setitem__('dependencias', [])), {'C10', 'C3', 'B2'})
case(3, 'se altera el conteo de la matriz en el documento', lambda t: edit(t, DOC3, lambda x: re.sub(r'\*\*17 requisitos: 1 Disponible, 11', '**17 requisitos: 1 Disponible, 10', x)), {'C2'})
case(3, 'se rompe la numeración de secciones', lambda t: edit(t, DOC3, lambda x: x.replace('## 6. La confiabilidad condiciona', '## 7. La confiabilidad condiciona', 1)), {'C8'})
case(3, 'el texto de una regla T cambia en el documento', lambda t: edit(t, DOC3, lambda x: x.replace('Sin utilidad, ganancia, beneficio, rentabilidad, ROI, ROAS ni CAC.', 'Se permite hablar de utilidad.', 1)), {'D1'})
case(3, 'la tabla de escenarios del documento cambia una fila', lambda t: edit(t, DOC3, lambda x: x.replace('| Baja | solo_observado | 3 de 3 |', '| Alta | completo | 3 de 3 |', 1)), {'D2'})
case(3, 'un ejemplo incorrecto cambia sus reglas', lambda t: edit(t, DOC3, lambda x: re.sub(r'(\| X1 \|[^\n]*\| )T1 \|', r'\g<1>T2 |', x, count=1)), {'D4'})
case(3, 'con confiabilidad Baja se muestra un riesgo (oráculo)', lambda t: jedit(t, 'generated/ESCENARIOS_Z3.json', lambda d: sc(d, 3)['salida']['cards'][0].__setitem__('clase', 'riesgo')), {'B1', 'E1'})
case(3, 'el universo se desordena (oráculo)', lambda t: jedit(t, 'generated/ESCENARIOS_Z3.json', lambda d: sc(d, 1)['salida']['cards'].reverse()), {'B1', 'E1'})
case(3, 'una contribución ya no es ventas × margen (oráculo)', lambda t: jedit(t, 'generated/ESCENARIOS_Z3.json', lambda d: sc(d, 11)['salida']['cards'][0]['impact']['contribution'].__setitem__('point', 5)), {'B1', 'E1'})
case(3, 'las alternativas excluyentes se suman en el total (oráculo)', lambda t: jedit(t, 'generated/ESCENARIOS_Z3.json', lambda d: [l.update(high=1482816.17, low=1482816.17, point=1482816.17, isRange=False) for l in sc(d, 1)['salida']['totals']['oportunidad']['lines'] if l['category'] == 'alcanzable']), {'B1', 'E1'})
case(3, 'una oportunidad se presenta como cálculo (oráculo)', lambda t: jedit(t, 'generated/ESCENARIOS_Z3.json', lambda d: next(c for c in sc(d, 1)['salida']['cards'] if c['clase'] == 'oportunidad')['certainty'].__setitem__('level', 'calculo')), {'B1', 'E1'})
case(3, 'una tarjeta usa un término financiero (oráculo)', lambda t: jedit(t, 'generated/ESCENARIOS_Z3.json', lambda d: sc(d, 1)['salida']['cards'][0].__setitem__('title', 'La utilidad del cierre cae')), {'B1', 'E1'})
case(3, 'el wireframe muestra un identificador interno', lambda t: edit(t, 'wireframes/z3_3_3_wireframe.html', lambda x: x.replace('Qué merece atención', 'solo_datos Qué merece atención', 1)), {'F1', 'B1'})
case(3, 'falta una captura', lambda t: next(D(t, 'wireframes/capturas_3_3').glob('diseno_propuesto_escenario_05.png')).unlink(), {'F5'})
case(3, 'ESTADO.md acepta 3.3 por su cuenta', lambda t: edit(t, 'ESTADO.md', lambda x: re.sub(r'(\| 3\.3 Hallazgos, riesgos y oportunidades \| )[^|]*\|', r'\g<1>ACEPTADA CON LIMITACIONES DOCUMENTADAS |', x)), {'G1'})
case(3, 'el documento 3.3 cambia su estado', lambda t: edit(t, DOC3, lambda x: re.sub(r'^\*\*Estado:\*\*.*$', '**Estado:** ACEPTADA.', x, count=1, flags=re.M)), {'G2'})
# ---------------- 3.4 (Z4) ----------------
case(4, 'una acción tiene importe propio (oráculo)', lambda t: jedit(t, 'generated/ESCENARIOS_Z4.json', lambda d: sc(d, 1)['salida']['cards'][0].__setitem__('amount', 722816)), {'B1', 'E1'})
case(4, 'una acción cita un elemento que no está a la vista (oráculo)', lambda t: jedit(t, 'generated/ESCENARIOS_Z4.json', lambda d: sc(d, 1)['salida']['cards'][0]['cites'][0].__setitem__('id', 'f:otro')), {'B1', 'E1'})
case(4, 'con confiabilidad Insuficiente se recomienda revisar (oráculo)', lambda t: jedit(t, 'generated/ESCENARIOS_Z4.json', lambda d: sc(d, 4)['salida']['cards'][0].__setitem__('kind', 'revisar')), {'B1', 'E1'})
case(4, 'una acción de datos aparece después de otras (oráculo)', lambda t: jedit(t, 'generated/ESCENARIOS_Z4.json', lambda d: sc(d, 13)['salida']['cards'].reverse()), {'B1', 'E1'})
case(4, 'se decide sobre una hipótesis (oráculo)', lambda t: jedit(t, 'generated/ESCENARIOS_Z4.json', lambda d: next(c for c in sc(d, 12)['salida']['cards'] if c['id'] == 'a:hip').__setitem__('kind', 'decidir')), {'B1', 'E1'})
case(4, 'una acción trae responsable (oráculo)', lambda t: jedit(t, 'generated/ESCENARIOS_Z4.json', lambda d: sc(d, 9)['salida']['cards'][0].__setitem__('owner', 'Equipo digital')), {'B1', 'E1'})
case(4, 'el texto de una acción lleva un importe (oráculo)', lambda t: jedit(t, 'generated/ESCENARIOS_Z4.json', lambda d: sc(d, 1)['salida']['cards'][0].__setitem__('label', 'Recuperar $722 mil')), {'B1', 'E1'})
case(4, 'el importe citado pierde su rótulo (oráculo)', lambda t: jedit(t, 'generated/ESCENARIOS_Z4.json', lambda d: sc(d, 1)['salida']['cards'][0]['cites'][0]['impactRef'].__setitem__('note', '')), {'B1', 'E1'})
case(4, 'sin acciones no se dice qué falta (oráculo)', lambda t: jedit(t, 'generated/ESCENARIOS_Z4.json', lambda d: sc(d, 6)['salida'].__setitem__('fallback', None)), {'B1', 'E1'})
case(4, 'la tabla de escenarios del documento cambia', lambda t: edit(t, DOC4, lambda x: x.replace('| solo_datos | 2 de 2 |', '| completo | 2 de 2 |', 1)), {'D2'})
case(4, 'el texto de una regla A cambia en el documento', lambda t: edit(t, DOC4, lambda x: x.replace('Máximo 14 palabras.', 'Sin límite de palabras.', 1)), {'D1'})
case(4, 'el wireframe de Z4 se edita a mano', lambda t: edit(t, 'wireframes/z4_3_4_wireframe.html', lambda x: x.replace('Qué hago', 'Qué hagò', 1)), {'B1'})
case(4, 'ESTADO.md acepta 3.4 por su cuenta', lambda t: edit(t, 'ESTADO.md', lambda x: re.sub(r'(\| 3\.4 Prioridades y recomendaciones \| )[^|]*\|', r'\g<1>ACEPTADA CON LIMITACIONES DOCUMENTADAS |', x)), {'G1'})
# ---------------- 3.5 (prototipo) ----------------
DOC5 = 'FASE_3_5_PROTOTIPO_VALIDACION_UX.md'
case(5, 'el prototipo se edita a mano', lambda t: edit(t, 'prototipo/home_3_5_prototipo.html', lambda x: x.replace('DATOS SIMULADOS', 'DATOS REALES', 1)), {'B1', 'D2'})
case(5, 'una situación pierde coherencia de confiabilidad (oráculo)', lambda t: jedit(t, 'generated/PROTOTIPO_SITUACIONES.json', lambda d: d['situaciones'][2].__setitem__('z3Level', 'Alta')), {'B1', 'D1'})
case(5, 'la barra de contexto no coincide con Z1', lambda t: edit(t, 'prototipo/home_3_5_prototipo.html', lambda x: x.replace('data-bc-level="Baja"', 'data-bc-level="Alta"', 1)), {'B1', 'D1'})
case(5, 'las zonas cambian de orden', lambda t: edit(t, 'prototipo/home_3_5_prototipo.html', lambda x: x.replace('<section class="zb" data-wf-f="z2" id="z2-alta"', '<section class="zb" data-wf-f="z2" id="z9-alta"', 1)), {'B1', 'D1'})
case(5, 'el documento afirma que ya se probó con usuarios', lambda t: edit(t, DOC5, lambda x: x.replace('PENDIENTE: no se ejecutó', 'ya ejecutado'), ), {'C6'})
case(5, 'la tabla de situaciones del documento cambia', lambda t: edit(t, DOC5, lambda x: re.sub(r'(\| `enorden` \|[^\n]*\| Alta \| )completo', r'\g<1>solo_datos', x, count=1)), {'C2'})
case(5, 'la tabla de dependencias no coincide con las matrices', lambda t: edit(t, DOC5, lambda x: re.sub(r'(\| Z3 \(matriz de 3\.3\) \| 17 \| 1 \| )11', r'\g<1>9', x)), {'C3'})
case(5, 'la especificación UX/UI cambia el texto de una regla', lambda t: edit(t, 'ESPECIFICACION_UX_UI_COMMAND_CENTER.md', lambda x: x.replace('Máximo 14 palabras.', 'Máximo 30 palabras.', 1)), {'C1'})
case(5, 'el documento cita un archivo inexistente', lambda t: edit(t, DOC5, lambda x: x + '\nVer `docs/command-center/NO_EXISTE.md`.\n'), {'C4'})
case(5, 'falta una captura del prototipo', lambda t: next(D(t, 'prototipo/capturas_3_5').glob('prototipo_movil_baja.png')).unlink(), {'C5'})
case(5, 'ESTADO.md acepta 3.5 por su cuenta', lambda t: edit(t, 'ESTADO.md', lambda x: re.sub(r'(\| 3\.5 Prototipo y validación UX \| )[^|]*\|', r'\g<1>ACEPTADA CON LIMITACIONES DOCUMENTADAS |', x)), {'E1'})
case(5, 'se inicia la Fase 4', lambda t: edit(t, 'ESTADO.md', lambda x: x.replace('| 4.1 Integración de fuentes y contexto | NO INICIADA |', '| 4.1 Integración de fuentes y contexto | EN EJECUCIÓN |')), {'E1'})
print(f'\n{ok} bien, {len(bad)} mal'); print('TODO BIEN' if not bad else 'FALLAS: ' + '; '.join(bad)); sys.exit(1 if bad else 0)
