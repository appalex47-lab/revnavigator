"""Presentation Intelligence · Fase 0 — LÍNEA BASE («golden») del reporte actual.
Congela, en 4 escenarios deterministas (reloj fijo), TODO lo que hoy produce el generador: la entrada que recibe reportBuilder.build (solo su forma),
el reporte completo (páginas, orden, títulos, textos, tablas, gráficos, sellos, omisiones y anexos) y el renderizado final (texto de cada lámina,
cantidad de gráficos y tablas). El perfil LEGACY del compositor nuevo debe reproducir esto sin una sola diferencia.

  python3 batch_report_golden.py <raíz>            compara contra tools/regression/data/report_golden.json
  UPDATE=1 python3 batch_report_golden.py <raíz>   reescribe la línea base (solo con una diferencia identificada y justificada)
"""
import sys, os, asyncio, json
from ed_common import *
ROOT = os.path.abspath(sys.argv[1]); GOLD = os.path.join(ROOT, 'tools/regression/data/report_golden.json')
CAP = """(()=>{
  const strip=(v)=>JSON.parse(JSON.stringify(v,(k,val)=>(k==='generatedAt'||k==='app')?undefined:val));
  const r=FP.app.state.rp.report, inp=window.__edIn||{};
  FP.reportView.mountPrint(r,{exclude:[],tags:true,sel:(window.__sel||undefined)});
  const host=document.getElementById('rp-print-host');
  const pages=[...host.querySelectorAll('.rp-page')].map(p=>({page:p.dataset.page,title:((p.querySelector('.rp-title')||{}).textContent||'').trim(),text:p.textContent.replace(/\\s+/g,' ').trim(),svgs:p.querySelectorAll('svg').length,tables:p.querySelectorAll('table').length}));
  host.remove(); const st=document.getElementById('rp-print-style'); if(st)st.remove(); document.body.classList.remove('rp-printing');
  return {status:FP.app.state.rp.status,exclude:FP.app.state.rp.exclude.slice(),srcShape:Object.keys(inp).sort().map(k=>k+':'+(Array.isArray(inp[k])?'array':inp[k]===null?'null':typeof inp[k])),
    report:strip(r),rendered:pages}
})()"""
async def snap():
    res = {}
    async with async_playwright() as p:
        b = await p.chromium.launch()
        q = await boot(b); await generate(q); res['base'] = await q.evaluate(CAP)
        await month_prev(q); await generate(q); res['mes_anterior'] = await q.evaluate(CAP)
        q2 = await boot(b, patch=True); await generate(q2); res['excedente'] = await q2.evaluate(CAP)
        # Fase 3 (aditivo): formato Operativo sobre los mismos datos del escenario base
        await q.goto(U + '#presentacion'); await q.wait_for_selector('[data-action="rp-generate"]'); await q.click('[data-action="rp-audience"][data-id="operativo"]')
        await generate(q); await q.evaluate("window.__sel=FP.reportSetupView.selectionOf(FP.app.state.rp)"); res['operativo'] = await q.evaluate(CAP); await q.evaluate("window.__sel=undefined")
        # Fase 4 (aditivo): formato Gerencial sobre los mismos datos del escenario base
        await q.goto(U + '#presentacion'); await q.wait_for_selector('[data-action="rp-generate"]'); await q.click('[data-action="rp-audience"][data-id="gerencial"]')
        await generate(q); await q.evaluate("window.__sel=FP.reportSetupView.selectionOf(FP.app.state.rp)"); res['gerencial'] = await q.evaluate(CAP); await q.evaluate("window.__sel=undefined")
        q3 = await boot(b)
        await q3.goto(U + '#presentacion'); await q3.wait_for_selector('[data-action="rp-generate"]')
        await q3.evaluate("FP.app.actions['pkg-context']({dataset:{key:'periodType',value:'quarter'},value:'quarter'})")
        await q3.evaluate("FP.app.actions['pkg-context']({dataset:{key:'periodKey',value:'2026-Q3'},value:'2026-Q3'})")
        await generate(q3); res['q3'] = await q3.evaluate(CAP)
        await b.close()
    return res
def diff(a, b, path='', out=None, lim=12):
    out = [] if out is None else out
    if len(out) >= lim: return out
    if type(a) != type(b): out.append(f'{path}: tipo {type(a).__name__} ≠ {type(b).__name__}'); return out
    if isinstance(a, dict):
        for k in sorted(set(a) | set(b)):
            if k not in a: out.append(f'{path}.{k}: sobra en la nueva')
            elif k not in b: out.append(f'{path}.{k}: falta en la nueva')
            else: diff(a[k], b[k], f'{path}.{k}', out, lim)
    elif isinstance(a, list):
        if len(a) != len(b): out.append(f'{path}: {len(a)} elementos ≠ {len(b)}')
        for i, (x, y) in enumerate(zip(a, b)): diff(x, y, f'{path}[{i}]', out, lim)
    elif a != b: out.append(f'{path}: «{str(a)[:80]}» ≠ «{str(b)[:80]}»')
    return out
async def main():
    cur = await snap()
    if os.environ.get('UPDATE'):
        json.dump(cur, open(GOLD, 'w'), ensure_ascii=False, sort_keys=True, separators=(',', ':'))
        print('línea base escrita:', {k: (len(v['report']['pages']), len(v['rendered'])) for k, v in cur.items()}, os.path.getsize(GOLD) // 1024, 'KB'); return
    base = json.load(open(GOLD)); fails = []
    for k in base:
        d = diff(base[k], cur.get(k, {}))
        ok = not d; print(('✔ ' if ok else '✘ ') + f'GOLD {k}: reporte idéntico a la línea base (páginas, orden, títulos, textos, tablas, gráficos, sellos, omisiones y anexos)' + ('' if ok else ' — ' + ' | '.join(d[:6])))
        if not ok: fails.append(k)
    print('\nFALLAS:' if fails else '\nTODO BIEN', fails or ''); sys.exit(1 if fails else 0)
asyncio.run(main())
