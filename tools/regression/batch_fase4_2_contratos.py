"""Fase 4.2 · contratos y consumidores en el NAVEGADOR real (Chromium, datos de demostración SIMULADOS). Uso: python3 tools/regression/run_batch.py batch_fase4_2_contratos.py <raiz>
Comprueba lo que SÍ está conectado: planStatus/sampleSufficiency cargados por index.html; Inicio, Pacing y exportación con la misma clasificación y los umbrales EFECTIVOS (P-12);
mínimo de sesiones por segmento desde una sola fuente (P-16); Cambios/Diagnóstico sin errores tras la migración de fórmulas (P-13). NO es validación visual del Command Center (no existe en la app)."""
import asyncio, sys, os, json, datetime as dt, threading, functools, http.server, socketserver
from playwright.async_api import async_playwright
ROOT = os.path.abspath(sys.argv[1])
class Q(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *a): pass
socketserver.TCPServer.allow_reuse_address = True
s = socketserver.ThreadingTCPServer(('127.0.0.1', 0), functools.partial(Q, directory=ROOT)); threading.Thread(target=s.serve_forever, daemon=True).start(); port = s.server_address[1]
fails = []
def chk(n, ok, d=''):
    print(('✔ ' if ok else '✘ ') + n + (' — ' + str(d)[:420] if d and not ok else ''))
    if not ok: fails.append(n)
U = f'http://127.0.0.1:{port}/index.html'
async def seed(q):
    await q.goto(U + '#resumen'); await q.wait_for_selector('#view-resumen:not([hidden])')
    await q.evaluate("document.querySelectorAll('#view-resumen details.rs-more').forEach(d=>d.open=true)"); await q.click('[data-action="generate-mock"]'); await q.wait_for_timeout(1500)
    try: await q.click('[data-action="sample-targets"]', timeout=1500); await q.wait_for_timeout(500)
    except Exception: pass
    await q.goto(U + '#plan'); await q.wait_for_timeout(600)
    for a in ['plan-preview', 'plan-save']:
        try: await q.click(f'[data-action="{a}"]', timeout=2000); await q.wait_for_timeout(800)
        except Exception: pass
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(args=['--no-sandbox'])
        c = await b.new_context(viewport={'width': 1280, 'height': 900}); q = await c.new_page(); errs = []
        q.on('pageerror', lambda e: errs.append(str(e)[:200]))
        await q.clock.set_fixed_time(dt.datetime(2026, 9, 23, 9, 0))
        await q.goto(U + '#inicio'); await q.wait_for_timeout(800)
        await q.evaluate("(()=>{const d=document.getElementById('tour-offer');if(d)d.remove()})()")
        await seed(q)
        # A · carga real
        r = await q.evaluate("({ps:typeof FP.planStatus, ss:typeof FP.sampleSufficiency, sm:typeof FP.sampleSufficiency.segmentMinSessions, z1:typeof FP.z1, rel:typeof FP.reliability, fnd:typeof FP.findings, cat:typeof FP.metricCatalog})")
        chk('A1 (reapertura) index.html carga planStatus, sampleSufficiency, z1, reliability y findings (todos con consumidor funcional, ver batch_reapertura_consumidores) y NO carga el catálogo (referencia/herramienta de validación)', r['ps'] == 'object' and r['ss'] == 'object' and r['sm'] == 'function' and r['z1'] == 'object' and r['rel'] == 'object' and r['fnd'] == 'object' and r['cat'] == 'undefined', r)
        await q.goto(U + '#inicio'); await q.wait_for_timeout(1500)
        await q.evaluate("(()=>{const d=document.getElementById('tour-offer');if(d)d.remove()})()")
        # B · Inicio: veredicto, píldora y contextEngine con la misma clasificación (default y umbral personalizado)
        js = """(th)=>{const st=FP.app.state, run=st.fc.run; if(th) run.settings.pacingThresholds=th; FP.app.render();
          const f=FP.homeView.periodFigures(st), comp=f&&f.p&&f.p.toDate.revenue.compliance;
          const txt=document.body.innerText; const verdict=/Vas en plan/.test(txt)?'on_plan':/por encima de la meta acumulada/.test(txt)?'above':/por debajo de la meta acumulada/.test(txt)?'below':null;
          const exp=FP.gap.pacingStatus(comp, run.settings.pacingThresholds);
          const h=FP.contextEngine.headline(FP.contextEngine.collectStatus(st))[0]||''; const ctx=/en línea con el plan/.test(h)?'on_plan':null;
          return {comp, exp, verdict, ctxOnPlan: ctx==='on_plan', head:h}}"""
        base = await q.evaluate(js, None)
        chk('B1 Inicio (umbral por defecto): el titular coincide con FP.gap.pacingStatus', base['verdict'] == base['exp'], base)
        chk('B2 Inicio (umbral por defecto): la frase de contextEngine dice «en línea» solo si el estado es en plan', base['ctxOnPlan'] == (base['exp'] == 'on_plan'), base)
        wide = await q.evaluate(js, {'aboveFrom': 1.5, 'onPlanFrom': 0.5})
        chk('B3 Inicio con umbral PERSONALIZADO (0.5–1.5): titular «en plan» y contextEngine «en línea» (la configuración efectiva llega a ambos)', wide['verdict'] == 'on_plan' and wide['ctxOnPlan'], wide)
        # C · exportación (P-12) y píldora de Pacing con los mismos umbrales
        ex = await q.evaluate("""(th)=>{const st=FP.app.state, run=st.fc.run; run.settings.pacingThresholds=th; const e=FP.forecastExport.buildForecastExport(run);
          const bad=[]; const chk=(o,k)=>{ if(!o) return; const comp=o.gap_to_date&&o.gap_to_date.revenue&&o.gap_to_date.revenue.compliance; const exp=FP.gap.pacingStatus(typeof comp==='number'?comp:null, th); if(o.pacing_status!==exp) bad.push([k,o.pacing_status,exp,comp]); };
          const tot=e.pacing.total; chk(tot.annual,'annual'); tot.months.forEach(m=>chk(m,'m'+m.month)); tot.weeks.forEach(w=>chk(w,'w'+w.week));
          return {bad:bad.slice(0,3), n: 1+tot.months.length+tot.weeks.length, annual: tot.annual.pacing_status, th: e.assumptions.settings.pacing_thresholds}}""", {'aboveFrom': 1.01, 'onPlanFrom': 0.99})
        chk(f"C1 exportación (umbral por defecto): pacing_status coincide con FP.gap.pacingStatus en anual, meses y semanas ({ex['n']} periodos)", not ex['bad'] and ex['n'] > 5, ex)
        ex2 = await q.evaluate("""(th)=>{const st=FP.app.state, run=st.fc.run; run.settings.pacingThresholds=th; const e=FP.forecastExport.buildForecastExport(run); const tot=e.pacing.total; const all=[tot.annual,...tot.months,...tot.weeks].filter(o=>o&&o.gap_to_date.revenue&&typeof o.gap_to_date.revenue.compliance==='number');
          return {statuses:[...new Set(all.map(o=>o.pacing_status))], n:all.length}}""", {'aboveFrom': 1.5, 'onPlanFrom': 0.5})
        chk('C2 exportación con umbral PERSONALIZADO (0.5–1.5): todos los periodos con cumplimiento salen «on_plan» (antes salía con el umbral por defecto)', ex2['n'] > 3 and ex2['statuses'] == ['on_plan'], ex2)
        await q.evaluate("FP.app.state.fc.run.settings.pacingThresholds={aboveFrom:1.01,onPlanFrom:0.99}")
        await q.goto(U + '#pacing'); await q.wait_for_timeout(1500)
        pl = await q.evaluate("""()=>{const st=FP.app.state, run=st.fc.run, a=run.total.annual.toDate.revenue; const exp=FP.gap.pacingStatus(a.compliance, run.settings.pacingThresholds); const lab=FP.config.pacingStatusLabels[exp];
          const pill=[...document.querySelectorAll('#fc-kpis .pill, #fc-kpis [class*=pill], #fc-kpis .btn-row span')].map(e=>e.innerText.trim()).filter(Boolean); const e=FP.forecastExport.buildForecastExport(run);
          return {exp, lab, pill, exportAnnual:e.pacing.total.annual.pacing_status}}""")
        chk('C3 paridad Pacing ↔ exportación: la píldora de Pacing (venta total) y pacing_status exportado coinciden con la clasificación central', pl['exportAnnual'] == pl['exp'] and any(pl['lab'] in x for x in pl['pill']), pl)
        # D · P-16 y P-13
        sm = await q.evaluate("""()=>{const SS=FP.sampleSufficiency; return {a:SS.segmentMinSessions(20000), b:SS.segmentMinSessions(90000), cfg:FP.config.diagnostics.segmentMinVolume}}""")
        chk('D1 P-16 en la app real: el mínimo sale de FP.config.diagnostics.segmentMinVolume (500 / 1 %): 20 000 → 500; 90 000 → 900', sm['a'] == 500 and sm['b'] == 900 and sm['cfg']['minSessions'] == 500, sm)
        for v in ['segmentos', 'cambios', 'diagnostico', 'reforecast', 'reporte']:
            await q.goto(U + '#' + v); await q.wait_for_timeout(1200)
        chk('D2 P-13/P-16: Segmentos, Cambios, Diagnóstico, Reforecast y Reporte se renderizan sin errores de página tras migrar fórmulas y centralizar el mínimo', not errs, errs)
        await b.close()
asyncio.run(main())
print('FALLAS:', len(fails)); sys.exit(1 if fails else 0)
