#!/usr/bin/env python3
"""Pruebas NEGATIVAS (y positivas) del verificador de consistencia de 3.1 (tools/audit/verificar_consistencia_3_1.py).
Un verificador que no puede fallar no sirve: aquí se copian los documentos a un directorio temporal (CC31_ROOT), se les introduce una contradicción concreta del roadmap y
se exige que el verificador la detecte con el check esperado. También se prueban avances LEGÍTIMOS, que el verificador debe aceptar (no puede bloquear el progreso real).
Solo lee el repositorio real; todo lo que modifica es una copia temporal. Uso: python3 tools/audit/probar_verificador_3_1.py"""
import json, os, pathlib, re, shutil, subprocess, sys, tempfile
HERE = pathlib.Path(__file__).resolve().parents[2]
VERIF = HERE / 'tools/audit/verificar_consistencia_3_1.py'
ok = 0; bad = []
def chk(name, cond, detail=''):
    global ok
    print(('✔ ' if cond else '✘ ') + name + ('' if cond else f' — {detail}'))
    if cond: ok += 1
    else: bad.append(name)
def fresh():
    t = pathlib.Path(tempfile.mkdtemp()); shutil.copytree(HERE / 'tools/audit', t / 'tools/audit')
    shutil.copytree(HERE / 'docs/command-center', t / 'docs/command-center', ignore=shutil.ignore_patterns('capturas*', '*.png'))
    return t
def run(t):
    r = subprocess.run([sys.executable, str(VERIF)], env={**os.environ, 'CC31_ROOT': str(t)}, capture_output=True, text=True)
    return r.returncode, r.stdout
def failed_ids(out): return {m.group(1) for m in re.finditer(r'^✘ (C\d+)', out, re.M)}
def edit(t, rel, fn):
    p = t / 'docs/command-center' / rel; p.write_text(fn(p.read_text()))
def set_state(sub, new):
    def f(txt):
        out = []
        for line in txt.split('\n'):
            if f'| {sub} |' in line: line = line.split(f'| {sub} |')[0] + f'| {sub} | {new} |'
            out.append(line)
        return '\n'.join(out)
    return f
def case(name, mutate, expect_fail=None, expect_pass=False):
    t = fresh()
    try:
        mutate(t); rc, out = run(t); ids = failed_ids(out)
        if expect_pass: chk(f'positiva · {name}: el verificador la ACEPTA', rc == 0 and not ids, ids)
        else: chk(f'negativa · {name}: el verificador la detecta en {expect_fail}', rc != 0 and expect_fail in ids, ids)
    finally: shutil.rmtree(t)

# 0) línea base: el repositorio real pasa
rc, out = run(HERE); chk('línea base: el estado real del repositorio es consistente', rc == 0, failed_ids(out))
S = lambda sub, new: (lambda t: edit(t, 'ESTADO.md', set_state(sub, new)))
def both(*fs): return lambda t: [f(t) for f in fs]
# ---- negativas ----
case('salto: 4.1 EN EJECUCIÓN con 3.3 a 3.5 sin aceptar', S('4.1 Integración de fuentes y contexto', 'EN EJECUCIÓN'), 'C32')
case('salto: 4.1 COMPLETADA con 3.3 a 3.5 sin aceptar (la Fase 4 no tiene ejecución continua autorizada)', S('4.1 Integración de fuentes y contexto', 'COMPLETADA CON LIMITACIONES DOCUMENTADAS (no aceptada)'), 'C32')
case('salto: 4.2 ACEPTADA con todo lo anterior sin aceptar', S('4.2 Motor de diagnósticos', 'COMPLETADA Y ACEPTADA'), 'C32')
case('dos subfases abiertas fuera de la cadena autorizada (3.5 en ejecución y 4.2 en ejecución)', S('4.2 Motor de diagnósticos', 'EN EJECUCIÓN'), 'C32')
case('cadena autorizada con un hueco: 3.4 sin completar mientras 3.5 sigue en ejecución y 3.3 acepta… (3.4 vuelve a no iniciada)', S('3.4 Prioridades y recomendaciones', 'NO INICIADA'), 'C32')
case('estado desconocido: «HECHA»', S('3.2 Resumen ejecutivo', 'HECHA'), 'C32')
case('estado incompatible: COMPLETADA … ACEPTADA a la vez', S('3.2 Resumen ejecutivo', 'COMPLETADA CON LIMITACIONES DOCUMENTADAS (aceptada)'), 'C32')
case('estado incompatible: ACEPTADA y «no aceptada» a la vez', S('3.1 Arquitectura de información', 'ACEPTADA CON LIMITACIONES DOCUMENTADAS (no aceptada)'), 'C32')
case('estado incompatible: NO INICIADA con texto añadido', S('3.3 Hallazgos, riesgos y oportunidades', 'NO INICIADA pero con trabajo avanzado'), 'C32')
case('retroceso: 3.1 vuelve de ACEPTADA a COMPLETADA', S('3.1 Arquitectura de información', 'COMPLETADA CON LIMITACIONES DOCUMENTADAS (no aceptada)'), 'C34')
case('retroceso: 1.3 vuelve a NO INICIADA', S('1.3 Auditoría de motores de cálculo y diagnósticos', 'NO INICIADA'), 'C34')
case('retroceso: 3.2 vuelve a NO INICIADA', S('3.2 Resumen ejecutivo', 'NO INICIADA'), 'C34')
case('registro de máximos ausente', lambda t: (t / 'docs/command-center/generated/ESTADO_MAXIMOS.json').unlink(), 'C34')
case('registro de máximos incompleto (falta una subfase)', lambda t: (lambda p: p.write_text(json.dumps({k: v for k, v in json.loads(p.read_text()).items() if not k.startswith('6.5')})))(t / 'docs/command-center/generated/ESTADO_MAXIMOS.json'), 'C34')
case('subfase ausente de ESTADO.md', lambda t: edit(t, 'ESTADO.md', lambda x: '\n'.join(l for l in x.split('\n') if '| 5.3 Explicación de causas y hallazgos |' not in l)), 'C31')
case('nombre de subfase alterado en ESTADO.md', lambda t: edit(t, 'ESTADO.md', lambda x: x.replace('3.3 Hallazgos, riesgos y oportunidades', '3.3 Hallazgos')), 'C31')
case('ESTADO.md acepta 3.2 sin registrar la aceptación formal en su fila', S('3.2 Resumen ejecutivo', 'ACEPTADA CON LIMITACIONES DOCUMENTADAS'), 'C35')
case('el documento 3.3 afirma ACEPTADA mientras ESTADO.md dice que no lo está (la fila de 3.3 vuelve a COMPLETADA)', both(S('3.3 Hallazgos, riesgos y oportunidades', 'COMPLETADA CON LIMITACIONES DOCUMENTADAS (no aceptada)'), lambda t: edit(t, 'FASE_3_3_HALLAZGOS_RIESGOS_OPORTUNIDADES.md', lambda x: re.sub(r'^\*\*Estado:\*\*.*$', '**Estado:** ACEPTADA CON LIMITACIONES DOCUMENTADAS (aceptación formal comunicada por el usuario).', x, count=1, flags=re.M))), 'C35')
case('documento 3.2 sin línea «Estado:»', lambda t: edit(t, 'FASE_3_2_RESUMEN_EJECUTIVO.md', lambda x: re.sub(r'^\*\*Estado:\*\*.*$', 'Sin estado.', x, count=1, flags=re.M)), 'C35')
case('«Subfase actual» apunta a otra subfase (3.5 abierta y ESTADO.md dice 4.1)', both(S('3.5 Prototipo y validación UX', 'EN EJECUCIÓN'), lambda t: edit(t, 'ESTADO.md', lambda x: x.replace('**Fase actual:** ninguna en ejecución.', '**Fase actual:** Fase 3. Subfase actual: 4.1 Integración de fuentes y contexto.'))), 'C36')
case('encabezado de la Fase 3 sin EN EJECUCIÓN estando 3.2 abierta (3.2 vuelve a EN EJECUCIÓN)', both(S('3.2 Resumen ejecutivo', 'EN EJECUCIÓN'), lambda t: edit(t, 'FASE_3_2_RESUMEN_EJECUTIVO.md', lambda x: re.sub(r'^\*\*Estado:\*\*.*$', '**Estado:** EN EJECUCIÓN.', x, count=1, flags=re.M))), 'C32')
case('Fase 5 marcada EN EJECUCIÓN sin tener la subfase abierta (Fase 3 cerrada y Fase 4 sin iniciar)', lambda t: edit(t, 'ESTADO.md', lambda x: x.replace('**5. IA y generación de insights**', '**5. IA y generación de insights** — EN EJECUCIÓN')), 'C32')
case('se elimina el registro de la aceptación formal y de las decisiones D-01 a D-04', lambda t: edit(t, 'ESTADO.md', lambda x: x.replace('aceptación formal', 'aceptación').replace('D-01', 'D-0x')), 'C33')
# ---- positivas: avances legítimos que NO deben bloquearse ----
acc = 'ACEPTADA CON LIMITACIONES DOCUMENTADAS (aceptación formal comunicada por el usuario)'
case('estado de cierre: 3.1 a 3.5 aceptadas con la aceptación formal registrada y las Fases 4 a 6 sin iniciar (estado real)', lambda t: None, expect_pass=True)
case('3.3 pasa a aceptada (aceptación formal en su fila) mientras 3.4 y 3.5 siguen pendientes', S('3.3 Hallazgos, riesgos y oportunidades', acc), expect_pass=True)
case('retroceso: 3.2 vuelve de COMPLETADA a EN EJECUCIÓN', both(S('3.2 Resumen ejecutivo', 'EN EJECUCIÓN'), lambda t: edit(t, 'FASE_3_2_RESUMEN_EJECUTIVO.md', lambda x: re.sub(r'^\*\*Estado:\*\*.*$', '**Estado:** EN EJECUCIÓN.', x, count=1, flags=re.M))), 'C34')
print(f'\n{ok} bien, {len(bad)} mal'); print('TODO BIEN' if not bad else 'FALLAS: ' + '; '.join(bad)); sys.exit(1 if bad else 0)
