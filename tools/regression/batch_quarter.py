"""Periodo Q (año fiscal = calendario): calendario, series de pacing por Q y diagnóstico por Q. Uso: python3 batch_quarter.py <raiz>"""
import sys, asyncio
from an_common import *
from recovery_state import prepare
U = f'http://127.0.0.1:{port}/index.html'
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(); f = await new_page(b, 1280, 900)
        await load_products(f, U); pr = await prepare(f, U); chk('Q0 escenario preparado', pr == 'ok', pr)
        c = await f.evaluate("""(()=>{const C=FP.calendar;return {r:C.quarterRange('2026-Q3'),r4:C.quarterRange('2026-Q4'),r1:C.quarterRange('2026-Q1'),prev1:C.prevQuarterKey('2026-Q1'),prev3:C.prevQuarterKey('2026-Q3'),bad:C.quarterRange('2026-Q5'),
          key:C.periodKey('2026-08-15','quarter'),lab:C.periodLabel('2026-Q3','quarter'),key12:C.periodKey('2026-12-31','quarter')}})()""")
        chk('Q1 Q3 = jul–sep y Q4 = oct–dic; Q1 = ene–mar', c['r']['from'] == '2026-07-01' and c['r']['to'] == '2026-09-30' and c['r4']['to'] == '2026-12-31' and c['r1']['from'] == '2026-01-01' and c['r1']['to'] == '2026-03-31', c)
        chk('Q2 Q anterior (Q1 → Q4 del año previo), clave y etiqueta', c['prev1'] == '2025-Q4' and c['prev3'] == '2026-Q2' and c['key'] == '2026-Q3' and c['key12'] == '2026-Q4' and c['lab'] == 'Q3 2026' and c['bad'] is None, c)
        s = await f.evaluate("""(()=>{const t=FP.app.state.fc.run.total,sum=(a,f)=>a.reduce((s,x)=>s+(f(x)||0),0);
          return t.quarters.map(q=>{const ms=t.months.filter(m=>FP.calendar.periodKey(m.firstDate,'quarter')===q.key);return {key:q.key,n:ms.length,days:q.days,mdays:sum(ms,m=>m.days),plan:q.plan.revenue,mplan:sum(ms,m=>m.plan.revenue),fc:q.forecast&&q.forecast.revenue,mfc:sum(ms,m=>m.forecast&&m.forecast.revenue)}})})()""")
        chk('Q3 hay cuatro Q con tres meses cada uno', [x['key'] for x in s] == ['2026-Q1', '2026-Q2', '2026-Q3', '2026-Q4'] and all(x['n'] == 3 for x in s), s)
        chk('Q4 los días y el plan de cada Q suman los de sus tres meses', all(x['days'] == x['mdays'] and abs(x['plan'] - x['mplan']) < 1 for x in s), s)
        chk('Q5 el forecast de cada Q suma el de sus tres meses', all(x['fc'] is None or abs(x['fc'] - x['mfc']) < 1 for x in s), s)
        ch = await f.evaluate("(()=>{const r=FP.app.state.fc.run;return Object.keys(r.channels).every(k=>Array.isArray(r.channels[k].quarters)&&r.channels[k].quarters.length===4)})()")
        chk('Q6 cada canal también trae sus cuatro Q', ch)
        d = await f.evaluate("""(()=>{const st=FP.app.state,run=st.fc.run,rf=FP.app.ensureReforecast?FP.app.ensureReforecast():st.rf.run;
          const mk=(cmp,key)=>FP.diagnosticEngine.runDiagnostic({comparison:cmp,period:{type:'quarter',key},channel:'total',metric:'revenue',run,rf,store:st.store,quality:st.quality});
          const a=mk('actual_vs_plan','2026-Q3'),p=mk('actual_vs_previous','2026-Q3');
          return {a:a.status,al:a.period.label,ar:a.coverage.currentRange,p:p.status,pr:p.coverage.currentRange,pb:p.coverage.baselineRange}})()""")
        chk('Q7 el diagnóstico acepta el Q: etiqueta «Q3 2026» y días solo de jul–sep', d['a'] == 'ok' and d['al'] == 'Q3 2026' and d['ar'][0] >= '2026-07-01' and d['ar'][1] <= '2026-09-30', d)
        # El escenario de ejemplo solo trae venta real de septiembre: el mapeo al Q anterior se prueba directo sobre el motor.
        m = await f.evaluate("""(()=>{const D=FP.driverEngine,per={type:'quarter',key:'2026-Q3'};
          return {inQ:['2026-07-01','2026-09-30'].every(d=>D.inPeriod(d,per)),out:['2026-06-30','2026-10-01'].some(d=>D.inPeriod(d,per)),
            a:D.baselineDate('2026-07-01','actual_vs_previous',per),b:D.baselineDate('2026-08-15','actual_vs_previous',per),c:D.baselineDate('2026-09-30','actual_vs_previous',per),
            q1:D.baselineDate('2026-01-15','actual_vs_previous',{type:'quarter',key:'2026-Q1'}),yoy:D.baselineDate('2026-08-15','actual_vs_yoy',per)}})()""")
        chk('Q8 un día es del Q solo entre el 1 jul y el 30 sep', m['inQ'] and not m['out'], m)
        chk('Q9 contra el Q anterior se toma el mismo día del Q (por posición dentro del Q: 1 jul → 1 abr; día 46 del Q3 = 15 ago → día 46 del Q2 = 16 may); el Q1 compara con el Q4 previo; yoy = mismo día del año anterior', m['a'] == '2026-04-01' and m['b'] == '2026-05-16' and m['q1'] == '2025-10-15' and m['yoy'] == '2025-08-15', m)
        chk('Q10 si el Q anterior es más corto, el día sin par queda fuera (el día 92 del Q3, 30 sep, no tiene par: el Q2 tiene 91 días)', m['c'] is None, m)
        await b.close()
    print('\nFALLAS:' if fails else '\nTODO BIEN', fails or ''); sys.exit(1 if fails else 0)
asyncio.run(main())
