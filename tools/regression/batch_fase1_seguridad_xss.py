"""Command Center · Fase 1.1 (seguridad) — inyección de HTML/JS en TODO el texto que escribe o carga la persona (nombre del negocio, eventos, hitos, notas y columnas de texto de un CSV real,
nombre del archivo) y recorrido de TODAS las vistas: ningún payload debe ejecutarse ni crear elementos con manejadores de eventos. Aplicación real.
Uso: python3 batch_fase1_seguridad_xss.py <raíz>"""
import sys, asyncio, json
ROOT = sys.argv[1]; sys.argv = sys.argv[:2]
from ed_common import *
P1 = '<img src=x onerror="window.__xss=(window.__xss||0)+1">'
P2 = '"><svg onload="window.__xss=(window.__xss||0)+1">'
P3 = '" autofocus onfocus="window.__xss=(window.__xss||0)+1" x="'
P4 = "'-(window.__xss=(window.__xss||0)+1)-'"
PAY = P1 + P2 + P3
CHECK = """(()=>({xss:window.__xss||0, onerror:document.querySelectorAll('[onerror],[onload],[onfocus],[onclick*="__xss"]').length, svg:document.querySelectorAll('svg[onload]').length,
  inj:[...document.querySelectorAll('img[src="x"]')].length}))()"""
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(); q = await boot(b)
        views = await q.evaluate("Object.keys(FP.guidanceConfig.VIEWS)")
        # 1) estado: eventos, hitos, nombre del negocio
        await q.evaluate("""(pay)=>{const S=FP.app.state; window.__xss=0;
          S.events=[FP.events.createEvent({id:'xss-1',name:pay,startDate:'2026-09-01',endDate:'2026-09-05'})];
          (S.milestones||[]).forEach(m=>{ ['name','title','label','note','notes','description'].forEach(k=>{ if(typeof m[k]==='string') m[k]=pay }) });
          FP.app.render()}""", PAY)
        # 2) negocio por la interfaz (formulario real)
        await q.goto(U + '#ajustes'); await q.wait_for_timeout(600)
        await q.evaluate("document.querySelectorAll('#view-ajustes [data-pane]').forEach(e=>e.hidden=false); FP.app.state.stTab='negocio'; FP.app.render()"); await q.wait_for_timeout(300)
        if await q.query_selector('#st-negocio [data-action="bc-seed"]'):
            await q.click('#st-negocio [data-action="bc-seed"]'); await q.wait_for_timeout(200)
            await q.fill('#bc-form [data-path="business.name"]', PAY); await q.press('#bc-form [data-path="business.name"]', 'Tab'); await q.click('#st-negocio [data-action="bc-save"]'); await q.wait_for_timeout(400)
        # 3) CSV real con payloads en las columnas de texto y en el nombre del archivo
        csv = 'fecha,canal,venta,pedidos,traffic_volume,evento,festivo,temporada,notas\n' + '\n'.join(f'2026-10-{d:02d},ecommerce,{1000+d},{10+d},{1000+d},{json.dumps(P1)},{json.dumps(P2)},{json.dumps(P3)},{json.dumps(P1+P2)}' for d in range(1, 6)) + '\n'
        await q.goto(U + '#carga'); await q.wait_for_selector('input[data-action="pick-files"][data-type="actual"]', state='attached')
        await q.set_input_files('input[data-action="pick-files"][data-type="actual"]', files=[{'name': 'x<img src=x onerror=window.__xss=9>.csv', 'mimeType': 'text/csv', 'buffer': csv.encode()}])
        await q.wait_for_timeout(2500)
        try:
            await q.wait_for_selector('[data-action="commit-staged"]:not([disabled])', timeout=20000); await q.click('[data-action="commit-staged"]'); await q.wait_for_timeout(2500)
        except Exception: pass
        r0 = await q.evaluate(CHECK); chk('F1.1-S0 tras cargar el CSV con payloads no se ejecutó nada', r0['xss'] == 0 and r0['onerror'] == 0 and r0['inj'] == 0, r0)
        # control positivo: si un payload SÍ se insertara sin escapar, el detector lo vería (valida la propia prueba)
        await q.evaluate("(()=>{const d=document.createElement('div');d.id='xss-control';d.innerHTML='"+P1.replace("'","\\'")+"';document.body.appendChild(d)})()"); await q.wait_for_timeout(300)
        rc = await q.evaluate(CHECK); chk('F1.1-S0b control positivo: el detector sí ve un payload sin escapar', rc['xss'] > 0 or rc['onerror'] > 0 or rc['inj'] > 0, rc)
        await q.evaluate("document.getElementById('xss-control').remove(); window.__xss=0")
        # 4) recorrer todas las vistas
        bad = []; appeared = []
        for v in views:
            await q.goto(U + '#' + v); await q.wait_for_timeout(700)
            await q.evaluate("document.querySelectorAll('details').forEach(d=>d.open=true)"); await q.wait_for_timeout(150)
            if await q.evaluate("document.body.textContent.includes('onerror=')"): appeared.append(v)
            r = await q.evaluate(CHECK)
            if r['xss'] or r['onerror'] or r['inj']: bad.append((v, r))
        chk(f'F1.1-S1 ninguna de las {len(views)} vistas ejecuta ni inserta los payloads (HTML escapado)', not bad, bad[:3])
        # 5) los textos SÍ llegan a pantalla, pero como texto (no se descartaron: la prueba realmente los expuso)
        chk(f'F1.1-S2 el payload llegó a pantalla como texto literal en {len(appeared)} vista(s): {appeared[:6]}', len(appeared) >= 1, appeared)
        # 6) PDF/reporte: el documento imprimible también escapa
        await q.goto(U + '#presentacion'); await q.wait_for_selector('[data-action="rp-generate"]'); await q.click('[data-action="rp-generate"]')
        try: await q.wait_for_function("FP.app.state.rp.status==='ready'||FP.app.state.rp.status==='error'", timeout=90000)
        except Exception: pass
        await q.evaluate("(()=>{const rp=FP.app.state.rp; if(rp.report){FP.reportView.mountPrint(rp.report,{exclude:[],tags:true}); }})()"); await q.wait_for_timeout(500)
        r6 = await q.evaluate(CHECK); chk('F1.1-S3 el reporte imprimible tampoco ejecuta ni inserta los payloads', r6['xss'] == 0 and r6['onerror'] == 0 and r6['inj'] == 0, r6)
        await b.close()
    print(f'\n{len(passed)} bien, {len(fails)} mal'); print('TODO BIEN' if not fails else 'FALLAS: ' + '; '.join(fails)); sys.exit(1 if fails else 0)
asyncio.run(main())
