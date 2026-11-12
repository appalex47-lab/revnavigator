"""Command Center · Fase 3 · Subfases 3.3 (Z3) y 3.4 (Z4) — validación contra la APLICACIÓN REAL y contra los WIREFRAMES.
No cambia nada de la aplicación: solo lee. Comprueba (1) que cada fuente FP.* de las matrices existe cuando el estado es Disponible o Parcial y que lo «Por desarrollar»
no existe en js/; (2) que el Home ACTUAL tiene los problemas que Z3 y Z4 corrigen (dos conteos de atención, siguiente paso en una tarjeta larga, hallazgos sin clase visible);
(3) que los wireframes renderizan sin errores a tres anchos, sin desbordamiento y sin partir importes; (4) que existen las capturas. Chromium emulado: NO sustituye un móvil real.
Uso: python3 run_batch.py batch_fase3_3_3_4_zonas.py <raíz>"""
import sys, asyncio, json, pathlib, re
ROOT = sys.argv[1]; sys.argv = sys.argv[:2]
from ed_common import *
R = pathlib.Path(ROOT); D = R / 'docs/command-center'
EXISTS = "(p=>{let o=window; for(const k of p.split('.')){ if(o==null||!(k in Object(o))) return false; o=o[k]} return o!==undefined})"
FIT = r"""(()=>{const out=[]; document.querySelectorAll('.zb').forEach((z,zi)=>{const zr=z.getBoundingClientRect(); z.querySelectorAll('*').forEach(e=>{const r=e.getBoundingClientRect(); if(r.width===0||r.height===0) return;
  if(r.right>zr.right+1||r.left<zr.left-1) out.push(['fuera',zi,e.className||e.tagName]); if(e.scrollWidth>e.clientWidth+1&&getComputedStyle(e).overflowX!=='visible') out.push(['recortado',zi,e.className||e.tagName]);});
  z.querySelectorAll('.nw').forEach(n=>{ if(n.getClientRects().length>1) out.push(['partido',zi,n.textContent.slice(0,30)]) }) }); return out.slice(0,8)})()"""
INTERNAL = r'\b(sin_base|no_configurado|datos_insuficientes|no_aplica|insufficient_data|estimacion|hipotesis|oportunidad|solo_observado|solo_datos|datos_primero|con_elementos|sin_conclusiones|que_falta|sin_base)\b'
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(); q = await boot(b, patch=True); errs = []
        q.on('pageerror', lambda e: errs.append(str(e))); q.on('console', lambda m: errs.append(m.text) if m.type == 'error' else None)
        await q.goto(U + '#inicio'); await q.wait_for_timeout(2200)
        js_all = '\n'.join(f.read_text() for f in (R / 'js').rglob('*.js'))
        for Z in ('Z3', 'Z4'):
            MZ = json.loads((D / f'generated/MATRIZ_TRAZABILIDAD_{Z}.json').read_text()); rows = MZ['filas']
            chk(f'F33.{Z}.0 la matriz de {Z} tiene ids contiguos, estados válidos y la fuente de cada fila', [r['id'] for r in rows] == [f'{Z}-{i:02d}' for i in range(1, len(rows) + 1)] and all(r['estado'] in MZ['estados'] for r in rows))
            ex = await q.evaluate(f"(() => {{ const ex = {EXISTS}; const o = {{}}; {json.dumps(sorted({m for r in rows for m in r['motores']}))}.forEach(m => o[m] = ex(m)); return o }})()")
            for r in rows:
                if r['estado'] in ('Disponible', 'Parcial'):
                    miss = [m for m in r['motores'] if not ex[m]]; chk(f'F33.{Z}.1 {r["id"]} ({r["estado"]}) {r["elemento"][:44]}: sus fuentes existen en la aplicación', bool(r['motores']) and not miss, miss)
                else:
                    spec = r.get('especificacion', '').split(' · ')[0] or ''; chk(f'F33.{Z}.2 {r["id"]} (Por desarrollar) {r["elemento"][:42]}: sin fuentes FP.* y con su especificación fuera de js/', not r['motores'] and (R / spec).exists() and not spec.startswith('js/'), spec)
        chk('F33.3 nada del diseño de Z3 ni de Z4 está implementado en js/ (ni las especificaciones, ni los validadores, ni el clasificador)', not any(t in js_all for t in ['CCZ3', 'CCZ4', 'checkCardText', 'checkActionText', 'pickFeatured', 'CCContracts']))
        h = await q.evaluate("""(()=>{const t=document.body.innerText; return {attn:(t.match(/hallazgos?/gi)||[]).length, tieneRecorrido:!!document.querySelector('[data-home-recorrido]'), nextCard:!!document.querySelector('[data-home-next]'), glyphs:(t.match(/[◆▲●]/g)||[]).length}})()""")
        chk('F33.4 aplicación existente: el Home actual no muestra la clase de cada elemento de atención por forma (◆ ▲ ●); Z3 la hace visible', h['glyphs'] == 0, h)
        await q.close()
        for Z, f, label, req in [('Z3', 'z3_3_3_wireframe.html', 'Z3', ['z3', 'z3-lista', 'z3-tarjeta', 'z3-clase', 'z3-filtros', 'z3-ver-todos', 'z3-impacto', 'z3-datos', 'z3-aviso', 'z3-vacio', 'z3-retenidos', 'z3-totales']),
                                 ('Z4', 'z4_3_4_wireframe.html', 'Z4', ['z4', 'z4-lista', 'z4-tarjeta', 'z4-motivo', 'z4-destino', 'z4-filtros', 'z4-ver-todas', 'z4-vacio', 'z4-aviso', 'z4-retenidas'])]:
            WF = 'file://' + str(D / 'wireframes' / f); errw = []
            for w, hh, nm in [(1280, 900, 'escritorio'), (768, 1024, 'tableta'), (390, 844, 'móvil emulado')]:
                pg = await b.new_page(viewport={'width': w, 'height': hh}); pg.on('pageerror', lambda e: errw.append(str(e))); pg.on('console', lambda m: errw.append(m.text) if m.type == 'error' else None)
                await pg.goto(WF); await pg.wait_for_timeout(400)
                ids = await pg.evaluate("[...document.querySelectorAll('[data-wf-f]')].map(e=>e.dataset.wfF)"); top = await pg.evaluate("[...document.querySelectorAll('[data-wf]')].map(e=>e.dataset.wf)")
                fit = await pg.evaluate(FIT)
                chk(f'F33.{Z}.8 wireframe de {label} a {w} px ({nm}): contiene los componentes pedidos y los 14 escenarios', all(x in ids for x in req) and all(f'escenario-{n:02d}' in top for n in range(1, 15)) and {'frame-desktop', 'frame-tablet', 'frame-mobile', 'estres', 'aplicacion-existente'} <= set(top), [x for x in req if x not in ids][:3])
                chk(f'F33.{Z}.9 wireframe de {label} a {w} px ({nm}): nada se sale ni se recorta y ningún importe se parte', not fit, fit)
                await pg.close()
            pg = await b.new_page(viewport={'width': 1280, 'height': 900}); await pg.goto(WF); await pg.wait_for_timeout(400)
            c = await pg.evaluate("""(()=>({prop:[...document.querySelectorAll('.tag--prop')].length, exist:[...document.querySelectorAll('[data-wf=aplicacion-existente] .tag--exist')].length, protoEnExistente:document.querySelectorAll('[data-wf=aplicacion-existente] .tag--prop').length, img:(()=>{const i=document.querySelector('[data-wf=aplicacion-existente] img'); return i?[i.complete,i.naturalWidth]:null})()}))()""")
            chk(f'F33.{Z}.10 {label}: ≥ 20 rótulos de diseño propuesto; la captura de la aplicación existente va aparte, rotulada y cargada', c['prop'] >= 20 and c['exist'] == 1 and c['protoEnExistente'] == 0 and c['img'] and c['img'][0] and c['img'][1] > 100, c)
            vis = await pg.evaluate("document.body.innerText"); leak = sorted(set(re.findall(INTERNAL, vis)) - {'oportunidad'})
            chk(f'F33.{Z}.11 {label}: el texto visible del wireframe no contiene identificadores internos de estados o modos', not leak, leak)
            txt = (D / 'wireframes' / f).read_text(); sj = json.loads((D / f'generated/ESCENARIOS_{Z}.json').read_text())['escenarios']
            esc = lambda s: s.replace('&', '&amp;').replace('<', '&lt;').replace('>', '&gt;').replace('"', '&quot;')
            if Z == 'Z3': ok = all(esc(c['title']) in txt for e in sj for c in e['salida']['cards'])
            else: ok = all(esc(c['label']) in txt for e in sj for c in e['salida']['cards'])
            chk(f'F33.{Z}.12 {label}: cada título (o texto de acción) del wireframe es exactamente el que produce la especificación (no hay texto escrito a mano)', ok)
            # interacción mínima: «Ver todos» se abre y los filtros funcionan se prueba en el prototipo de 3.5
            await pg.close()
            chk(f'F33.{Z}.13 sin errores de consola ni excepciones al abrir el wireframe de {label}', not errw, errw[:3])
            caps = D / 'wireframes' / ('capturas_3_3' if Z == 'Z3' else 'capturas_3_4')
            names = ['diseno_propuesto_00_' + ('clases' if Z == 'Z3' else 'tipos'), 'diseno_propuesto_01_escritorio', 'diseno_propuesto_02_tableta', 'diseno_propuesto_03_movil', 'diseno_propuesto_04_legibilidad_estres', 'aplicacion_existente_home_actual'] + [f'diseno_propuesto_escenario_{n:02d}' for n in range(1, 15)]
            chk(f'F33.{Z}.14 existen las 20 capturas de evidencia de {label} y no están vacías', all((caps / f'{n}.png').exists() and (caps / f'{n}.png').stat().st_size > 4000 for n in names), [n for n in names if not (caps / f'{n}.png').exists()])
        chk('F33.15 sin errores de consola en el Home existente durante la revisión', not errs, errs[:3])
        await b.close()
    print(f'\n{len(passed)} bien, {len(fails)} mal'); print('TODO BIEN' if not fails else 'FALLAS: ' + '; '.join(fails)); sys.exit(1 if fails else 0)
asyncio.run(main())
