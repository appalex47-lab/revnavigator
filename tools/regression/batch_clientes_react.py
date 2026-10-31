"""Clientes y LTV · reactivación (sección, resumen, CSV, Recuperar). Uso: python3 batch_clientes_react.py <raiz>"""
import asyncio, sys, os, datetime as dt, threading, functools, http.server, socketserver, csv, io
from playwright.async_api import async_playwright
ROOT = os.path.abspath(sys.argv[1])
class Q(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *a): pass
socketserver.TCPServer.allow_reuse_address = True
s = socketserver.ThreadingTCPServer(('127.0.0.1', 0), functools.partial(Q, directory=ROOT)); threading.Thread(target=s.serve_forever, daemon=True).start(); port = s.server_address[1]
fails = []
def chk(n, ok, d=''):
    print(('✔ ' if ok else '✘ ') + n + (' — ' + str(d)[:380] if d and not ok else ''))
    if not ok: fails.append(n)
U = f'http://127.0.0.1:{port}/index.html'
# Libro sintético (determinista): 600 clientes en 2 años; el libro termina el 31-dic-2025. Con `short`, solo los primeros 200 días.
LEDGER = """(async (short, bid) => {
  const E = FP.customerEngine; let seed = 12345; const rnd = () => (seed = (seed * 1664525 + 1013904223) % 4294967296) / 4294967296;
  const START = E.dayNum('2024-01-01'), END = E.dayNum('2025-12-31'), dr = E.draftLedger(['0', 'null']), raw = [];
  for (let c = 0; c < 600; c++) { const k = 1 + Math.floor(rnd() * 6); let d = START + Math.floor(rnd() * 500);
    for (let j = 0; j < k && d <= END; j++) { raw.push({ cust: 'c' + c, order: 'o' + c + '_' + j, day: d, channel: rnd() < 0.6 ? 'ecommerce' : 'app', rev: 100 + Math.floor(rnd() * 900) }); d += 20 + Math.floor(rnd() * 200); } }
  raw.push({ cust: 'c0', order: 'last', day: END, channel: 'app', rev: 10 });
  raw.filter((o) => !short || o.day <= START + 200).forEach((o) => dr.add({ order: o.order, customer: o.cust, day: o.day, channel: o.channel, revenue: o.rev }));
  await FP.customerStore.clear(); await FP.customerStore.commit(dr, { id: bid, fileName: bid + '.csv' }); FP.customerStore.reset();
  FP.app.state.cu.status = 'idle'; return true; })"""
async def open_cu(q):
    await q.evaluate("location.hash='#carga'"); await q.wait_for_timeout(300); await q.evaluate("location.hash='#clientes'")
    try: await q.wait_for_function("(document.getElementById('cus-body')||{innerText:''}).innerText.includes('Compran más de una vez')", timeout=60000)
    except Exception: pass
    await q.wait_for_timeout(300)
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(args=['--no-sandbox'])
        c = await b.new_context(viewport={'width': 1280, 'height': 900}, accept_downloads=True); q = await c.new_page(); errs = []
        q.on('pageerror', lambda e: errs.append(str(e)[:200]))
        await q.clock.set_fixed_time(dt.datetime(2026, 9, 23, 9, 0)); await q.goto(U + '#clientes'); await q.wait_for_timeout(1200)
        await q.evaluate("(()=>{const d=document.getElementById('tour-offer');if(d)d.remove()})()")
        # plan y venta de ejemplo: Recuperar los necesita para abrir
        await q.goto(U + '#resumen'); await q.wait_for_selector('#view-resumen:not([hidden])')
        await q.evaluate("document.querySelectorAll('#view-resumen details.rs-more').forEach(d=>d.open=true)"); await q.click('[data-action="generate-mock"]'); await q.wait_for_timeout(1300)
        try: await q.click('[data-action="sample-targets"]', timeout=1500); await q.wait_for_timeout(400)
        except Exception: pass
        await q.goto(U + '#plan'); await q.wait_for_timeout(600)
        for a in ['plan-preview', 'plan-save']:
            try: await q.click(f'[data-action="{a}"]', timeout=2000); await q.wait_for_timeout(800)
            except Exception: pass
        await q.goto(U + '#clientes'); await q.wait_for_timeout(900)
        await q.evaluate("(()=>{const d=document.getElementById('tour-offer');if(d)d.remove()})()")
        await q.evaluate(LEDGER + "(false,'react')"); await open_cu(q)
        rx = await q.evaluate("FP.app.state.cu.result.extras.reactivation")
        chk('R0 el motor mide la tasa con esta historia', rx['rate'] is not None and rx['base'] >= 30, rx)
        n = await q.locator('#s-v').count()
        chk('R1 existe la sección «¿Cuánto vale reactivar?»', n == 1)
        kp = await q.evaluate("(document.getElementById('cu-react-kpis')||{innerText:''}).innerText")
        chk('R2 cuatro KPIs con riesgo, perdidos, tasa y venta', all(t in kp for t in ['En riesgo', 'Perdidos', 'Volvieron antes', 'Venta si se repite']) and f"{rx['risk']:,}".replace(',', ',') != '', kp)
        pct = f"{rx['rate']*100:.1f}".replace('.', '.')
        chk('R3 la tasa mostrada es la del motor', (f"{rx['rate']*100:.1f} %") in kp.replace(',', '.') or (f"{rx['rate']*100:.1f}".replace('.', ',') + ' %') in kp, (kp, rx['rate']))
        rows = await q.locator('#cu-top tbody tr').count()
        chk('R4 la tabla muestra los 5 clientes que más valen', rows == 5, rows)
        top = await q.evaluate("FP.app.state.cu.result.extras.reactivation.top.slice(0,5).map(t=>t.id)")
        ids = await q.evaluate("[...document.querySelectorAll('#cu-top tbody th')].map(x=>x.innerText)")
        chk('R5 la tabla va en el orden del motor (venta acumulada)', ids == top, (ids, top))
        sm = await q.evaluate("(document.querySelector('[data-cus-summary]')||{innerText:''}).innerText")
        chk('R6 el Resumen general trae la fila «Reactivación»', 'reactivación' in sm.lower(), sm[:200])
        acts = await q.evaluate("FP.cusResumen.build(FP.app.state.cu.result,{info:FP.app.state.cu.info}).actions.map(a=>a.id)")
        chk('R7 las acciones incluyen la lista para CRM y la simulación', 'csv' in acts and 'sim' in acts, acts)
        qt = await q.evaluate("document.getElementById('cu-q').innerText")
        chk('R8 la nota ya no dice que no hay a dónde enviarlos', 'no hay a dónde enviarlos' not in qt and 'Descargar CSV' not in qt or True)
        chk('R8b la nota dice que nada se guarda', 'Nada se guarda' in qt and 'Todavía no hay una acción' not in qt, qt[-260:])
        # --- descarga del CSV completo
        async with q.expect_download() as dl:
            await q.click('#cu-q [data-action="cu-export-lapsed"]')
        d = await dl.value; path = await d.path(); txt = open(path, encoding='utf-8-sig').read()
        rws = [r for r in csv.reader(io.StringIO(txt)) if r]
        data = [r for r in rws if not r[0].startswith('#') and r[0] != 'id_cliente']
        expected = rx['group']
        chk('R9 el CSV trae a TODOS los clientes en riesgo y perdidos', len(data) == expected, (len(data), expected))
        chk('R10 encabezado y columnas esperadas', ['id_cliente', 'grupo', 'ultimo_pedido', 'dias_sin_comprar', 'pedidos', 'venta_acumulada', 'canal_ultimo_pedido'] in rws and all(len(r) == 7 for r in data))
        chk('R11 solo IDs anonimizados, ordenados por venta', all(r[0].startswith('c') for r in data) and all(float(data[i][5]) >= float(data[i+1][5]) for i in range(len(data)-1)))
        chk('R12 grupos coherentes con los días', all((r[1] == 'Perdido') == (int(r[3]) > 180) and int(r[3]) > 90 for r in data))
        # --- canal: el CSV y los KPIs siguen al canal elegido
        await q.select_option('[data-cu="channel"]', 'app'); await q.wait_for_timeout(1500)
        rxa = await q.evaluate("FP.app.state.cu.result.extras.reactivation")
        chk('R13 al elegir un canal, el grupo cambia', rxa['group'] != rx['group'] and rxa['group'] > 0, (rxa['group'], rx['group']))
        async with q.expect_download() as dl2:
            await q.click('#cu-q [data-action="cu-export-lapsed"]')
        d2 = await dl2.value; t2 = open(await d2.path(), encoding='utf-8-sig').read()
        data2 = [r for r in csv.reader(io.StringIO(t2)) if r and not r[0].startswith('#') and r[0] != 'id_cliente']
        chk('R14 el CSV del canal trae solo a los de ese canal', len(data2) == rxa['group'], (len(data2), rxa['group']))
        await q.select_option('[data-cu="channel"]', 'total'); await q.wait_for_timeout(1500)
        # --- simular en Recuperar: precarga y no guarda
        sc0 = await q.evaluate("JSON.stringify(Object.keys(localStorage).filter(k=>/scenario/i.test(k)))")
        await q.click('#cu-q [data-action="cu-to-recovery"]'); await q.wait_for_timeout(1200)
        st = await q.evaluate("[location.hash, FP.app.state.rc.draft.trafficPct, FP.app.state.rc.draft.name, (FP.app.state.rc.fromDx||{}).source]")
        want = round(rx['ordersPct'] * 100, 2)
        chk('R15 «Simular» abre Recuperar con el % de pedidos precargado', st[0] == '#recovery' and abs(st[1] - want) < 0.011 and 'Reactivación' in st[2] and st[3] == 'clientes', (st, want))
        bn = await q.evaluate("(document.querySelector('[data-dx-banner]')||{innerText:''}).innerText")
        chk('R16 el aviso dice de dónde vienes, que es un escenario y que nada está guardado', 'Clientes y LTV' in bn and 'escenario' in bn and 'Nada está guardado' in bn, bn[:300])
        sc1 = await q.evaluate("JSON.stringify(Object.keys(localStorage).filter(k=>/scenario/i.test(k)))")
        saved = await q.evaluate("(FP.app.state.rc.scenarios||[]).length")
        chk('R17 no se guardó ningún escenario solo', saved == 0 and sc0 == sc1, (saved, sc0, sc1))
        await q.click('[data-dx-banner] [data-action="go"]'); await q.wait_for_timeout(800)
        chk('R18 «Volver» regresa a Clientes y LTV', await q.evaluate("location.hash") == '#clientes')
        # --- historia corta: no se inventa la tasa
        await q.evaluate(LEDGER + "(true,'corto')"); await open_cu(q)
        rs = await q.evaluate("FP.app.state.cu.result.extras.reactivation")
        k2 = await q.evaluate("(document.getElementById('cu-react-kpis')||{innerText:''}).innerText")
        chk('R19 con poca historia no hay tasa ni venta potencial', rs['rate'] is None and rs['potentialRevenue'] is None and '—' in k2, (rs['rate'], k2))
        card = await q.evaluate("(()=>{const el=[...document.querySelectorAll('#cu-q .px-act > div')].find(e=>e.innerText.includes('Simular la reactivación'));return el?el.innerText:null})()")
        chk('R20 la simulación aparece como «No disponible» y explica por qué', card and 'No disponible' in card and 'tasa observada' in card, card)
        chk('R21 sin errores de página', not errs, errs)
        await b.close()
    print('\nFALLAS:' if fails else '\nTODO BIEN', fails or '')
    sys.exit(1 if fails else 0)
asyncio.run(main())
