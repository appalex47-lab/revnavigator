"""Reapertura 4.1/4.2 · consumidores REALES de los contratos del Command Center en la aplicación (Chromium, datos de demostración SIMULADOS).
Uso: python3 tools/regression/run_batch.py batch_reapertura_consumidores.py <raiz>
Comprueba: carga de z1/reliability/findings/sampleSufficiency/planStatus; que el motor de atención entrega confiabilidad (Z1), suficiencia de muestra y hallazgos cc.finding/1.1 validados;
que Inicio y la vista de atención CONSUMEN esos resultados (chip de confiabilidad, id estable y naturaleza del hallazgo en el DOM); ausencia ≠ cero; y que la UI no recalcula."""
import asyncio, sys, os, datetime as dt, threading, functools, http.server, socketserver
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
        await q.goto(U + '#inicio'); await q.wait_for_timeout(1800)
        await q.evaluate("(()=>{const d=document.getElementById('tour-offer');if(d)d.remove()})()")
        r = await q.evaluate("({z1:typeof FP.z1, bs:typeof FP.businessState, rel:typeof FP.reliability, fnd:typeof FP.findings, ss:typeof FP.sampleSufficiency, ps:typeof FP.planStatus, zi:typeof FP.z1Input, ac:typeof FP.attentionContract})")
        chk('A1 index.html carga los 8 módulos de contratos que ahora tienen consumidor', all(v == 'object' for v in r.values()), r)
        info = await q.evaluate("""()=>{const st=FP.app.state, h=st.ux.home, f=FP.homeView.periodFigures(st);
          const sum=FP.homeSummaryView.compute?FP.homeSummaryView.compute(st,h):null; return {hasSum:!!sum}}""")
        d = await q.evaluate("""()=>{const out={}; const st=FP.app.state, h=st.ux.home; const sum=FP.homeSummaryView.build ? null : null;
          const route=window.__lastRoute||null; return out}""")
        # leer el resultado real que usó Inicio: se reconstruye con las mismas funciones de la app
        res = await q.evaluate("""()=>{
          const st=FP.app.state, h=st.ux.home, f=FP.homeView.periodFigures(st); const S=FP.homeSummaryEngine.compute(st,h);
          const status=FP.contextEngine.collectStatus(st); const ready=FP.contextEngine.dataReadiness ? FP.contextEngine.dataReadiness(status) : null;
          const built=FP.attentionView.build(st,h,f,S,status,ready); const att=built.att;
          return {err:att.contractError, hasContract:!!att.contract, level: att.contract&&att.contract.reliability.level, uses: att.contract&&Object.keys(att.contract.reliability.uses), sample: att.contract&&att.contract.sample.status,
            nFind: att.findings.length, nContract: att.contract?att.contract.findings.length:null, invalid: att.contract?att.contract.invalid.length:null,
            kinds: att.contract?att.contract.findings.map(x=>x.kind):[], causal: att.contract?att.contract.findings.map(x=>x.causality):[], ids: att.contract?att.contract.findings.map(x=>x.id):[],
            z1level: FP.z1.build(att.contract.z1Input).reliability.level, completeness: att.contract.reliability.completeness, html: built.html}}""")
        chk('B1 el motor de atención entrega el contrato sin error (confiabilidad Z1 + suficiencia + hallazgos)', res['hasContract'] and res['err'] is None and res['level'] in ('Alta', 'Media', 'Baja', 'Insuficiente') and len(res['uses']) == 6, res)
        chk('B2 el NIVEL de confiabilidad que ve la aplicación es el de Z1 evaluado sobre la misma entrada (no hay otra regla)', res['level'] == res['z1level'], [res['level'], res['z1level']])
        chk('B3 cada hallazgo del motor está expresado en cc.finding/1.1 válido (ninguno inválido) y con ids estables únicos', res['invalid'] == 0 and res['nContract'] > 0 and len(set(res['ids'])) == len(res['ids']), [res['invalid'], res['nContract'], res['nFind']])
        chk('B4 separación observado / estimado / hipótesis: ningún hallazgo declara causa comprobada (causality demonstrated=0) y los drivers salen como hipótesis', 'demonstrated' not in res['causal'] and all(k in ('desviacion', 'hipotesis', 'riesgo', 'hecho_observado', 'oportunidad') for k in res['kinds']), [res['kinds'], res['causal']])
        # el DOM de Inicio CONSUME los resultados
        dom = await q.evaluate("""()=>{const items=[...document.querySelectorAll('.att__item[data-finding-id]')].map(e=>({id:e.dataset.findingId,nature:e.dataset.nature,causality:e.dataset.causality,txt:e.textContent.includes('Naturaleza del hallazgo')}));
          const chip=[...document.querySelectorAll('*')].map(e=>e.children.length===0?e.textContent:'').find(t=>/Confiabilidad de la lectura:/.test(t))||null; return {items, chip}}""")
        chk('C1 la vista de atención RENDERIZA el id estable, la naturaleza y la causalidad de cada hallazgo (consumidor real de cc.finding)', len(dom['items']) >= 1 and all(i['id'] and i['nature'] and i['causality'] for i in dom['items']) and all(i['txt'] for i in dom['items']) and all(i['causality'] != 'demonstrated' for i in dom['items']), dom['items'][:2])
        chk('C2 Inicio muestra el chip «Confiabilidad de la lectura» con el nivel de Z1 (consumidor real de reliability)', dom['chip'] is not None and any(l in dom['chip'] for l in ('Alta', 'Media', 'Baja', 'Insuficiente')), dom)
        # ausencia ≠ cero con el motor real de la app
        ab = await q.evaluate("""()=>{const st=FP.app.state, h=st.ux.home, f=FP.homeView.periodFigures(st); const S=FP.homeSummaryEngine.compute(st,h);
          const g=JSON.parse(JSON.stringify(f)); g.p.actualToDate.trafficVolume=null; g.p.actualToDate.orders=null;
          const status=FP.contextEngine.collectStatus(st); const ready=FP.contextEngine.dataReadiness?FP.contextEngine.dataReadiness(status):null;
          const input={referenceDate:'2026-09-23', status:{...status, plan:{source:'x'}, data:status.data}, summary:S};
          const z=FP.z1Input.fromHome({f:g,S,input}); const a=FP.reliability.assess(z);
          return {sessions:z.activity.sessions, orders:z.activity.orders, completeness:a.completeness, conv:FP.z1.build(z).conclusions.conversion, missing:a.explain.missing, observed:FP.z1.build(z).economic.observed.visible}}""")
        chk('D1 ausencia ≠ cero en la app real: sin sesiones ni pedidos el adaptador entrega null (no 0), la completitud es «incompleta», la conversión «no verificable» y la venta observada sigue visible', ab['sessions'] is None and ab['orders'] is None and ab['completeness'] == 'incompleta' and ab['conv'] == 'no_verificable' and ab['observed'] is True, ab)
        # la UI no recalcula: el chip == resultado del contrato (mismo texto)
        same = await q.evaluate("""()=>{const st=FP.app.state, h=st.ux.home, f=FP.homeView.periodFigures(st); const S=FP.homeSummaryEngine.compute(st,h); const status=FP.contextEngine.collectStatus(st); const ready=FP.contextEngine.dataReadiness?FP.contextEngine.dataReadiness(status):null;
          const lvl=FP.attentionView.build(st,h,f,S,status,ready).att.contract.reliability.level; const chip=[...document.querySelectorAll('*')].map(e=>e.children.length===0?e.textContent:'').find(t=>/Confiabilidad de la lectura:/.test(t))||''; return {lvl, chip}}""")
        chk('D2 el nivel del chip de Inicio es el del contrato (la interfaz no recalcula la confiabilidad)', same['chip'].endswith(same['lvl']) or ('Confiabilidad de la lectura: ' + same['lvl']) in same['chip'], same)
        # planStatus: Inicio y contextEngine
        ps = await q.evaluate("""()=>{const st=FP.app.state, f=FP.homeView.periodFigures(st), t=f.p.toDate.revenue; const exp=FP.gap.pacingStatus(t.compliance, st.fc.run.settings.pacingThresholds);
          const cs=FP.contextEngine.collectStatus(st); const head=FP.contextEngine.headline(cs)[0]||''; return {exp, head}}""")
        chk('D3 contextEngine (vía cc.plan_status/1) y la regla central coinciden: «en línea» solo si FP.gap.pacingStatus dice «en plan»', ('en línea' in ps['head']) == (ps['exp'] == 'on_plan') or 'acumulada' not in ps['head'], ps)
        for v in ['pacing', 'segmentos', 'cambios', 'diagnostico', 'reporte', 'inicio']:
            await q.goto(U + '#' + v); await q.wait_for_timeout(900)
        chk('E1 sin errores de página al recorrer Pacing, Segmentos, Cambios, Diagnóstico, Reporte e Inicio con los contratos conectados', not errs, errs)
        await b.close()
asyncio.run(main())
print('FALLAS:', len(fails)); sys.exit(1 if fails else 0)
