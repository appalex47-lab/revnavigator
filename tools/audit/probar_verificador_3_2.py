#!/usr/bin/env python3
"""Pruebas NEGATIVAS del verificador de consistencia de 3.2 (tools/audit/verificar_consistencia_3_2.py): se copia el repositorio relevante a un directorio temporal
(CC32_ROOT), se introduce UNA contradicción concreta y se exige que el verificador falle en el check esperado. Una mutación que sobreviva es un hueco del verificador.
Solo lee el repositorio real. Uso: python3 tools/audit/probar_verificador_3_2.py"""
import json, os, pathlib, re, shutil, subprocess, sys, tempfile
HERE = pathlib.Path(__file__).resolve().parents[2]; VERIF = HERE / 'tools/audit/verificar_consistencia_3_2.py'
ok = 0; bad = []
def chk(name, cond, detail=''):
    global ok
    print(('✔ ' if cond else '✘ ') + name + ('' if cond else f' — {detail}'))
    if cond: ok += 1
    else: bad.append(name)
def fresh():
    t = pathlib.Path(tempfile.mkdtemp()); shutil.copytree(HERE / 'docs/command-center', t / 'docs/command-center')
    shutil.copytree(HERE / 'js', t / 'js'); shutil.copytree(HERE / 'css', t / 'css'); shutil.copy(HERE / 'index.html', t / 'index.html'); return t
def run(t):
    r = subprocess.run([sys.executable, str(VERIF)], env={**os.environ, 'CC32_ROOT': str(t)}, capture_output=True, text=True)
    return r.returncode, {m.group(1) for m in re.finditer(r'^✘ ([A-G]\d+)', r.stdout, re.M)}
def D(t, rel): return t / 'docs/command-center' / rel
def edit(t, rel, fn): p = D(t, rel); p.write_text(fn(p.read_text()))
def jedit(t, rel, fn): p = D(t, rel); d = json.loads(p.read_text()); fn(d); p.write_text(json.dumps(d, ensure_ascii=False, indent=1))
def sc(d, n): return next(e for e in d['escenarios'] if str(e['n']) == str(n))
def case(name, mutate, expect):
    t = fresh()
    try: mutate(t); rc, ids = run(t); chk(f'{name}: detectada en {"/".join(sorted(expect))}', rc != 0 and bool(ids & set(expect)), ids)
    finally: shutil.rmtree(t)
t = fresh(); rc, ids = run(t); shutil.rmtree(t); chk('línea base: el repositorio real es consistente', rc == 0, ids)
case('un documento aceptado de una fase anterior cambia', lambda t: edit(t, 'MODELO_LECTURA_EJECUTIVA.md', lambda x: x + '\nCambio.\n'), {'A1'})
case('un archivo del código de la aplicación cambia', lambda t: (t / 'js/app.js').write_text((t / 'js/app.js').read_text() + '\n//x\n'), {'A2'})
case('aparece un archivo nuevo en js/', lambda t: (t / 'js/nuevo_z1.js').write_text('//z1'), {'A2'})
case('un veredicto generado se edita a mano (JSON)', lambda t: jedit(t, 'generated/ESCENARIOS_Z1.json', lambda d: sc(d, 2)['salida']['verdict'].__setitem__('text', 'Vas muy bien.')), {'B1'})
case('el wireframe se edita a mano', lambda t: edit(t, 'wireframes/z1_3_2_wireframe.html', lambda x: x.replace('Confiabilidad alta', 'Confiabilidad ALTA', 1)), {'B1'})
case('la matriz en Markdown se edita a mano', lambda t: edit(t, 'MATRIZ_TRAZABILIDAD_Z1.md', lambda x: x.replace('Por desarrollar', 'Disponible', 1)), {'B2'})
case('la matriz pierde un requisito', lambda t: jedit(t, 'generated/MATRIZ_TRAZABILIDAD_Z1.json', lambda d: d['filas'].pop()), {'C1', 'B2'})
case('un requisito «Disponible» pierde sus fuentes', lambda t: jedit(t, 'generated/MATRIZ_TRAZABILIDAD_Z1.json', lambda d: next(r for r in d['filas'] if r['estado'] == 'Disponible').__setitem__('motores', [])), {'C4', 'B2'})
case('un requisito «Por desarrollar» pierde su dependencia', lambda t: jedit(t, 'generated/MATRIZ_TRAZABILIDAD_Z1.json', lambda d: next(r for r in d['filas'] if r['estado'] == 'Por desarrollar').__setitem__('dependencias', [])), {'C3', 'C10', 'B2'})
case('una dependencia usa una categoría inválida', lambda t: jedit(t, 'generated/MATRIZ_TRAZABILIDAD_Z1.json', lambda d: d['filas'][0]['dependencias'][0].__setitem__('categoria', 'otra')), {'C9', 'B2'})
case('al documento se le altera el conteo de la matriz', lambda t: edit(t, 'FASE_3_2_RESUMEN_EJECUTIVO.md', lambda x: re.sub(r'(\*\*29 requisitos: 5 Disponible, )13', r'\g<1>12', x)), {'C2'})
case('se rompe la numeración de secciones del documento', lambda t: edit(t, 'FASE_3_2_RESUMEN_EJECUTIVO.md', lambda x: x.replace('## 10. Nombres visibles (D-06)', '## 11. Nombres visibles (D-06)')), {'C8'})
case('la tabla de escenarios del documento cambia una confiabilidad', lambda t: edit(t, 'FASE_3_2_RESUMEN_EJECUTIVO.md', lambda x: x.replace('| Baja | Lectura preliminar |', '| Media | Lectura preliminar |', 1)), {'D1'})
case('un veredicto «correcto» del documento se altera', lambda t: edit(t, 'FASE_3_2_RESUMEN_EJECUTIVO.md', lambda x: x.replace('Lectura preliminar: la venta acumulada parece estar por debajo de la meta', 'Lectura preliminar: la venta acumulada está por debajo de la meta', 1)), {'D3'})
case('un ejemplo incorrecto del documento cambia sus reglas', lambda t: edit(t, 'FASE_3_2_RESUMEN_EJECUTIVO.md', lambda x: x.replace('| R1, R8 |', '| R1 |', 1)), {'D4'})
case('el nombre visible de un estado cambia en el documento', lambda t: edit(t, 'FASE_3_2_RESUMEN_EJECUTIVO.md', lambda x: x.replace('| En deterioro | La venta cae', '| Deterioro | La venta cae', 1)), {'D6'})
case('el texto de una regla del documento cambia', lambda t: edit(t, 'FASE_3_2_RESUMEN_EJECUTIVO.md', lambda x: x.replace('El veredicto no lleva importes en pesos.', 'El veredicto puede llevar importes.', 1)), {'D7'})
case('el JSON de nombres visibles filtra un identificador interno', lambda t: jedit(t, 'generated/ESCENARIOS_Z1.json', lambda d: d['nombresVisibles']['estados']['deterioro'].__setitem__(0, 'estado_deterioro')), {'B1', 'D6', 'D8'})
case('un escenario deja de coincidir con lo esperado', lambda t: jedit(t, 'generated/ESCENARIOS_Z1.json', lambda d: sc(d, 5)['comparacion'].update(coincide=False, diferencias=['x'])), {'B1', 'D2'})
case('un escenario con confiabilidad Baja pasa a Alta (oráculo)', lambda t: jedit(t, 'generated/ESCENARIOS_Z1.json', lambda d: sc(d, 5)['salida']['reliability'].__setitem__('level', 'Alta')), {'B1', 'E1', 'D1'})
case('con confiabilidad Insuficiente se muestra la brecha (D-01)', lambda t: jedit(t, 'generated/ESCENARIOS_Z1.json', lambda d: sc(d, 6)['salida']['economic']['primary'].__setitem__('kind', 'brecha')), {'B1', 'E1', 'E5'})
case('la contribución sale como 0 sin margen (D-02)', lambda t: jedit(t, 'generated/ESCENARIOS_Z1.json', lambda d: sc(d, 2)['salida']['economic']['contribution'].__setitem__('amount', 0)), {'B1', 'E1', 'E3'})
case('el veredicto lleva un importe (D-03)', lambda t: jedit(t, 'generated/ESCENARIOS_Z1.json', lambda d: sc(d, 2)['salida']['verdict'].__setitem__('text', 'La venta acumulada está por debajo de la meta en $723 mil.')), {'B1', 'E1'})
case('sin actividad se muestra $0 como venta observada (D-04)', lambda t: jedit(t, 'generated/ESCENARIOS_Z1.json', lambda d: sc(d, 7)['salida']['economic']['observed'].update(visible=True, amount=0, display='$0')), {'B1', 'E1', 'E4'})
case('un bloqueo duro se degrada a Baja (D-05)', lambda t: jedit(t, 'generated/ESCENARIOS_Z1.json', lambda d: sc(d, 'A3')['salida']['reliability'].__setitem__('level', 'Baja')), {'B1', 'E1'})
case('el wireframe muestra un identificador interno', lambda t: edit(t, 'wireframes/z1_3_2_wireframe.html', lambda x: x.replace('Confiabilidad baja', 'sin_base Confiabilidad baja', 1)), {'F7', 'B1'})
case('auditoría: actividad no verificable se presenta como «sin actividad»', lambda t: jedit(t, 'generated/ESCENARIOS_Z1.json', lambda d: sc(d, 'A6')['salida']['verdict'].__setitem__('text', 'No hay actividad observable en el periodo: no es posible emitir una lectura del negocio.')), {'B1', 'E1'})
case('auditoría: un cero medido se describe como «Hay venta registrada»', lambda t: jedit(t, 'generated/ESCENARIOS_Z1.json', lambda d: sc(d, 'A5')['salida']['verdict'].__setitem__('text', 'Hay venta registrada, pero sin plan del periodo no es posible valorar el cumplimiento.')), {'B1', 'E1'})
case('auditoría: falta de dato se muestra como $0 en la narrativa', lambda t: jedit(t, 'generated/ESCENARIOS_Z1.json', lambda d: sc(d, 'A6')['salida']['narrative']['long'].__setitem__('hecho', 'La venta observada es $0.')), {'B1', 'E1'})
case('auditoría: un margen no válido produce un importe', lambda t: jedit(t, 'generated/ESCENARIOS_Z1.json', lambda d: sc(d, 'A11')['salida']['economic']['contribution'].update(status='disponible', amount=-100000, display='−$100 mil')), {'B1', 'E1'})
case('auditoría: la contribución pierde la declaración de estimación con margen promedio', lambda t: jedit(t, 'generated/ESCENARIOS_Z1.json', lambda d: sc(d, 2)['salida']['economic']['contribution'].update(status='disponible', amount=-180000, display='−$180 mil', marginDisplay='25 %', limitations=[])), {'B1', 'E1'})
case('auditoría: el aviso de conversión cero sugiere una falla de medición', lambda t: jedit(t, 'generated/ESCENARIOS_Z1.json', lambda d: sc(d, 10)['salida']['reliability'].update(reasons=['Hay sesiones pero ningún pedido: posible falla de medición de pedidos.'])), {'B1', 'E1'})
case('C1: pedidos con venta cero se reclasifican como dato no calculable', lambda t: jedit(t, 'generated/ESCENARIOS_Z1.json', lambda d: sc(d, 'A8')['salida']['data'].__setitem__('class', 'no_calculable')), {'B1', 'E1'})
case('C1: venta positiva con cero pedidos se declara conversión cero', lambda t: jedit(t, 'generated/ESCENARIOS_Z1.json', lambda d: sc(d, 'A13')['salida']['verdict'].__setitem__('kind', 'conversion_cero')), {'B1', 'E1'})
case('C1: una inconsistencia pendiente aparece con confiabilidad Alta', lambda t: jedit(t, 'generated/ESCENARIOS_Z1.json', lambda d: sc(d, 'A13')['salida']['reliability'].__setitem__('level', 'Alta')), {'B1', 'E1', 'D1'})
case('C2: una diferencia de 0.4 % se declara sin diferencia', lambda t: jedit(t, 'generated/ESCENARIOS_Z1.json', lambda d: sc(d, 'A14')['salida']['data']['reconciliation'].__setitem__('status', 'sin_diferencia_observada')), {'B1', 'E1'})
case('C2: reaparece una tolerancia de conciliación', lambda t: jedit(t, 'generated/ESCENARIOS_Z1.json', lambda d: sc(d, 'A14')['salida']['data']['reconciliation'].__setitem__('tolerance', 0.01)), {'B1', 'E1'})
case('C3: pedidos sin medir bajan la confiabilidad con venta positiva', lambda t: jedit(t, 'generated/ESCENARIOS_Z1.json', lambda d: sc(d, 'A7')['salida']['reliability'].__setitem__('level', 'Baja')), {'B1', 'E1', 'D1'})
case('C3: la conversión sin pedidos medidos figura como observable', lambda t: jedit(t, 'generated/ESCENARIOS_Z1.json', lambda d: sc(d, 'A7')['salida']['conclusions'].__setitem__('conversion', 'observable')), {'B1', 'E1'})
case('C4: el margen no válido pierde el motivo de la validación del motor', lambda t: jedit(t, 'generated/ESCENARIOS_Z1.json', lambda d: sc(d, 'A11')['salida']['economic']['contribution'].__setitem__('validation', None)), {'B1', 'E1'})
case('C5: un 0 % sin evidencia de configuración produce $0', lambda t: jedit(t, 'generated/ESCENARIOS_Z1.json', lambda d: sc(d, 'A16')['salida']['economic']['contribution'].update(status='disponible', amount=0, display='$0', marginPct=0, marginDisplay='0 %', limitations=['Estimación sobre la brecha contra el plan con el margen bruto promedio general: no es el margen real del canal, producto o pedido ni una contribución observada.'])), {'B1', 'E1'})
case('C5: el 0 % explícito pierde su declaración', lambda t: jedit(t, 'generated/ESCENARIOS_Z1.json', lambda d: sc(d, 'A12')['salida']['economic']['contribution'].__setitem__('limitations', ['Estimación sobre la brecha contra el plan con el margen bruto promedio general: no es el margen real del canal, producto o pedido ni una contribución observada.'])), {'B1', 'E1'})
case('falta una captura de evidencia', lambda t: next((D(t, 'wireframes/capturas_3_2')).glob('diseno_propuesto_escenario_A1.png')).unlink(), {'F6'})
case('ESTADO.md acepta 3.2 por su cuenta', lambda t: edit(t, 'ESTADO.md', lambda x: re.sub(r'(\| 3\.2 Resumen ejecutivo \| )[^|]*\|', r'\g<1>ACEPTADA CON LIMITACIONES DOCUMENTADAS |', x)), {'G3', 'G2'})
case('ESTADO.md inicia la Fase 4', lambda t: edit(t, 'ESTADO.md', lambda x: x.replace('| 4.1 Integración de fuentes y contexto | NO INICIADA |', '| 4.1 Integración de fuentes y contexto | EN EJECUCIÓN |')), {'G2'})
print(f'\n{ok} bien, {len(bad)} mal'); print('TODO BIEN' if not bad else 'FALLAS: ' + '; '.join(bad)); sys.exit(1 if bad else 0)
