#!/usr/bin/env python3
"""Registra los hashes de las modificaciones AUTORIZADAS por el usuario a archivos aceptados (D-05: afirmación «datos completos» de Z1; H-01: aclaración de la regla de propiedad de zona en 3.1).
Solo admite la lista cerrada de archivos de abajo; el hash base sale de generated/HASHES_BASE_3_3.json (línea base de 3.3) y el nuevo del archivo actual.
Uso: python3 tools/audit/registrar_modificaciones_autorizadas.py"""
import hashlib, json, pathlib
R = pathlib.Path(__file__).resolve().parents[2]; D = R / 'docs/command-center'
base = json.loads((D / 'generated/HASHES_BASE_3_3.json').read_text())
sha = lambda p: hashlib.sha256(p.read_bytes()).hexdigest()
CERRADA = {'FASE_3_1_ARQUITECTURA_INFORMACION.md': D, 'FASE_3_2_RESUMEN_EJECUTIVO.md': D, 'FASE_3_2_ESCENARIOS_Z1.md': D, 'generated/ESCENARIOS_Z1.json': D, 'wireframes/z1_3_2_wireframe.html': D, 'tools/audit/z1-lectura-ejecutiva.js': R}
AUT_D05 = ('D-05 (12-nov-2026): corregir la afirmación «datos completos» de Z1 y sus condiciones de uso; sin tocar fórmulas, motor, atribución, contratos de Fase 2 ni la arquitectura de Z1', 'docs/command-center/CAMBIO_AUTORIZADO_D05_Z1.md')
AUT_H01 = ('H-01 (12-nov-2026): aclarar la regla «una pieza vive en una sola capa y zona» (una zona propietaria y una fuente de verdad; las demás zonas referencian); solo ese apartado', 'docs/command-center/ACLARACION_H01_H02_PROPIEDAD_Z5.md')
out = {}
for k, root in CERRADA.items():
    h = base['documentos_aceptados'].get(k) or base['especificacion_aceptada'].get(k); assert h, k
    au, rg = AUT_H01 if k == 'FASE_3_1_ARQUITECTURA_INFORMACION.md' else AUT_D05
    out[k] = {'hash_base': h, 'hash_nuevo': sha(root / k), 'autorizacion': au, 'registro': rg}
(D / 'generated/MODIFICACIONES_AUTORIZADAS.json').write_text(json.dumps({'nota': 'Modificaciones autorizadas por el usuario a archivos protegidos. Un cambio distinto del registrado se sigue detectando.', 'archivos': out}, indent=1, ensure_ascii=False) + '\n')
print('registradas', len(out))
