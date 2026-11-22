"""Command Center · Fase 1.1 (seguridad) — Política de seguridad de contenido (CSP): la app corre sin ninguna violación en todas sus vistas y flujos principales (carga de datos de demostración,
reporte, PDF, trabajador de importación), la política está declarada, la huella del script en línea coincide, y una inyección de script externo/en línea SÍ es bloqueada.
Uso: python3 batch_fase1_csp.py <raíz>"""
import sys, asyncio, re, hashlib, base64, os
os.environ['PW_KEEP_CSP'] = '1'   # esta batería NO omite la política (ver sitecustomize.py)
ROOT = os.path.abspath(sys.argv[1]); sys.argv = sys.argv[:2]
from ed_common import *
async def main():
    html = open(os.path.join(ROOT, 'index.html'), encoding='utf8').read()
    m = re.search(r'<script>(.*?)</script>', html, re.S); h = 'sha256-' + base64.b64encode(hashlib.sha256(m.group(1).encode('utf8')).digest()).decode()
    pol = re.search(r'http-equiv="Content-Security-Policy" content="([^"]+)"', html)
    chk('F1.1-C1 index.html declara una política CSP', bool(pol))
    chk('F1.1-C2 la huella SHA-256 del script en línea de arranque coincide con la de la política (si se edita ese script hay que actualizarla)', bool(pol) and h in pol.group(1), h)
    chk('F1.1-C3 la política prohíbe objetos, restringe base y formularios y no usa «unsafe-eval» ni «unsafe-inline» en script-src', bool(pol) and "object-src 'none'" in pol.group(1) and "base-uri 'self'" in pol.group(1) and "'unsafe-eval'" not in pol.group(1) and not re.search(r"script-src[^;]*'unsafe-inline'", pol.group(1)), pol and pol.group(1))
    cfg = open(os.path.join(ROOT, 'js/config/config.js'), encoding='utf8').read(); url = re.search(r"url: '(https://[^']+\.supabase\.co)'", cfg); ts = re.search(r"challenges\.cloudflare\.com", open(os.path.join(ROOT, 'js/cloud/cloudSync.js'), encoding='utf8').read())
    chk('F1.1-C2b la política permite el proyecto Supabase configurado y Turnstile (los únicos servicios externos del código) y ningún otro host', bool(url and pol and url.group(1) in pol.group(1) and ts) and sorted(set(re.findall(r'https://[a-z0-9.-]+', pol.group(1)))) == sorted({url.group(1), 'https://challenges.cloudflare.com'}), [url and url.group(1), pol and re.findall(r'https://[a-z0-9.-]+', pol.group(1))])
    async with async_playwright() as p:
        b = await p.chromium.launch(); q = await (await b.new_context(viewport={'width': 1280, 'height': 900})).new_page()   # sin bypass_csp
        await q.add_init_script("document.addEventListener('DOMContentLoaded',()=>{const s=document.createElement('style');s.textContent='#tour-offer{display:none!important}';document.head.appendChild(s)})")
        await q.goto(U + '#resumen'); await q.wait_for_selector('#view-resumen:not([hidden])'); await q.wait_for_timeout(1500)
        await q.evaluate("FP.app.actions['generate-mock']()"); await q.wait_for_timeout(2500)
        await q.evaluate("window.__csp=[];document.addEventListener('securitypolicyviolation',e=>window.__csp.push([e.violatedDirective,e.blockedURI.slice(0,80)]))")
        msgs = []; q.on('console', lambda m: msgs.append(m.text) if 'Content Security Policy' in m.text or 'Refused to' in m.text else None)
        views = await q.evaluate("Object.keys(FP.guidanceConfig.VIEWS)")
        for v in views: await q.goto(U + '#' + v); await q.wait_for_timeout(500)
        await q.goto(U + '#presentacion'); await q.wait_for_selector('[data-action="rp-generate"]'); await q.click('[data-action="rp-generate"]'); await q.wait_for_timeout(400)
        if await q.query_selector('[data-action="rp-gap-go"]'): await q.click('[data-action="rp-gap-go"]')
        st = 'timeout'
        for _ in range(240):   # sondeo manual: wait_for_function evalúa texto en la página y la CSP (correctamente) lo bloquea
            st = await q.evaluate("FP.app.state.rp.status")
            if st in ('ready', 'error'): break
            await q.wait_for_timeout(500)
        chk('F1.1-C4 el reporte se genera con la política activa', st == 'ready', st)
        await q.evaluate("(()=>{const rp=FP.app.state.rp; FP.reportView.mountPrint(rp.report,{exclude:[],tags:true})})()"); await q.wait_for_timeout(400); await q.evaluate("FP.reportView.unmountPrint()")
        chk(f'F1.1-C5 ninguna violación de la política en {len(views)} vistas, el reporte y el PDF', not msgs, msgs[:3])
        # importación por el trabajador (Web Worker desde blob:) y por el hilo principal: ambas con la política activa
        csv = 'fecha,canal,venta,pedidos,traffic_volume\n' + '\n'.join(f'2026-10-{d:02d},ecommerce,{1000+d},{10+d},{1000+d}' for d in range(1, 8)) + '\n'
        for worker in (True, False):
            await q.evaluate(f"FP.importWorker.setMinBytes({0 if worker else 10 ** 12}); FP.app.state.view='carga'"); await q.goto(U + '#carga'); await q.wait_for_selector('input[data-action="pick-files"][data-type="actual"]', state='attached')
            n0 = await q.evaluate("FP.dataStore.records(FP.app.state.store,'actual').length")
            await q.set_input_files('input[data-action="pick-files"][data-type="actual"]', files=[{'name': f'csp_{worker}.csv', 'mimeType': 'text/csv', 'buffer': csv.encode()}])
            ok = False
            for _ in range(80):
                if await q.query_selector('[data-action="commit-staged"]:not([disabled])'): ok = True; break
                await q.wait_for_timeout(250)
            if ok: await q.click('[data-action="commit-staged"]'); await q.wait_for_timeout(1500)
            n1 = await q.evaluate("FP.dataStore.records(FP.app.state.store,'actual').length")
            chk(f'F1.1-C5b importación {"con trabajador (blob:)" if worker else "en el hilo principal"} con la política activa: se cargan los datos', ok and n1 > n0, [n0, n1])
        viol = await q.evaluate("window.__csp.length"); chk('F1.1-C5c ninguna violación de la política durante las importaciones', viol == 0 and not msgs, [viol, msgs[:2]])
        await q.evaluate("window.__csp.length=0")
        # la política bloquea de verdad: un <script> en línea nuevo y uno externo no deben ejecutarse
        r = await q.evaluate("""(async()=>{window.__pwn=0; const s=document.createElement('script'); s.textContent='window.__pwn=1'; document.head.appendChild(s);
          const e=document.createElement('script'); e.src='https://example.invalid/x.js'; e.onerror=()=>{window.__ext='blocked'}; document.head.appendChild(e);
          await new Promise(r=>setTimeout(r,800)); return {pwn:window.__pwn, viol:window.__csp.length}})()""")
        chk('F1.1-C6 la política bloquea un script en línea inyectado (no se ejecuta y se registra la violación)', r['pwn'] == 0 and r['viol'] >= 1, r)
        await b.close()
    print(f'\n{len(passed)} bien, {len(fails)} mal'); print('TODO BIEN' if not fails else 'FALLAS: ' + '; '.join(fails)); sys.exit(1 if fails else 0)
asyncio.run(main())
