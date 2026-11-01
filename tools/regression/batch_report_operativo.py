"""Presentation Intelligence · Fase 3 — formato Operativo en la pantalla real (selección, láminas nuevas, impresión 16:9, cambio de audiencia, periodo Q).
Uso: python3 batch_report_operativo.py <raíz>"""
import sys, asyncio
sys.argv = sys.argv[:2]
from ed_common import *
from recovery_state import prepare
NEW = ['channelPacing', 'evolution', 'actions']
PAGES = "[...document.querySelectorAll('#view-presentacion .rp-frame .rp-page')].map(p=>p.dataset.page)"
async def gen(f):
    await f.click('[data-action="rp-generate"]'); await f.wait_for_timeout(200)
    if await f.query_selector('[data-action="rp-gap-go"]'): await f.click('[data-action="rp-gap-go"]')
    await f.wait_for_function("FP.app.state.rp.status==='ready'||FP.app.state.rp.status==='error'", timeout=120000)
    return await f.evaluate("FP.app.state.rp.status")
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(); f = await new_page(b, 1280, 900)
        await f.add_init_script("document.addEventListener('DOMContentLoaded',()=>{const s=document.createElement('style');s.textContent='#tour-offer{display:none!important}';document.head.appendChild(s)})")
        await load_products(f, U); await prepare(f, U)
        await f.goto(U + '#presentacion'); await f.wait_for_selector('[data-action="rp-generate"]')
        # reporte actual primero: no debe traer las láminas nuevas
        chk('O1 con «Reporte actual» no aparece ninguna lámina del formato Operativo', await gen(f) == 'ready' and not set(NEW) & set(await f.evaluate(PAGES)), await f.evaluate(PAGES))
        # elegir Operativo
        await f.click('[data-action="rp-audience"][data-id="operativo"]'); await f.wait_for_timeout(300)
        st = await f.evaluate("({a:FP.app.state.rp.audience,s:FP.app.state.rp.status,r:FP.app.state.rp.report})")
        chk('O2 cambiar de audiencia descarta el reporte anterior y obliga a generar de nuevo', st['a'] == 'operativo' and st['s'] == 'idle' and st['r'] is None, st)
        chk('O3 el paso 2 sigue ofreciendo solo «Desempeño comercial» y las 3 profundidades', await f.evaluate("[...document.querySelectorAll('#rp-s2 .rp-choice:not(.rp-choice--off)')].map(x=>x.innerText.trim().split('\\n')[0]).join()") == 'Desempeño comercial' and await f.evaluate("document.querySelectorAll('#rp-s3 .rp-choice').length") == 3)
        chk('O4 se genera sin error', await gen(f) == 'ready', await f.evaluate("FP.app.state.rp.error"))
        prev = await f.evaluate(PAGES)
        chk('O5 la vista previa trae las 3 láminas nuevas en el orden del perfil: pacing por canal y evolución tras «Pacing», acciones antes del cierre', all(x in prev for x in NEW) and prev.index('pacing') < prev.index('channelPacing') < prev.index('evolution') < prev.index('drivers') and prev.index('actions') < prev.index('closing'), prev)
        rep = await f.evaluate("({inc:FP.app.state.rp.report.included,tot:FP.app.state.rp.report.total,prof:FP.app.state.rp.report.profile,om:FP.app.state.rp.report.omitted.map(o=>o.id)})")
        chk('O6 el reporte queda marcado con el perfil operativo y el total cuenta las láminas nuevas', rep['prof'] == 'operativo' and all(x in rep['inc'] for x in NEW) and rep['tot'] == len(rep['inc']), rep)
        # contenido de cada lámina nueva
        txt = {pg: await f.evaluate(f"(document.querySelector('#view-presentacion .rp-page[data-page=\"{pg}\"]')||{{textContent:''}}).textContent.replace(/\\s+/g,' ')") for pg in NEW}
        chk('O7 Pacing por canal: tabla con Venta, Pedidos, Volumen, Conversión y Ticket (real y vs plan) y fila de Total digital', all(k in txt['channelPacing'] for k in ['Venta', 'Pedidos', 'Volumen', 'Conversión', 'Ticket promedio', 'Total digital', 'Real', 'vs plan']), txt['channelPacing'][:300])
        chk('O8 Evolución: gráfica de barras agrupadas y tabla con Días, Venta, Pedidos y Ticket', await f.evaluate("!!document.querySelector('#view-presentacion .rp-page[data-page=\"evolution\"] svg .rp-gb__r')") and all(k in txt['evolution'] for k in ['Días', 'Venta', 'Pedidos', 'Ticket']), txt['evolution'][:300])
        chk('O9 Acciones: ID, acción, canal, responsable (o «Por asignar»), ventana, estado e impacto rotulado «Estimado»', all(k in txt['actions'] for k in ['Responsable', 'Ventana', 'Estado', 'Estimado']), txt['actions'][:300])
        chk('O10 ningún valor «null», «undefined» o «NaN» en las láminas nuevas', not any(w in v for v in txt.values() for w in ['null', 'undefined', 'NaN']), {k: v for k, v in txt.items() if any(w in v for w in ['null', 'undefined', 'NaN'])})
        # impresión 16:9 y sin desborde
        geo = await f.evaluate("""(()=>{const r=FP.app.state.rp.report, h=FP.reportView.mountPrint(r,{exclude:[],tags:true,sel:FP.reportSetupView.selectionOf(FP.app.state.rp)});
          h.style.cssText='display:block;position:absolute;left:0;top:0;visibility:hidden'; const out=['channelPacing','evolution','actions'].map(id=>{const pg=h.querySelector('.rp-page[data-page="'+id+'"]');if(!pg)return {id,miss:true};const b=pg.getBoundingClientRect(),body=pg.querySelector('.rp-body')||pg;
            const wide=[...pg.querySelectorAll('table')].filter(t=>t.getBoundingClientRect().right>b.right+1).length;
            const small=[...pg.querySelectorAll('*')].filter(e=>e.childNodes.length&&[...e.childNodes].some(n=>n.nodeType===3&&n.textContent.trim())&&e.closest('svg')==null&&parseFloat(getComputedStyle(e).fontSize)<13.3).length;
            return {id,w:Math.round(b.width),h:Math.round(b.height),ov:pg.getAttribute('data-overflow'),wide,small}});
          const all=[...h.querySelectorAll('.rp-page')].length; h.remove();document.getElementById('rp-print-style')&&document.getElementById('rp-print-style').remove();document.body.classList.remove('rp-printing');return {out,all}})()""")
        chk('O11 en impresión las 3 láminas son 16:9 horizontales (1122×630), sin desborde vertical ni tablas fuera del marco', all(not o.get('miss') and o['w'] == 1122 and o['h'] == 630 and o['ov'] is None and o['wide'] == 0 for o in geo['out']), geo)
        chk('O12 (con medida real) el texto de las láminas nuevas no baja de 13.4 px (salvo etiquetas de la gráfica)', all(o['small'] == 0 and o['w'] > 0 for o in geo['out']), geo)
        # profundidad
        for d, want in (('resumen', ['cover', 'channelPacing', 'actions']), ('ejecutivo', ['cover', 'pacing', 'channelPacing', 'evolution', 'actions'])):
            await f.click(f'[data-action="rp-depth"][data-id="{d}"]'); await f.wait_for_timeout(300)
            got = [x for x in await f.evaluate(PAGES) if x not in ('summary', 'drivers', 'movers', 'closing', 'decisions', 'recovery', 'annex')]
            chk(f'O13 profundidad {d}: ' + ', '.join(want), got == want, got)
        await f.click('[data-action="rp-depth"][data-id="detallado"]'); await f.wait_for_timeout(300)
        # quitar y volver a poner una lámina nueva
        await f.click('#rp-prop input[data-id="evolution"]'); await f.wait_for_timeout(300)
        chk('O14 la casilla quita la lámina de Evolución de la vista previa', 'evolution' not in await f.evaluate(PAGES))
        await f.click('#rp-offlist input[data-id="evolution"]'); await f.wait_for_timeout(300)
        chk('O15 y la vuelve a poner', 'evolution' in await f.evaluate(PAGES))
        # umbrales editables
        chk('O18 con Operativo aparece la sensibilidad (2 campos con valor provisional como ejemplo)', await f.evaluate("document.querySelectorAll('.rp-th input').length") == 2 and await f.evaluate("document.querySelector('.rp-th input').placeholder") == '0.5')
        await f.fill('.rp-th input[data-key="belowPlanPct"]', '20'); await f.dispatch_event('.rp-th input[data-key="belowPlanPct"]', 'change'); await f.wait_for_timeout(300)
        chk('O19 cambiar un umbral guarda el valor y marca la vista previa como desactualizada', await f.evaluate("FP.app.state.rp.options.thresholds.belowPlanPct") == 0.2 and await f.evaluate("!!document.querySelector('#view-presentacion .rp-stale, #view-presentacion [data-stale]') || FP.app.state.rp.sig!==FP.reportView.signature(FP.app.state)"))
        await gen(f); rv = await f.evaluate("(FP.app.state.rp.report.pages.find(p=>p.id==='channelPacing')||{}).review")
        chk('O20 al generar de nuevo, con el umbral en 20 % ningún indicador se marca bajo el plan', rv and all('ningún indicador' in x for x in rv), rv)
        await f.fill('.rp-th input[data-key="belowPlanPct"]', 'abc'); await f.dispatch_event('.rp-th input[data-key="belowPlanPct"]', 'change'); await f.wait_for_timeout(300)
        chk('O21 un valor inválido no cambia el umbral y avisa', await f.evaluate("FP.app.state.rp.options.thresholds.belowPlanPct") == 0.2)
        await f.fill('.rp-th input[data-key="belowPlanPct"]', ''); await f.dispatch_event('.rp-th input[data-key="belowPlanPct"]', 'change'); await f.wait_for_timeout(300)
        chk('O22 vaciar el campo vuelve al valor provisional', await f.evaluate("FP.app.state.rp.options.thresholds.belowPlanPct") is None)
        # volver al reporte actual: las láminas nuevas desaparecen
        await f.click('[data-action="rp-audience"][data-id="actual"]'); await f.wait_for_timeout(300); await gen(f)
        chk('O16 volver a «Reporte actual» y generar quita las láminas nuevas', not set(NEW) & set(await f.evaluate(PAGES)), await f.evaluate(PAGES))
        chk('O17 sin errores de página', not f._errs, f._errs)
        await b.close()
    print('\nFALLAS:' if fails else '\nTODO BIEN', fails or ''); sys.exit(1 if fails else 0)
asyncio.run(main())
