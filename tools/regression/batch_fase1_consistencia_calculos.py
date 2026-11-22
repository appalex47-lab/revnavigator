"""Command Center · Fase 1.3 — consistencia de cálculos con un ORÁCULO INDEPENDIENTE: la prueba recalcula desde los registros crudos del almacén (venta real y plan por día y canal,
sin pasar por los motores) y compara con lo que dicen el forecast/pacing, Inicio, el diagnóstico y el reporte ejecutivo. Aplicación real, datos de demostración.
Uso: python3 batch_fase1_consistencia_calculos.py <raíz>"""
import sys, asyncio, json
ROOT = sys.argv[1]; sys.argv = sys.argv[:2]
from ed_common import *
ORACLE = r"""(()=>{
  const S=FP.app.state, i=window.__edIn, run=i.run, cut=run.cutoff, M='2026-09';
  const rec=(t)=>FP.dataStore.records(S.store,t), v=(r,k)=>r.metrics[k]&&typeof r.metrics[k].value==='number'?r.metrics[k].value:null;
  const act=rec('actual').filter(r=>r.date<=cut), plan=rec('plan');
  const counted=new Set(act.filter(r=>v(r,'revenue')!==null).map(r=>r.date+'|'+r.channel));
  const sum=(rows,k,pred)=>rows.filter(pred).reduce((a,r)=>a+(v(r,k)||0),0);
  const chans=Object.keys(run.channels), out={cut, chans, rows:[]};
  const calc=(pred)=>{const o={}; ['revenue','orders','trafficVolume'].forEach(k=>{o['a_'+k]=sum(act,k,r=>counted.has(r.date+'|'+r.channel)&&pred(r)); o['p_'+k]=sum(plan,k,r=>counted.has(r.date+'|'+r.channel)&&pred(r))}); return o};
  const cmp=(label,orc,e)=>{ const r={label,diffs:[]}; const chk=(n,a,b,tol=1e-6)=>{ if(a===null||b===null||a===undefined||b===undefined){ if(a!==b) r.diffs.push([n,a,b]); return } if(Math.abs(a-b)>Math.max(tol,Math.abs(a)*1e-9)) r.diffs.push([n,a,b]) };
    chk('actual',orc.a_revenue,e.revenue.actual); chk('plan',orc.p_revenue,e.revenue.plan); chk('gap',orc.a_revenue-orc.p_revenue,e.revenue.gap);
    chk('gapPct',orc.p_revenue?orc.a_revenue/orc.p_revenue-1:null,e.revenue.gapPct,1e-12); chk('compliance',orc.p_revenue?orc.a_revenue/orc.p_revenue:null,e.revenue.compliance,1e-12);
    chk('orders',orc.a_orders,e.orders.actual); chk('traffic',orc.a_trafficVolume,e.trafficVolume.actual);
    chk('CR=Σpedidos/Σsesiones',orc.a_trafficVolume?orc.a_orders/orc.a_trafficVolume:null,e.conversionRate.actual,1e-12); chk('AOV=Σventa/Σpedidos',orc.a_orders?orc.a_revenue/orc.a_orders:null,e.aov.actual,1e-9);
    out.rows.push(r)};
  chans.forEach(c=>{ const e=run.channels[c].annual.toDate; cmp('anual · '+c, calc(r=>r.channel===c), e); const m=run.channels[c].months.find(x=>x.key===M); if(m) cmp('mes '+M+' · '+c, calc(r=>r.channel===c&&r.date.startsWith(M)), m.toDate) });
  cmp('anual · total', calc(()=>true), run.total.annual.toDate);
  const tm=run.total.months.find(x=>x.key===M); cmp('mes '+M+' · total', calc(r=>r.date.startsWith(M)), tm.toDate);
  // la suma de canales = total del motor
  const sc=chans.reduce((a,c)=>a+run.channels[c].annual.toDate.revenue.actual,0); out.sumCh=[sc, run.total.annual.toDate.revenue.actual];
  // Inicio
  const pf=FP.homeView.periodFigures(S).p; out.home=[pf.actualToDate.revenue, pf.planToDate.revenue, run.total.months.find(x=>x.key===pf.key).toDate.revenue.actual, run.total.months.find(x=>x.key===pf.key).toDate.revenue.plan];
  // reporte
  const rp=FP.app.state.rp.report, pg=rp.pages.find(p=>p.id==='pacing'&&p.status==='included'), k=(id)=>{const x=pg.kpis.find(q=>q.id===id);return x?x.value:null};
  out.report=[k('real'),k('plan'),k('compliance'), tm.toDate.revenue.actual, tm.toDate.revenue.plan, tm.toDate.revenue.compliance];
  // diagnóstico: Σ contribuciones = brecha, identidad y delta = actual − base
  const d=i.diag, L=d.level1Drivers||[]; out.diag={sum:L.reduce((a,x)=>a+(x.contribution||0),0), gap:d.gap.abs, deltaOk:L.every(x=>Math.abs(x.delta-(x.current-x.baseline))<1e-9), val:(d.validation||[]).map(x=>[x.id,x.pass])};
  const cur=d.result.current; out.ident=[cur.revenue, cur.trafficVolume*cur.conversionRate*cur.aov];
  return out})()"""
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(); q = await boot(b)
        st = await generate(q); chk('F1.3-0 el reporte se genera con los datos de demostración', st == 'ready', st)
        o = await q.evaluate(ORACLE)
        chk(f'F1.3-1 el corte del forecast es {o["cut"]} y hay {len(o["chans"])} canales', bool(o['cut']) and len(o['chans']) == 4)
        for r in o['rows']: chk(f'F1.3-2 {r["label"]}: venta, plan, brecha, brecha %, cumplimiento, pedidos, sesiones, CR y AOV = recálculo independiente', not r['diffs'], r['diffs'][:3])
        chk('F1.3-3 la suma de los canales = el total del motor (venta real acumulada)', abs(o['sumCh'][0] - o['sumCh'][1]) < 1e-6, o['sumCh'])
        h = o['home']; chk('F1.3-4 Inicio muestra la misma venta y plan a la fecha que el motor', abs(h[0] - h[2]) < 1e-6 and abs(h[1] - h[3]) < 1e-6, h)
        r_ = o['report']; chk('F1.3-5 el reporte ejecutivo (Pacing) trae la misma venta, plan y cumplimiento que el motor', abs(r_[0] - r_[3]) < 1e-6 and abs(r_[1] - r_[4]) < 1e-6 and abs(r_[2] - r_[5]) < 1e-12, r_)
        d = o['diag']; chk('F1.3-6 diagnóstico: la suma de las contribuciones de los drivers = la brecha', abs(d['sum'] - d['gap']) < 1e-6, d)
        chk('F1.3-7 diagnóstico: cada driver cumple delta = actual − base', d['deltaOk'])
        chk('F1.3-8 diagnóstico: venta = sesiones × CR × AOV y todas las validaciones internas pasan', abs(o['ident'][0] - o['ident'][1]) < 1e-3 and all(x[1] for x in d['val']), [o['ident'], d['val']])
        await b.close()
    print(f'\n{len(passed)} bien, {len(fails)} mal'); print('TODO BIEN' if not fails else 'FALLAS: ' + '; '.join(fails)); sys.exit(1 if fails else 0)
asyncio.run(main())
