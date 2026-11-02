"""Presentation Intelligence · Fase 4 — formato Gerencial en la pantalla real (selección, semáforo por canal, profundidades, umbrales, impresión 16:9).
Uso: python3 batch_report_gerencial.py <raíz>"""
import sys, asyncio
sys.argv = sys.argv[:2]
from ed_common import *
from recovery_state import prepare
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
        await f.click('[data-action="rp-audience"][data-id="gerencial"]'); await f.wait_for_timeout(300)
        st = await f.evaluate("({a:FP.app.state.rp.audience,d:FP.app.state.rp.depth,s:FP.app.state.rp.status})")
        chk('G1 elegir Gerencial pone la profundidad Ejecutivo y pide generar de nuevo', st == {'a': 'gerencial', 'd': 'ejecutivo', 's': 'idle'}, st)
        chk('G2 aparece la sensibilidad del formato Gerencial con los valores provisionales como ejemplo (1 y 5)', await f.evaluate("[...document.querySelectorAll('.rp-th input')].map(i=>i.dataset.key+'='+i.placeholder).join()") == 'okPct=1,alertPct=5')
        chk('G3 se genera sin error', await gen(f) == 'ready', await f.evaluate("FP.app.state.rp.error"))
        prev = await f.evaluate(PAGES)
        chk('G4 la vista previa trae «Cumplimiento por canal» después del pacing y no trae las láminas de Operativo', 'channelScorecard' in prev and prev.index('pacing') < prev.index('channelScorecard') and not ({'channelPacing', 'evolution', 'funnel', 'actions'} & set(prev)), prev)
        txt = await f.evaluate("(document.querySelector('#view-presentacion .rp-page[data-page=\"channelScorecard\"]')||{textContent:''}).textContent.replace(/\\s+/g,' ')")
        chk('G5 la lámina muestra canales, plan a la fecha, brecha, estado con palabra y las notas de umbrales', all(k in txt for k in ['Venta real', 'Plan a la fecha', 'Brecha', 'Estado', 'Total digital']) and any(k in txt for k in ['En meta', 'En seguimiento', 'Fuera de meta']) and 'provisionales' in txt, txt[:300])
        chk('G6 cada estado lleva símbolo y palabra (no solo color)', await f.evaluate("[...document.querySelectorAll('#view-presentacion .rp-page[data-page=\"channelScorecard\"] tbody .rp-sem')].every(e=>/^[●▲■]\\s+\\S+/.test(e.textContent.trim()))"))
        chk('G7 sin «null», «undefined» ni «NaN» en la lámina', not any(w in txt for w in ['null', 'undefined', 'NaN']), txt[:200])
        geo = await f.evaluate("""(()=>{const r=FP.app.state.rp.report,h=FP.reportView.mountPrint(r,{exclude:[],tags:true,sel:FP.reportSetupView.selectionOf(FP.app.state.rp)});h.style.cssText='display:block;position:absolute;left:0;top:0;visibility:hidden';
          const pg=h.querySelector('.rp-page[data-page="channelScorecard"]');const b=pg.getBoundingClientRect();const small=[...pg.querySelectorAll('*')].filter(e=>[...e.childNodes].some(n=>n.nodeType===3&&n.textContent.trim())&&parseFloat(getComputedStyle(e).fontSize)<13.3).length;
          const o={w:Math.round(b.width),h:Math.round(b.height),ov:pg.getAttribute('data-overflow'),wide:[...pg.querySelectorAll('table')].filter(t=>t.getBoundingClientRect().right>b.right+1).length,small};
          h.remove();document.getElementById('rp-print-style')&&document.getElementById('rp-print-style').remove();document.body.classList.remove('rp-printing');return o})()""")
        chk('G8 en impresión la lámina es 1122×630, sin desborde, con texto ≥ 13.4 px', geo['w'] == 1122 and geo['h'] == 630 and geo['ov'] is None and geo['wide'] == 0 and geo['small'] == 0, geo)
        tt = await f.evaluate("(document.querySelector('#view-presentacion .rp-page[data-page=\"pacing\"] .rp-title')||{textContent:''}).textContent")
        chk('G4a el titular de Pacing en Gerencial usa la voz del formato («Vamos al … del plan a la fecha: N de M canales en meta»)', tt.startswith('Vamos al ') and 'canales en meta' in tt, tt)
        chk('G4b la vista previa de Gerencial trae «Oportunidades priorizadas» después del semáforo', 'opportunities' in prev and prev.index('channelScorecard') < prev.index('opportunities'), prev)
        ot = await f.evaluate("(document.querySelector('#view-presentacion .rp-page[data-page=\"opportunities\"]')||{textContent:''}).textContent.replace(/\\s+/g,' ')")
        chk('G4c la lámina muestra brecha (Observado), acciones (Estimado), «Por asignar» y aclara que es venta, sin margen, ROI, ROAS ni CAC', all(k in ot for k in ['Dónde está la brecha', 'Qué se puede recuperar', 'Observado', 'Estimado', 'Impacto simulado', 'venta, no utilidad', 'ROAS']), ot[:300])
        chk('G4e con un impacto simulado mayor que la brecha la lámina avisa «Revisa los supuestos» y marca la acción', 'Revisa los supuestos' in ot and await f.evaluate("!!document.querySelector('#view-presentacion .rp-page[data-page=\"opportunities\"] .rp-warnmark')"), ot[-300:])
        g3 = await f.evaluate('''(()=>{const r=FP.app.state.rp.report,h=FP.reportView.mountPrint(r,{exclude:[],tags:true,sel:FP.reportSetupView.selectionOf(FP.app.state.rp)});h.style.cssText='display:block;position:absolute;left:0;top:0;visibility:hidden';
          const pg=h.querySelector('.rp-page[data-page="opportunities"]');const b=pg.getBoundingClientRect();const small=[...pg.querySelectorAll('*')].filter(e=>[...e.childNodes].some(n=>n.nodeType===3&&n.textContent.trim())&&parseFloat(getComputedStyle(e).fontSize)<13.3).length;
          const o={w:Math.round(b.width),h:Math.round(b.height),ov:pg.getAttribute('data-overflow'),wide:[...pg.querySelectorAll('table')].filter(t=>t.getBoundingClientRect().right>b.right+1).length,small};
          h.remove();document.getElementById('rp-print-style')&&document.getElementById('rp-print-style').remove();document.body.classList.remove('rp-printing');return o})()''')
        chk('G4d en impresión la lámina de oportunidades es 1122×630, sin desborde, con texto ≥ 13.4 px', g3['w'] == 1122 and g3['h'] == 630 and g3['ov'] is None and g3['wide'] == 0 and g3['small'] == 0, g3)
        cover = await f.evaluate("(document.querySelector('#view-presentacion .rp-page[data-page=\"cover\"]')||{textContent:''}).textContent")
        chk('G9 la portada dice «Reporte gerencial»', 'Reporte gerencial' in cover, cover[:120])
        for d, want in (('resumen', ['cover', 'summary', 'drivers', 'closing', 'decisions']),):
            await f.click(f'[data-action="rp-depth"][data-id="{d}"]'); await f.wait_for_timeout(300)
            got = await f.evaluate(PAGES); chk(f'G10 profundidad {d}: ' + ', '.join(want), got == want, got)
        await f.click('[data-action="rp-depth"][data-id="ejecutivo"]'); await f.wait_for_timeout(300)
        # umbrales
        await f.fill('.rp-th input[data-key="alertPct"]', '0.5'); await f.dispatch_event('.rp-th input[data-key="alertPct"]', 'change'); await f.wait_for_timeout(300)
        chk('G11 cambiar un umbral lo guarda', await f.evaluate("FP.app.state.rp.options.thresholds.alertPct") == 0.005)
        await gen(f); lim = await f.evaluate("FP.app.state.rp.report.pages.find(p=>p.id==='channelScorecard').limits")
        chk('G12 un umbral de «fuera de meta» menor que el de «en meta» es inconsistente: se usan los provisionales y se avisa en la lámina', lim['okPct'] == 0.01 and lim['alertPct'] == 0.05 and 'no eran consistentes' in await f.evaluate("FP.app.state.rp.report.pages.find(p=>p.id==='channelScorecard').notes.join(' ')"), lim)
        await f.fill('.rp-th input[data-key="alertPct"]', '2'); await f.dispatch_event('.rp-th input[data-key="alertPct"]', 'change'); await f.wait_for_timeout(300); await gen(f)
        lim = await f.evaluate("FP.app.state.rp.report.pages.find(p=>p.id==='channelScorecard').limits")
        chk('G13 con umbrales consistentes (1 % y 2 %) rigen los de la persona', lim['alertPct'] == 0.02 and lim['okPct'] == 0.01, lim)
        await f.click('[data-action="rp-audience"][data-id="operativo"]'); await f.wait_for_timeout(300)
        chk('G14 al pasar a Operativo se muestran sus propios campos', await f.evaluate("[...document.querySelectorAll('.rp-th input')].map(i=>i.dataset.key).join()") == 'belowPlanPct,weakPct')
        chk('G15 sin errores de página', not f._errs, f._errs)
        await b.close()
    print('\nFALLAS:' if fails else '\nTODO BIEN', fails or ''); sys.exit(1 if fails else 0)
asyncio.run(main())
