"""Presentation Intelligence · Fase 8 — lámina de escenarios y anexos «Reglas y umbrales» y «Ediciones e IA» con datos reales de la herramienta.
Uso: python3 batch_report_escenarios.py <raíz>"""
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
GEO = """(id)=>{const r=FP.app.state.rp.report,h=FP.reportView.mountPrint(r,{exclude:FP.app.state.rp.exclude,tags:true,sel:FP.reportSetupView.selectionOf(FP.app.state.rp),edits:FP.app.state.rp.edits});h.style.cssText='display:block;position:absolute;left:0;top:0;visibility:hidden';
  const pg=h.querySelector('.rp-page[data-page="'+id+'"]');if(!pg){h.remove();return null}const b=pg.getBoundingClientRect();const small=[...pg.querySelectorAll('*')].filter(e=>[...e.childNodes].some(n=>n.nodeType===3&&n.textContent.trim())&&parseFloat(getComputedStyle(e).fontSize)<13.3).length;
  const o={w:Math.round(b.width),h:Math.round(b.height),ov:pg.getAttribute('data-overflow'),wide:[...pg.querySelectorAll('table')].filter(t=>t.getBoundingClientRect().right>b.right+1).length,small};
  h.remove();document.getElementById('rp-print-style')&&document.getElementById('rp-print-style').remove();document.body.classList.remove('rp-printing');return o}"""
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(); f = await new_page(b, 1280, 900)
        await f.add_init_script("document.addEventListener('DOMContentLoaded',()=>{const s=document.createElement('style');s.textContent='#tour-offer{display:none!important}';document.head.appendChild(s)})")
        await load_products(f, U); await prepare(f, U)
        await f.goto(U + '#presentacion'); await f.wait_for_selector('[data-action="rp-generate"]')
        await f.click('[data-action="rp-audience"][data-id="gerencial"]'); await f.wait_for_timeout(300)
        await f.click('[data-action="rp-depth"][data-id="detallado"]'); await f.wait_for_timeout(300)
        chk('N1 se genera sin error', await gen(f) == 'ready', await f.evaluate("FP.app.state.rp.error"))
        sc = await f.evaluate("(FP.app.state.rp.report.pages.find(p=>p.id==='scenarios')||{})")
        chk('N2 la lámina de escenarios trae los escenarios guardados con supuestos y cambio simulado tomados del motor (no vacíos)', sc.get('status') == 'included' and len(sc['rows']) >= 1 and all(r['assumption'] and len(r['assumption']) <= 110 for r in sc['rows']), {k: sc.get(k) for k in ('status', 'reason')} | {'rows': [(r['name'], r['impact'], r['recovery'], (r['assumption'] or '')[:50]) for r in sc.get('rows', [])]})
        chk('N3 el supuesto principal es el texto del motor de escenarios («Base de días no cerrados…»)', all('forecast' in (r['assumption'] or '') or 'días' in (r['assumption'] or '') for r in sc.get('rows', [])), [r['assumption'] for r in sc.get('rows', [])])
        prev = await f.evaluate(PAGES)
        chk('N4 Gerencial · Detallado: escenarios después de oportunidades y el anexo de reglas antes del anexo técnico; sin anexo de ediciones (no hay ediciones)', 'scenarios' in prev and prev.index('opportunities') < prev.index('scenarios') and 'annexRules' in prev and 'annexEdits' not in prev, prev)
        t = await f.evaluate(TXT('scenarios'))
        chk('N5 la lámina muestra Estimado, «% de la brecha», el aviso de supuestos y aclara que son venta y no utilidad', all(k in t for k in ['Estimado', '% de la brecha', 'Revisa los supuestos', 'no hay costos ni márgenes', 'Supuesto principal']), t[:300])
        chk('N6 con un impacto enorme sobre una brecha chica se lee «Supera la brecha», no un número gigante', 'Supera la brecha' in t and not any(x in t for x in ['00.0 %', ',000']), t[:400])
        chk('N7 sin «null», «undefined» ni «NaN»', not any(w in t for w in ['null', 'undefined', 'NaN']))
        for pg in ('scenarios', 'annexRules'):
            g = await f.evaluate(f"({GEO})('{pg}')")
            chk(f'N8 en impresión «{pg}» es 1122×630, sin desborde, texto ≥ 13.4 px', g and g['w'] == 1122 and g['h'] == 630 and g['ov'] is None and g['wide'] == 0 and g['small'] == 0, g)
        r = await f.evaluate(TXT('annexRules'))
        chk('N9 el anexo de reglas lista umbrales con su origen, los sellos y los límites', all(k in r for k in ['Valor provisional', 'Observado', 'Calculado', 'Estimado', 'no es la meta del cierre', 'Canal «en meta»']), r[:300])
        # cambiar un umbral -> origen
        await f.fill('.rp-th input[data-key="alertPct"]', '8'); await f.dispatch_event('.rp-th input[data-key="alertPct"]', 'change'); await f.wait_for_timeout(300); await gen(f)
        chk('N10 un umbral cambiado por la persona sale como «Cambiado por la persona»', 'Cambiado por la persona' in await f.evaluate(TXT('annexRules')))
        # editar -> anexo de ediciones
        await f.click('#rp-prop button[data-action="rp-edit-open"][data-id="pacing"]'); await f.wait_for_timeout(200)
        await f.fill('#rp-ed-note', 'Revisar con Ventas.'); await f.dispatch_event('#rp-ed-note', 'change'); await f.wait_for_timeout(300)
        prev = await f.evaluate(PAGES)
        chk('N11 al editar una lámina aparece el anexo «Ediciones e IA» justo después del de reglas, sin volver a generar', 'annexEdits' in prev and prev.index('annexRules') + 1 == prev.index('annexEdits'), prev)
        e = await f.evaluate(TXT('annexEdits'))
        chk('N12 el anexo de ediciones lista la lámina, la nota de la persona y aclara que no cambia cifras', all(k in e for k in ['Pacing', 'Revisar con Ventas.', 'Ninguna edición cambia una cifra']), e[:300])
        g = await f.evaluate(f"({GEO})('annexEdits')")
        chk('N13 el anexo de ediciones cabe en 16:9', g and g['w'] == 1122 and g['ov'] is None and g['wide'] == 0, g)
        chk('N14 el total del reporte no cuenta el anexo de ediciones (depende de lo editado después)', 'annexEdits' not in await f.evaluate("FP.app.state.rp.report.included"))
        await f.click('[data-action="rp-edit-reset"]'); await f.wait_for_timeout(300)
        chk('N15 al restaurar la edición el anexo vuelve a salir de la presentación', 'annexEdits' not in await f.evaluate(PAGES))
        # Directivo: apagados por defecto
        await f.click('[data-action="rp-audience"][data-id="directivo"]'); await f.wait_for_timeout(300)
        await f.click('[data-action="rp-depth"][data-id="detallado"]'); await f.wait_for_timeout(300); await gen(f)
        prev = await f.evaluate(PAGES)
        chk('N16 Directivo · Detallado: escenarios sí; los anexos nuevos apagados por defecto (se pueden agregar con la casilla)', 'scenarios' in prev and 'annexRules' not in prev and await f.query_selector('#rp-offlist input[data-id="annexRules"]') is not None, prev)
        # reporte actual intacto
        await f.click('[data-action="rp-audience"][data-id="actual"]'); await f.wait_for_timeout(300); await gen(f)
        prev = await f.evaluate(PAGES)
        chk('N17 el reporte actual no trae escenarios ni anexos nuevos', not ({'scenarios', 'annexRules', 'annexEdits'} & set(prev)), prev)
        chk('N18 sin errores de página', not f._errs, f._errs)
        await b.close()
    print('\nFALLAS:' if fails else '\nTODO BIEN', fails or ''); sys.exit(1 if fails else 0)
asyncio.run(main())
