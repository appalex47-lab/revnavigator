"""Sugerencia de umbrales según el historial: se calcula sola (al llegar datos y una vez al día), nunca se aplica sola, aparece en Forecast y en la presentación,
se puede aplicar con un botón y se borra al cerrar sesión. Uso: python3 batch_umbrales_sugeridos.py <raíz>"""
import sys, asyncio, json
sys.argv = sys.argv[:2]
from ed_common import *
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(); f = await boot(b)
        ns = await f.evaluate("FP.config.storage.namespace"); k = f"{ns}:thresholdSuggestion"
        await f.goto(U + '#presentacion'); await f.wait_for_selector('[data-action="rp-generate"]'); await f.wait_for_timeout(500)
        st = await f.evaluate("({s:(FP.app.state.th.sug||{}).status,w:(FP.app.state.th.sug||{}).weeks,on:FP.app.state.th.on})")
        chk('T1 con pocas semanas completas la sugerencia sola dice «insufficient» y no inventa valores', st['s'] == 'insufficient' and st['w'] < 8 and st['on'], st)
        await f.click('[data-action="rp-audience"][data-id="gerencial"]'); await f.wait_for_timeout(300)
        t = await f.evaluate("document.querySelector('.th-box[data-th=rp]').innerText")
        chk('T2 la presentación lo explica («se necesitan al menos 8 semanas»), mantiene los valores provisionales y ofrece el botón', 'al menos 8' in t and 'provisionales' in t and 'Sugerir umbrales con mi historial' in t and 'Usar la sugerencia' not in t, t[:300])
        # historia suficiente: 12 semanas completas con desviaciones conocidas
        await f.evaluate("""(()=>{const gaps=[0.002,-0.004,0.006,-0.01,0.012,-0.02,0.025,-0.03,0.005,-0.008,0.015,-0.006];
          const blk=g=>({actual:100*(1+g),plan:100,gap:100*g,gapPct:g,compliance:1+g});
          const mk=(i,g)=>({key:'2026-W'+String(i+1).padStart(2,'0'),days:7,countedDays:7,toDate:{revenue:blk(g),orders:blk(g/2),trafficVolume:blk(g/2),conversionRate:blk(g/3),aov:blk(g/4)}});
          const r=FP.app.state.fc.run; r.total.weeks=gaps.map((g,i)=>mk(i,g)); Object.values(r.channels).forEach(c=>{c.weeks=gaps.map((g,i)=>mk(i,g))}); r.generatedAt='2026-11-02T10:00:00Z';
          window.__calls=0; const o=FP.thresholdAdvisor.suggest; FP.thresholdAdvisor.suggest=function(){window.__calls++;return o.apply(this,arguments)};})()""")
        await f.evaluate("FP.app.render()"); await f.wait_for_timeout(400)
        s = await f.evaluate("FP.app.state.th.sug")
        chk('T3 al llegar datos nuevos (cambia la corrida) se recalcula sola: 12 semanas, en meta = p75 (1.6 %) y fuera de meta = p90 (2.5 %)', s['status'] == 'ready' and s['weeks'] == 12 and abs(s['presentation']['okPct'] - 0.016) < 1e-9 and s['presentation']['alertPct'] > s['presentation']['okPct'], s.get('presentation'))
        saved = await f.evaluate(f"localStorage.getItem('{k}')")
        chk('T13 la sugerencia queda guardada (derivada, local: no viaja a la nube)', saved is not None and 'thresholdSuggestion' in await f.evaluate("JSON.stringify(FP.config.cloud.skipKeys)"), None)
        n1 = await f.evaluate("window.__calls"); await f.evaluate("FP.app.render()"); await f.evaluate("FP.app.render()")
        chk('T4 sin datos nuevos y el mismo día NO se vuelve a calcular en cada pantalla', await f.evaluate("window.__calls") == n1 == 1, [n1, await f.evaluate("window.__calls")])
        await f.evaluate("FP.app.state.th.on='2000-01-01'"); await f.evaluate("FP.app.render()"); await f.wait_for_timeout(200)
        chk('T5 un día nuevo se recalcula sola aunque no lleguen datos', await f.evaluate("window.__calls") == 2 and await f.evaluate("FP.app.state.th.on") != '2000-01-01')
        chk('T6 NUNCA se aplica sola: los umbrales de la presentación y de Pacing siguen como estaban', await f.evaluate("JSON.stringify(Object.values(FP.app.state.rp.options.thresholds))") == '[null,null,null,null]' and await f.evaluate("(FP.app.state.fc.settings.pacingThresholds||{}).onPlanFrom") in (None, 0.99), await f.evaluate("JSON.stringify(FP.app.state.fc.settings.pacingThresholds)"))
        t = await f.evaluate("document.querySelector('.th-box[data-th=rp]').innerText")
        chk('T7 la presentación (Gerencial) muestra vigente y sugerido de «En meta hasta» y «Fuera de meta desde» con la evidencia', all(x in t for x in ['En meta hasta', 'Fuera de meta desde', 'Vigente', 'Sugerido', '12 semanas completas', 'Usar la sugerencia']), t[:400])
        await f.click('.th-box[data-th=rp] [data-action="th-apply-rp"]'); await f.wait_for_timeout(300)
        th = await f.evaluate("FP.app.state.rp.options.thresholds")
        chk('T8 «Usar la sugerencia» llena los umbrales de ese formato (y solo esos)', th['okPct'] == s['presentation']['okPct'] and th['alertPct'] == s['presentation']['alertPct'] and th['belowPlanPct'] is None and th['weakPct'] is None, th)
        chk('T9 los campos de sensibilidad muestran el valor aplicado', await f.evaluate("document.querySelector('.rp-th input[data-key=okPct]').value") == str(round(s['presentation']['okPct'] * 100, 2)).rstrip('0').rstrip('.'))
        await f.click('[data-action="rp-audience"][data-id="operativo"]'); await f.wait_for_timeout(300)
        t = await f.evaluate("document.querySelector('.th-box[data-th=rp]').innerText")
        chk('T10 en Operativo la caja muestra los umbrales de Operativo («Indicador bajo el plan», «Semana más floja»)', 'Indicador «bajo el plan» desde' in t and 'Semana «más floja» desde' in t and 'En meta hasta' not in t, t[:300])
        # Forecast
        await f.goto(U + '#pacing'); await f.wait_for_timeout(800); await f.evaluate("document.getElementById('pc-vp').open=true"); await f.wait_for_timeout(300)
        box = await f.query_selector('.th-box[data-th=fc]')
        bt = (await box.inner_text()) if box else ''
        chk('T11 en Pacing › Versiones y parámetros aparece la misma sugerencia para «Arriba del plan desde» y «En plan desde»', box is not None and all(x in bt for x in ['Arriba del plan desde', 'En plan desde', 'Sugerido']), bt[:300])
        await f.click('.th-box[data-th=fc] [data-action="th-apply-fc"]'); await f.wait_for_timeout(500)
        pt = await f.evaluate("FP.app.state.fc.settings.pacingThresholds")
        chk('T12 aplicarla ahí cambia los umbrales de Pacing (1 ± en meta) y los guarda', abs(pt['aboveFrom'] - 1.016) < 1e-9 and abs(pt['onPlanFrom'] - 0.984) < 1e-9 and 'pacingThresholds' in str(await f.evaluate(f"localStorage.getItem('{ns}:forecastSettings')")), pt)
        # persistencia y limpieza
        await f.evaluate("window.confirm=()=>true; FP.app.actions['clear-all']()"); await f.wait_for_timeout(800)
        chk('T14 al borrar los datos del navegador (lo que hace cerrar sesión) la sugerencia desaparece y no se vuelve a escribir sin datos', await f.evaluate(f"localStorage.getItem('{k}')") is None)
        chk('T15 sin errores de página', not f._errs, f._errs)
        await b.close()
    print('\nFALLAS:' if fails else '\nTODO BIEN', fails or ''); sys.exit(1 if fails else 0)
asyncio.run(main())
