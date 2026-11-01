"""Presentation Intelligence · Fase 1 — el compositor y el contrato sobre los reportes REALES de la app (en memoria, sin pasar por JSON).
Comprueba en 4 escenarios que (1) el contrato no encuentra violaciones, (2) el plan del compositor coincide con lo que la vista previa y el PDF dibujan
y (3) FP.reportView.units delega en el compositor sin cambiar nada.  Uso: python3 batch_report_composer.py <raíz>"""
import sys, asyncio
from ed_common import *
CHECK = """(()=>{
  const r=FP.app.state.rp.report, ex=FP.app.state.rp.exclude.slice();
  const key=(s)=>s.id+(s.sub?'-'+s.sub:'');
  const plan=FP.reportComposer.compose(r,{exclude:ex}), planAll=FP.reportComposer.compose(r,{exclude:[]});
  const prev=[...document.querySelectorAll('#view-presentacion .rp-page')].map(p=>p.dataset.page);
  FP.reportView.mountPrint(r,{exclude:[],tags:true}); const pr=[...document.querySelectorAll('#rp-print-host .rp-page')].map(p=>p.dataset.page);
  document.getElementById('rp-print-host').remove(); const st=document.getElementById('rp-print-style'); if(st)st.remove(); document.body.classList.remove('rp-printing');
  const u=FP.reportView.units(r,ex).map(key);
  const v=FP.reportContent.validate(r), d=FP.reportContent.describe(r);
  return {viol:v.violations, plan:plan.slides.map(key), prev, planAll:planAll.slides.map(key), print:pr, units:u, omit:r.omitted.map(o=>o.id).sort(),
    exOmit:plan.excluded.filter(e=>e.kind==='sin-datos').map(e=>e.block).sort(), reasons:plan.excluded.filter(e=>e.kind==='sin-datos').every(e=>r.omitted.find(o=>o.id===e.block).reason===e.reason),
    nFind:d.findings.length, nNum:d.numbers.length, nBlocks:d.blocks.length, nPages:r.pages.length, prof:plan.profile, lim:plan.limitations.map(l=>l.kind)}
})()"""
async def scenario(q, name):
    r = await q.evaluate(CHECK)
    chk(f'{name}: el contrato de integridad no encuentra violaciones en el reporte real (en memoria)', not r['viol'], r['viol'])
    chk(f'{name}: las láminas del plan son las de la vista previa (mismo orden)', r['plan'] == r['prev'], {'plan': r['plan'], 'vista': r['prev']})
    chk(f'{name}: con todo incluido, el plan es lo que el PDF imprime', r['planAll'] == r['print'], {'plan': r['planAll'], 'pdf': r['print']})
    chk(f'{name}: FP.reportView.units delega en el compositor (mismas láminas)', r['units'] == r['plan'], r['units'])
    chk(f'{name}: las páginas omitidas del plan son las del reporte, con su motivo exacto', r['omit'] == r['exOmit'] and r['reasons'], r)
    chk(f'{name}: el modelo de contenido describe todos los bloques y trae hallazgos y cifras', r['nBlocks'] == r['nPages'] and r['nFind'] > 0 and r['nNum'] > 0 and r['prof'] == 'legacy', r)
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch()
        q = await boot(b); await generate(q); await scenario(q, 'base')
        await month_prev(q); await generate(q); await scenario(q, 'mes_anterior')
        q2 = await boot(b, patch=True); await generate(q2); await scenario(q2, 'excedente')
        q3 = await boot(b)
        await q3.goto(U + '#presentacion'); await q3.wait_for_selector('[data-action="rp-generate"]')
        await q3.evaluate("FP.app.actions['pkg-context']({dataset:{key:'periodType',value:'quarter'},value:'quarter'})")
        await q3.evaluate("FP.app.actions['pkg-context']({dataset:{key:'periodKey',value:'2026-Q3'},value:'2026-Q3'})")
        await generate(q3); await scenario(q3, 'q3')
        await b.close()
    print('\nFALLAS:' if fails else '\nTODO BIEN', fails or ''); sys.exit(1 if fails else 0)
asyncio.run(main())
