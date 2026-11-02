"""Presentation Intelligence · Fase 6 — formato Directivo en la pantalla real (selección, veredicto, riesgo, perfil estricto, profundidades, impresión 16:9).
Uso: python3 batch_report_directivo.py <raíz>"""
import sys, asyncio
sys.argv = sys.argv[:2]
from ed_common import *
from recovery_state import prepare
PAGES = "[...document.querySelectorAll('#view-presentacion .rp-frame .rp-page')].map(p=>p.dataset.page)"
TXT = lambda pg: "(document.querySelector('#view-presentacion .rp-page[data-page=\"" + pg + "\"]')||{textContent:''}).textContent.replace(/\\s+/g,' ')"
async def gen(f):
    await f.click('[data-action="rp-generate"]'); await f.wait_for_timeout(200)
    if await f.query_selector('[data-action="rp-gap-go"]'): await f.click('[data-action="rp-gap-go"]')
    await f.wait_for_function("FP.app.state.rp.status==='ready'||FP.app.state.rp.status==='error'", timeout=120000)
    return await f.evaluate("FP.app.state.rp.status")
GEO = """(id)=>{const r=FP.app.state.rp.report,h=FP.reportView.mountPrint(r,{exclude:[],tags:true,sel:FP.reportSetupView.selectionOf(FP.app.state.rp)});h.style.cssText='display:block;position:absolute;left:0;top:0;visibility:hidden';
  const pg=h.querySelector('.rp-page[data-page="'+id+'"]');const b=pg.getBoundingClientRect();const small=[...pg.querySelectorAll('*')].filter(e=>[...e.childNodes].some(n=>n.nodeType===3&&n.textContent.trim())&&parseFloat(getComputedStyle(e).fontSize)<13.3).length;
  const o={w:Math.round(b.width),h:Math.round(b.height),ov:pg.getAttribute('data-overflow'),wide:[...pg.querySelectorAll('table')].filter(t=>t.getBoundingClientRect().right>b.right+1).length,small};
  h.remove();document.getElementById('rp-print-style')&&document.getElementById('rp-print-style').remove();document.body.classList.remove('rp-printing');return o}"""
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(); f = await new_page(b, 1280, 900)
        await f.add_init_script("document.addEventListener('DOMContentLoaded',()=>{const s=document.createElement('style');s.textContent='#tour-offer{display:none!important}';document.head.appendChild(s)})")
        await load_products(f, U); await prepare(f, U)
        await f.goto(U + '#presentacion'); await f.wait_for_selector('[data-action="rp-generate"]')
        await f.click('[data-action="rp-audience"][data-id="directivo"]'); await f.wait_for_timeout(300)
        st = await f.evaluate("({a:FP.app.state.rp.audience,d:FP.app.state.rp.depth,s:FP.app.state.rp.status})")
        chk('V1 elegir Directivo pone la profundidad Ejecutivo y pide generar de nuevo', st == {'a': 'directivo', 'd': 'ejecutivo', 's': 'idle'}, st)
        chk('V2 aparece la sensibilidad (la misma del semáforo de Gerencial) con los valores provisionales', await f.evaluate("[...document.querySelectorAll('.rp-th input')].map(i=>i.dataset.key+'='+i.placeholder).join()") == 'okPct=1,alertPct=5')
        chk('V3 se genera sin error', await gen(f) == 'ready', await f.evaluate("FP.app.state.rp.error"))
        prev = await f.evaluate(PAGES)
        chk('V4 Ejecutivo: portada, veredicto, riesgo y oportunidad, oportunidades priorizadas y decisiones, en ese orden', prev == ['cover', 'verdict', 'riskOpp', 'opportunities', 'decisions'], prev)
        off = await f.evaluate("[...document.querySelectorAll('#rp-offlist li')].map(l=>l.querySelector('.rp-off__t').innerText+'|'+l.querySelector('.pill').innerText)")
        chk('V5 las páginas que el formato no usa aparecen como «No es de este formato» (sin casilla para agregarlas)', any('No es de este formato' in x for x in off) and await f.evaluate("[...document.querySelectorAll('#rp-offlist li')].filter(l=>l.querySelector('.pill').innerText==='No es de este formato').every(l=>!l.querySelector('input'))"), off)
        v = await f.evaluate(TXT('verdict'))
        chk('V6 veredicto: «Canal digital», venta real, plan a la fecha y cierre estimado con sus sellos, y el alcance sin la venta total de la empresa', all(k in v for k in ['Canal digital', 'Venta real', 'Plan a la fecha', 'Cierre estimado', 'Observado', 'Estimado', 'no mide la venta total de la empresa']), v[:300])
        r = await f.evaluate(TXT('riskOpp'))
        chk('V7 riesgo y oportunidad: conteos del semáforo, quién resta y quién suma', all(k in r for k in ['en meta', 'Quién resta', 'Quién suma']), r[:300])
        chk('V8 sin «null», «undefined» ni «NaN» en las láminas nuevas', not any(w in (v + r) for w in ['null', 'undefined', 'NaN']))
        cover = await f.evaluate(TXT('cover'))
        chk('V9 la portada dice «Reporte directivo»', 'Reporte directivo' in cover, cover[:120])
        chk('V9b la portada de Directivo aclara «Canal digital · no incluye la venta total de la empresa»', 'no incluye la venta total de la empresa' in cover, cover[:200])
        chk('V9c las láminas con impacto simulado rotulan «(venta)»', 'Impacto simulado (venta)' in await f.evaluate(TXT('opportunities')))
        for pg in ('verdict', 'riskOpp'):
            g = await f.evaluate(f"({GEO})('{pg}')")
            chk(f'V10 en impresión «{pg}» es 1122×630, sin desborde, texto ≥ 13.4 px', g['w'] == 1122 and g['h'] == 630 and g['ov'] is None and g['wide'] == 0 and g['small'] == 0, g)
        for d, want in (('resumen', ['cover', 'verdict', 'decisions']), ('detallado', ['cover', 'verdict', 'riskOpp', 'opportunities', 'scenarios', 'pacing', 'movers', 'decisions'])):
            await f.click(f'[data-action="rp-depth"][data-id="{d}"]'); await f.wait_for_timeout(300)
            got = await f.evaluate(PAGES); chk(f'V11 profundidad {d}', got == want, got)
        await f.click('[data-action="rp-depth"][data-id="ejecutivo"]'); await f.wait_for_timeout(300)
        await f.click('[data-action="rp-audience"][data-id="gerencial"]'); await f.wait_for_timeout(300); await gen(f)
        chk('V12 al pasar a Gerencial no quedan láminas de Directivo', not ({'verdict', 'riskOpp'} & set(await f.evaluate(PAGES))))
        chk('V13 sin errores de página', not f._errs, f._errs)
        await b.close()
    print('\nFALLAS:' if fails else '\nTODO BIEN', fails or ''); sys.exit(1 if fails else 0)
asyncio.run(main())
