"""Command Center · Fase 3 · Subfase 3.1 — validación de la AUDITORÍA del Home y de la MATRIZ UX ↔ motores contra el código y la aplicación reales.
No cambia nada de la aplicación: solo lee. Comprueba (1) que cada fuente declarada en docs/command-center/generated/MATRIZ_UX_MOTORES.json existe (o no)
según su estado, (2) los hechos de la auditoría (qué consume y qué no consume el Home), (3) que el Home renderiza sin errores en 3 anchos y 3 estados,
sin desbordamiento horizontal de página. Las capturas son de Chromium emulado: NO sustituyen una prueba en un dispositivo móvil real.
Uso: python3 run_batch.py batch_fase3_1_home_auditoria.py <raíz>"""
import sys, asyncio, json, re, pathlib
ROOT = sys.argv[1]; sys.argv = sys.argv[:2]
from ed_common import *
R = pathlib.Path(ROOT)
MAT = json.loads((R / 'docs/command-center/generated/MATRIZ_UX_MOTORES.json').read_text())
HOME_FILES = ['js/ui/guidance/home-view.js', 'js/ui/guidance/home-resumen.js', 'js/ui/guidance/home-summary-view.js', 'js/ui/guidance/attention-view.js', 'js/analytics/homeSummaryEngine.js', 'js/analytics/attentionEngine.js']
SRC = {f: (R / f).read_text() for f in HOME_FILES}
EXISTS = "(p=>{let o=window; for(const k of p.split('.')){ if(o==null||!(k in Object(o))) return false; o=o[k]} return o!==undefined})"
OVER = r"""(()=>{const w=document.documentElement.clientWidth, bad=[]; const scrolls=(e)=>{for(let p=e.parentElement;p&&p!==document.body;p=p.parentElement){const o=getComputedStyle(p).overflowX; if(o==='auto'||o==='scroll'||o==='hidden') return true} return false};
  document.querySelectorAll('#home *').forEach(e=>{const r=e.getBoundingClientRect(); if(r.width>0&&r.right>w+1&&!scrolls(e)) bad.push((e.className&&e.className.baseVal===undefined?e.className:e.tagName)+'')});
  return {sw:document.documentElement.scrollWidth,cw:w,bad:bad.slice(0,5)}})()"""
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch()
        # ---- 1. la matriz contra el código real ----
        q = await boot(b, patch=True)
        errs = []; q.on('pageerror', lambda e: errs.append(str(e))); q.on('console', lambda m: errs.append(m.text) if m.type == 'error' else None)
        await q.evaluate("(()=>{const S=FP.app.state; FP.dataStore.records(S.store,'actual').forEach(r=>{ if(r.channel==='ecommerce'){ ['revenue','orders'].forEach(k=>{ if(r.metrics[k]&&typeof r.metrics[k].value==='number') r.metrics[k].value*=0.88 }) } }); S.fc.run=null; S.rf.run=null; S.dx.run=null})()")
        await q.goto(U + '#inicio'); await q.wait_for_timeout(2500)
        rows = MAT['filas']
        chk('F31.0 la matriz (versión 2) declara 33 filas con estados válidos y sin ids repetidos', len(rows) == 33 and len({r['id'] for r in rows}) == 33 and all(r['estado'] in MAT['estados'] for r in rows))
        ex = await q.evaluate(f"(() => {{ const ex = {EXISTS}; const out = {{}}; {json.dumps([m for r in rows for m in r['motores']])}.forEach(m => out[m] = ex(m)); return out }})()")
        for r in rows:
            if r['estado'] in ('Disponible', 'Parcial'):
                miss = [m for m in r['motores'] if not ex[m]]
                chk(f'F31.1 {r["id"]} ({r["estado"]}) {r["elemento"][:48]}: todas sus fuentes existen en la aplicación', r['motores'] and not miss, miss)
            else:
                spec = r.get('especificacion', '').split(' · ')[0]
                chk(f'F31.2 {r["id"]} (Por desarrollar) {r["elemento"][:44]}: no hay implementación en js/ y la especificación existe', spec and (R / spec).exists() and not r['motores'], spec)
        # Fase 4.1 (P-05): los contratos portados viven SOLO en js/commandCenter/ (preparados, no consumidos). Ningún otro módulo de la aplicación los define ni los usa,
        # (classifyBusinessState se porta después a js/commandCenter/businessState.js en 4.2, sin consumidores).
        js_app = '\n'.join(f.read_text() for f in (R / 'js').rglob('*.js') if 'commandCenter' not in f.parts)
        chk('F31.3 «Por desarrollar» → preparado en 4.1/4.2: classifyBusinessState, mergeFindings y cc.finding NO existen en la aplicación fuera de js/commandCenter/ (contratos portados, aún sin consumidores en vistas)', 'classifyBusinessState' not in js_app and 'mergeFindings' not in js_app and "'cc.finding'" not in js_app)
        # ---- 2. hechos de la auditoría ----
        used = lambda pat: [f for f, s in SRC.items() if re.search(pat, s)]
        for name, pat in [('temporalEngine', r'temporalEngine'), ('trendEngine', r'trendEngine'), ('patternEngine', r'patternEngine'), ('shareMixEngine', r'shareMixEngine'), ('forecastConfidence', r'forecastConfidence'),
                          ('FP.economics', r'FP\.economics'), ('riskOpportunityEngine', r'riskOpportunityEngine'), ('actionPriorityEngine', r'actionPriorityEngine'), ('scenarioEngine/recoveryEngine', r'FP\.(scenarioEngine|recoveryEngine)')]:
            chk(f'F31.4 el Home NO consume {name} (la matriz lo declara «no conectado»)', not used(pat), used(pat))
        outside = [str(f.relative_to(R)) for f in (R / 'js').rglob('*.js') if 'riskOpportunityEngine' in f.read_text() and f.name != 'riskOpportunityEngine.js']
        chk('F31.5 riskOpportunityEngine existe pero ningún otro archivo de js/ lo usa (sin uso en producción)', not [o for o in outside if 'self-test' not in o], outside)
        kinds = sorted(set(re.findall(r"kind: '([a-z_]+)'", SRC['js/analytics/attentionEngine.js'])))
        chk('F31.6 attentionEngine solo emite los tipos gap, driver, forecast, channel, data y followup (ninguno es riesgo ni oportunidad)', kinds == ['channel', 'data', 'driver', 'followup', 'forecast', 'gap'], kinds)
        # ---- 3. estructura medida del Home (datos con desviación, escritorio) ----
        await q.set_viewport_size({'width': 1280, 'height': 900}); await q.wait_for_timeout(300)
        m = await q.evaluate(r"""(()=>{const h=document.getElementById('home'); const det=[...h.querySelectorAll('details')]; const why=det.find(d=>/¿Por qué va así\?/.test(d.innerText)); const ch=h.querySelector('.home-cols__c');
          const bn=(document.body.innerText.match(/Analista encontr[óo] (\d+) cosa/)||[])[1]; const ve=(h.innerText.match(/Hay (\d+) cosas? que revisar/)||[])[1]; const por=(h.innerText.match(/(\d+) hallazgos?/)||[])[1];
          return {words:h.innerText.split(/\s+/).filter(Boolean).length, details:det.length, closed:det.filter(d=>!d.open).length, whyOpen:why?why.open:null, verdict:!!h.querySelector('[data-home-verdict]'), chTop:ch?Math.round(ch.getBoundingClientRect().top+scrollY):null, vh:innerHeight,
            analyst:bn?+bn:null, verdictN:ve?+ve:null, porRevisar:por?+por:null, pageH:document.documentElement.scrollHeight}})()""")
        chk('F31.7 el Home tiene veredicto, ≥ 10 plegables y casi todos cerrados por defecto', m['verdict'] and m['details'] >= 10 and m['closed'] >= m['details'] - 1, m)
        chk('F31.8 la explicación del desempeño («¿Por qué va así?») está en un plegable cerrado y la tabla por canal queda bajo el primer pantallazo (900 px)', m['whyOpen'] is False and m['chTop'] is not None and m['chTop'] > m['vh'], m)
        chk('F31.9 conteos de hallazgos distintos entre motores: banner del Analista vs «Hay N cosas que revisar» (problema documentado)', m['analyst'] is not None and m['verdictN'] is not None and m['analyst'] != m['verdictN'], m)
        chk('F31.10 texto visible por defecto entre 400 y 1000 palabras; la página mide más de 2 800 px en escritorio', 400 <= m['words'] <= 1000 and m['pageH'] > 2800, m)
        # ---- 4. render por ancho y estado, sin errores ni desbordamiento ----
        for w, h_, nm in [(1280, 900, 'escritorio'), (768, 1024, 'tableta'), (390, 844, 'móvil emulado')]:
            await q.set_viewport_size({'width': w, 'height': h_}); await q.wait_for_timeout(500)
            ok = await q.evaluate("document.getElementById('home').innerText.length>500"); ov = await q.evaluate(OVER)
            chk(f'F31.11 Home con datos desviados a {w} px ({nm}): renderiza, sin desbordamiento horizontal de página', ok and ov['sw'] <= ov['cw'] + 1 and not ov['bad'], ov)
        await q.set_viewport_size({'width': 1280, 'height': 900})
        chk('F31.12 sin errores de consola ni excepciones en los flujos del Home con datos', not errs, errs[:3])
        await q.close()
        # estado vacío (sin datos) en los tres anchos
        q2 = await new_page(b, 1280, 900); errs2 = []; q2.on('pageerror', lambda e: errs2.append(str(e))); q2.on('console', lambda m_: errs2.append(m_.text) if m_.type == 'error' else None)
        await q2.goto(U + '#inicio'); await q2.wait_for_selector('#home'); await q2.wait_for_timeout(1200)
        for w, h_, nm in [(1280, 900, 'escritorio'), (768, 1024, 'tableta'), (390, 844, 'móvil emulado')]:
            await q2.set_viewport_size({'width': w, 'height': h_}); await q2.wait_for_timeout(400)
            t = await q2.evaluate("document.getElementById('home').innerText"); ov = await q2.evaluate(OVER)
            chk(f'F31.13 Home vacío a {w} px ({nm}): explica qué falta y ofrece el paso, sin desbordamiento', 'Cargar datos' in t and ov['sw'] <= ov['cw'] + 1 and not ov['bad'], [t[:80], ov])
        chk('F31.14 sin errores de consola en el estado vacío', not errs2, errs2[:3])
        await b.close()
    print(f'\n{len(passed)} bien, {len(fails)} mal'); print('TODO BIEN' if not fails else 'FALLAS: ' + '; '.join(fails)); sys.exit(1 if fails else 0)
asyncio.run(main())
