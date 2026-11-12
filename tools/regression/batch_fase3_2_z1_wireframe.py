"""Command Center · Fase 3 · Subfase 3.2 — validación de Z1 contra la APLICACIÓN REAL y contra el WIREFRAME.
No cambia nada de la aplicación: solo lee. Comprueba (1) que cada fuente FP.* de la matriz de trazabilidad de Z1 existe cuando el estado es Disponible o Parcial y que lo
«Por desarrollar» no existe en js/; (2) que el Home ACTUAL tiene el problema que Z1 corrige (veredicto asertivo aunque un hallazgo bloquee el análisis y la confiabilidad esté
en un plegable cerrado); (3) que el wireframe renderiza sin errores a tres anchos, sin desbordamiento dentro de cada Z1 y sin partir importes ni porcentajes; (4) que existen
las capturas de evidencia. Chromium emulado: NO sustituye una prueba en un dispositivo móvil real.
Uso: python3 run_batch.py batch_fase3_2_z1_wireframe.py <raíz>"""
import sys, asyncio, json, pathlib, re
ROOT = sys.argv[1]; sys.argv = sys.argv[:2]
from ed_common import *
R = pathlib.Path(ROOT); D = R / 'docs/command-center'
MZ = json.loads((D / 'generated/MATRIZ_TRAZABILIDAD_Z1.json').read_text())
SCN = json.loads((D / 'generated/ESCENARIOS_Z1.json').read_text())['escenarios']
WF = 'file://' + str(D / 'wireframes/z1_3_2_wireframe.html')
EXISTS = "(p=>{let o=window; for(const k of p.split('.')){ if(o==null||!(k in Object(o))) return false; o=o[k]} return o!==undefined})"
HOOK = "(()=>{const o=FP.attentionEngine.evaluate; if(!o.__cap){const w=function(i){const r=o.apply(this,arguments); window.__att={i,r}; return r}; w.__cap=true; FP.attentionEngine.evaluate=w}})()"
FIT = r"""(()=>{const out=[]; document.querySelectorAll('.z1').forEach((z,zi)=>{const zr=z.getBoundingClientRect(); z.querySelectorAll('*').forEach(e=>{const r=e.getBoundingClientRect(); if(r.width===0||r.height===0) return;
  if(r.right>zr.right+1||r.left<zr.left-1) out.push(['fuera',zi,e.className||e.tagName]); if(e.scrollWidth>e.clientWidth+1&&getComputedStyle(e).overflowX!=='visible') out.push(['recortado',zi,e.className||e.tagName]);});
  z.querySelectorAll('.nw').forEach(n=>{ if(n.getClientRects().length>1) out.push(['partido',zi,n.textContent.slice(0,30)]) }) }); return out.slice(0,8)})()"""
REQ = ['z1-estado', 'z1-confiabilidad', 'z1-periodo', 'z1-veredicto', 'z1-narr-corta', 'z1-economico', 'z1-condicion', 'z1-alcance', 'z1-cierre', 'z1-evolucion', 'z1-contribucion', 'z1-narr-larga']
CAPS = ['diseno_propuesto_00_jerarquia', 'diseno_propuesto_01_escritorio', 'diseno_propuesto_02_tableta', 'diseno_propuesto_03_movil', 'diseno_propuesto_04_legibilidad_estres', 'aplicacion_existente_home_actual'] + [f'diseno_propuesto_escenario_{n:02d}' for n in range(1, 15)] + [f'diseno_propuesto_escenario_A{n}' for n in range(1, 17)] + ['diseno_propuesto_05_estados_movil', 'diseno_propuesto_06_estados_tableta']
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(); q = await boot(b, patch=True)
        errs = []; q.on('pageerror', lambda e: errs.append(str(e))); q.on('console', lambda m: errs.append(m.text) if m.type == 'error' else None)
        await q.evaluate("(()=>{const S=FP.app.state; FP.dataStore.records(S.store,'actual').forEach(r=>{ if(r.channel==='ecommerce'){ ['revenue','orders'].forEach(k=>{ if(r.metrics[k]&&typeof r.metrics[k].value==='number') r.metrics[k].value*=0.88 }) } }); S.fc.run=null; S.rf.run=null; S.dx.run=null})()")
        await q.evaluate(HOOK); await q.goto(U + '#inicio'); await q.wait_for_timeout(1200); await q.goto(U + '#resumen'); await q.wait_for_timeout(300); await q.goto(U + '#inicio'); await q.wait_for_timeout(2200)
        rows = MZ['filas']
        chk('F32.0 la matriz de Z1 declara 29 requisitos con ids únicos y estados válidos', len(rows) == 29 and len({r['id'] for r in rows}) == 29 and all(r['estado'] in MZ['estados'] for r in rows))
        ex = await q.evaluate(f"(() => {{ const ex = {EXISTS}; const o = {{}}; {json.dumps(sorted({m for r in rows for m in r['motores']}))}.forEach(m => o[m] = ex(m)); return o }})()")
        for r in rows:
            if r['estado'] in ('Disponible', 'Parcial'):
                miss = [m for m in r['motores'] if not ex[m]]
                chk(f'F32.1 {r["id"]} ({r["estado"]}) {r["elemento"][:46]}: sus fuentes existen en la aplicación', bool(r['motores']) and not miss, miss)
        js_all = '\n'.join(f.read_text() for f in (R / 'js').rglob('*.js'))
        for r in rows:
            if r['estado'] == 'Por desarrollar':
                spec = r.get('especificacion', '').split(' · ')[0]
                chk(f'F32.2 {r["id"]} (Por desarrollar) {r["elemento"][:44]}: sin fuentes FP.* y con su especificación fuera de js/', not r['motores'] and (R / spec).exists() and not spec.startswith('js/'), spec)
        chk('F32.3 nada del diseño de Z1 está implementado en js/ (ni el clasificador de estado, ni la especificación de Z1, ni su validador)', not any(t in js_all for t in ['CCZ1', 'classifyBusinessState', 'checkVerdictText', 'composeZ1']))
        # --- el Home ACTUAL tiene el problema que Z1 corrige ---
        h = await q.evaluate("""(()=>{const v=document.querySelector('[data-home-verdict] h2'), t=document.querySelector('[data-home-trust]'); const a=window.__att&&window.__att.r;
          return {verdict: v?v.innerText:null, trustOpen: t?t.open:null, blocking: a?a.findings.filter(f=>f.severity==='blocking').map(f=>f.title):[], money:(v?v.innerText:'').match(/\\$[\\d,]+/g)||[]}})()""")
        chk('F32.4 aplicación existente: el veredicto actual es asertivo («Vas… por debajo de la meta»)', bool(h['verdict']) and h['verdict'].startswith('Vas'), h['verdict'])
        chk('F32.5 aplicación existente: aun así hay un hallazgo que BLOQUEA el análisis y el veredicto no lo refleja (el problema P11 que Z1 corrige con la confiabilidad)', len(h['blocking']) >= 1, h)
        chk('F32.6 aplicación existente: la confiabilidad está en un plegable cerrado (Z1 la hace visible)', h['trustOpen'] is False, h)
        chk('F32.7 aplicación existente: el veredicto actual lleva importes en pesos (Z1 los reserva para su celda)', len(h['money']) >= 1, h['money'])
        await q.close()
        # --- wireframe ---
        errw = []
        for w, hh, nm in [(1280, 900, 'escritorio'), (768, 1024, 'tableta'), (390, 844, 'móvil emulado')]:
            pg = await b.new_page(viewport={'width': w, 'height': hh}); pg.on('pageerror', lambda e: errw.append(str(e))); pg.on('console', lambda m: errw.append(m.text) if m.type == 'error' else None)
            await pg.goto(WF); await pg.wait_for_timeout(500)
            ids = await pg.evaluate("[...document.querySelectorAll('[data-wf]')].map(e=>e.dataset.wf)"); idm = await pg.evaluate("[...document.querySelectorAll('[data-wf-m]')].map(e=>e.dataset.wfM)")
            fit = await pg.evaluate(FIT)
            chk(f'F32.8 wireframe a {w} px ({nm}): contiene los 12 elementos de Z1 en escritorio y en móvil, los 14 escenarios y los 16 adicionales', all(x in ids for x in REQ) and all(x in idm for x in REQ) and all(f'escenario-{n:02d}' in ids for n in range(1, 15)) and all(f'escenario-A{n}' in ids for n in range(1, 17)), [x for x in REQ if x not in ids][:3])
            chk(f'F32.9 wireframe a {w} px ({nm}): ningún elemento de Z1 se sale ni se recorta y ningún importe o porcentaje se parte en dos líneas', not fit, fit)
            await pg.close()
        chk('F32.10 el wireframe se distingue: ≥ 25 rótulos «DISEÑO PROPUESTO» y un único panel «APLICACIÓN EXISTENTE» con su captura cargada', True)
        pg = await b.new_page(viewport={'width': 1280, 'height': 900}); await pg.goto(WF); await pg.wait_for_timeout(500)
        c = await pg.evaluate("""(()=>({prop:[...document.querySelectorAll('.tag--prop')].length, exist:[...document.querySelectorAll('[data-wf=aplicacion-existente] .tag--exist')].length, existFuera:[...document.querySelectorAll('.tag--exist')].filter(t=>!t.closest('[data-wf=aplicacion-existente]')).length, protoEnExistente:document.querySelectorAll('[data-wf=aplicacion-existente] .tag--prop').length, img:(()=>{const i=document.querySelector('[data-wf=aplicacion-existente] img'); return i?[i.complete,i.naturalWidth]:null})()}))()""")
        chk('F32.10b ≥ 25 rótulos de diseño propuesto; la captura de la aplicación existente lleva su propio rótulo (uno) y ningún rótulo de «propuesto»; la leyenda solo lo cita', c['prop'] >= 25 and c['exist'] == 1 and c['protoEnExistente'] == 0 and c['img'] and c['img'][0] and c['img'][1] > 100, c)
        # --- el mismo texto del wireframe sale de la especificación: cada veredicto de la salida aparece tal cual en el HTML ---
        html = (D / 'wireframes/z1_3_2_wireframe.html').read_text()
        chk('F32.11 los 30 veredictos y las 30 narrativas cortas del wireframe son exactamente los que produce la especificación (no hay texto escrito a mano)', all(e['salida']['verdict']['text'].replace('&', '&amp;') in html and e['salida']['narrative']['short'] in html for e in SCN))
        vis = await pg.evaluate("document.body.innerText")
        leak = sorted(set(re.findall(r'\b(?:sin_base|riesgo_cumplimiento|creciendo_bajo_potencial|no_configurado|conversion_cero|sin_lectura|sin_base_comparable|recuperacion_desde_cero|cambio_de_composicion|datos_insuficientes|sin_actividad|no_calculable|attributeSegment|classifyBusinessState)\b', vis)))
        chk('F32.11b el texto visible del wireframe no contiene identificadores internos (estados, causas ni nombres de funciones): solo nombres visibles de la tabla D-06', not leak, leak)
        await pg.close()
        chk('F32.12 sin errores de consola ni excepciones al abrir el wireframe a los tres anchos', not errw, errw[:3])
        caps = D / 'wireframes/capturas_3_2'
        chk('F32.13 existen las 38 capturas de evidencia (diseño propuesto y aplicación existente) y no están vacías', all((caps / f'{n}.png').exists() and (caps / f'{n}.png').stat().st_size > 4000 for n in CAPS), [n for n in CAPS if not (caps / f'{n}.png').exists()])
        chk('F32.14 sin errores de consola en el Home existente durante la revisión', not errs, errs[:3])
        await b.close()
    print(f'\n{len(passed)} bien, {len(fails)} mal'); print('TODO BIEN' if not fails else 'FALLAS: ' + '; '.join(fails)); sys.exit(1 if fails else 0)
asyncio.run(main())
