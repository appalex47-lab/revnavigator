"""Presentation Intelligence · embudo de fichas de producto (Operativo) con datos que entran por el mismo camino de importación que un archivo GA4 real
(FP.mockProducts → FP.productImport → FP.productStore): la lámina se arma con lo que leyó el almacén, no con cifras inyectadas.
Uso: python3 batch_report_funnel.py <raíz>"""
import sys, asyncio
sys.argv = sys.argv[:2]
from ed_common import *
PAGES = "[...document.querySelectorAll('#view-presentacion .rp-frame .rp-page')].map(p=>p.dataset.page)"
TXT = lambda pg: "(document.querySelector('#view-presentacion .rp-page[data-page=\"" + pg + "\"]')||{textContent:''}).textContent.replace(/\\s+/g,' ')"
async def gen(f):
    await f.click('[data-action="rp-generate"]'); await f.wait_for_timeout(200)
    if await f.query_selector('[data-action="rp-gap-go"]'): await f.click('[data-action="rp-gap-go"]')
    await f.wait_for_function("FP.app.state.rp.status==='ready'||FP.app.state.rp.status==='error'", timeout=120000)
    return await f.evaluate("FP.app.state.rp.status")
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(); f = await boot(b)
        # venta + embudo por el camino real de importación (periodo: ago–sep 2026, mismos canales que el ejemplo)
        r = await f.evaluate("""(async()=>{const gen=FP.mockProducts.generate({from:'2026-07-01',to:'2026-09-30',skus:48,channels:['ecommerce','app']});
          const kinds=await FP.productStore.listBatches().then(b=>b.map(x=>x.fileName));
          const r2=await FP.productImport.process(FP.productImport.stage(gen.funnel,{fileName:'GA4_funnel.csv',kind:'funnel'}),{});
          await FP.productStore.commit(r2.draft,{fileName:'GA4_funnel.csv'});
          return {before:kinds, after:(await FP.productStore.listBatches()).map(x=>x.fileName), funnelRows:gen.funnel.length||null}})()""")
        chk('F0 el embudo entra por el importador real y queda en el almacén', 'GA4_funnel.csv' in r['after'], r)
        await f.goto(U + '#presentacion'); await f.wait_for_selector('[data-action="rp-generate"]')
        await f.click('[data-action="rp-audience"][data-id="operativo"]'); await f.wait_for_timeout(300)
        chk('F1 se genera sin error', await gen(f) == 'ready', await f.evaluate("FP.app.state.rp.error"))
        pg = await f.evaluate("(FP.app.state.rp.report.pages.find(p=>p.id==='funnel')||{})")
        chk('F2 la lámina de embudo se arma con los datos del almacén (4 pasos, tasas finitas, referencia)', pg.get('status') == 'included' and [s['id'] for s in pg.get('steps', [])] == ['views', 'cart', 'checkout', 'purchase'] and all(isinstance(s['cur'], (int, float)) for s in pg['steps']), {k: pg.get(k) for k in ('status', 'reason', 'conclusion')})
        if pg.get('status') == 'included':
            rates = [s['rateCur'] for s in pg['steps'][1:]]
            chk('F3 las tasas de cada paso están entre 0 y 1 (embudo coherente: cada paso ≤ el anterior)', all(isinstance(x, (int, float)) and 0 <= x <= 1 for x in rates) and all(pg['steps'][i]['cur'] <= pg['steps'][i - 1]['cur'] for i in range(1, 4)), [(s['id'], s['cur']) for s in pg['steps']])
            t = await f.evaluate(TXT('funnel'))
            chk('F4 la lámina dice que las compras son de GA4 (artículos), no pedidos, y muestra el paso más débil o la conversión de ficha', 'no pedidos' in t and ('más débil' in t or 'conversión de ficha' in t.lower()), t[:300])
            chk('F5 sin «null», «undefined» ni «NaN»', not any(w in t for w in ['null', 'undefined', 'NaN']), t[:200])
            g = await f.evaluate("""(()=>{const r=FP.app.state.rp.report,h=FP.reportView.mountPrint(r,{exclude:FP.app.state.rp.exclude,tags:true,sel:FP.reportSetupView.selectionOf(FP.app.state.rp),edits:FP.app.state.rp.edits});h.style.cssText='display:block;position:absolute;left:0;top:0;visibility:hidden';
              const pg=h.querySelector('.rp-page[data-page="funnel"]');const b=pg.getBoundingClientRect();const o={w:Math.round(b.width),h:Math.round(b.height),ov:pg.getAttribute('data-overflow'),wide:[...pg.querySelectorAll('table')].filter(t=>t.getBoundingClientRect().right>b.right+1).length};
              h.remove();document.getElementById('rp-print-style')&&document.getElementById('rp-print-style').remove();document.body.classList.remove('rp-printing');return o})()""")
            chk('F6 en impresión cabe en 16:9 con datos reales de importación', g['w'] == 1122 and g['h'] == 630 and g['ov'] is None and g['wide'] == 0, g)
        chk('F7 sin errores de página', not f._errs, f._errs)
        await b.close()
    print('\nFALLAS:' if fails else '\nTODO BIEN', fails or ''); sys.exit(1 if fails else 0)
asyncio.run(main())
