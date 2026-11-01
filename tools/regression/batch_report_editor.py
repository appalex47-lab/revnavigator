"""Presentation Intelligence · Fase 7 — preferencias persistentes, editor de lámina e hipótesis de IA (opcional) en la pantalla real.
Uso: python3 batch_report_editor.py <raíz>"""
import sys, asyncio, json, os
ROOT = os.path.abspath(sys.argv[1]); sys.argv = sys.argv[:2]
from ed_common import *
from recovery_state import prepare
PAGES = "[...document.querySelectorAll('#view-presentacion .rp-frame .rp-page')].map(p=>p.dataset.page)"
TXT = lambda pg: "(document.querySelector('#view-presentacion .rp-page[data-page=\"" + pg + "\"]')||{textContent:''}).textContent.replace(/\\s+/g,' ')"
KEY = "revnavigator:reportPrefs"
async def gen(f):
    await f.click('[data-action="rp-generate"]'); await f.wait_for_timeout(200)
    if await f.query_selector('[data-action="rp-gap-go"]'): await f.click('[data-action="rp-gap-go"]')
    await f.wait_for_function("FP.app.state.rp.status==='ready'||FP.app.state.rp.status==='error'", timeout=120000)
    return await f.evaluate("FP.app.state.rp.status")
async def setup(b):
    f = await new_page(b, 1280, 900)
    await f.add_init_script("document.addEventListener('DOMContentLoaded',()=>{const s=document.createElement('style');s.textContent='#tour-offer{display:none!important}';document.head.appendChild(s)})")
    await load_products(f, U); await prepare(f, U)
    return f
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(); f = await setup(b)
        ns = await f.evaluate("FP.config.storage.namespace")
        k = f"{ns}:reportPrefs"
        await f.goto(U + '#presentacion'); await f.wait_for_selector('[data-action="rp-generate"]')
        chk('P1 sin haber tocado nada no se guarda ninguna preferencia', await f.evaluate(f"localStorage.getItem('{k}')") is None)
        await f.click('[data-action="rp-audience"][data-id="gerencial"]'); await f.wait_for_timeout(300)
        await f.fill('.rp-th input[data-key="alertPct"]', '8'); await f.dispatch_event('.rp-th input[data-key="alertPct"]', 'change'); await f.wait_for_timeout(300)
        await f.click('[data-action="rp-depth"][data-id="detallado"]'); await f.wait_for_timeout(300)
        raw = json.loads(await f.evaluate(f"localStorage.getItem('{k}')") or 'null')
        env = raw.get('data', raw) if raw else None
        chk('P2 al cambiar la selección se guarda en este navegador (formato, profundidad y umbral)', env and env['audience'] == 'gerencial' and env['depth'] == 'detallado' and env['options']['thresholds'].get('alertPct') == 0.08, raw)
        chk('P3 lo guardado no incluye el reporte generado ni nada de IA', env and 'report' not in env and 'ai' not in json.dumps(env).lower().replace('alertpct', ''), list(env))
        # recargar: se restaura
        await f.reload(); await f.wait_for_selector('[data-action="rp-generate"]'); await f.wait_for_timeout(600)
        st = await f.evaluate("({a:FP.app.state.rp.audience,d:FP.app.state.rp.depth,t:FP.app.state.rp.options.thresholds.alertPct,s:FP.app.state.rp.status,r:FP.app.state.rp.report})")
        chk('P4 al volver a abrir se restauran formato, profundidad y umbral; el reporte NO se restaura (hay que generar de nuevo)', st == {'a': 'gerencial', 'd': 'detallado', 't': 0.08, 's': 'idle', 'r': None}, st)
        chk('P5 el campo de sensibilidad muestra el valor guardado', await f.evaluate("document.querySelector('.rp-th input[data-key=\"alertPct\"]').value") == '8')
        # IA apagada por defecto
        await gen(f)
        chk('P6 la IA está apagada por defecto', await f.evaluate("FP.app.state.rp.options.ai") is False)
        await f.evaluate("window.__calls=0; FP.cohereClient.chatJson=async(a)=>{if(a&&a.audit&&a.audit.purpose==='Hipótesis de presentación')window.__calls++;return {ok:true,status:'ok',text:JSON.stringify({hypotheses:[{text:'Podría ser que el cumplimiento por canal se explique por el tráfico; conviene revisar sus fuentes.'}]})}}")
        # editor
        await f.click('#rp-prop button[data-action="rp-edit-open"][data-id="pacing"]'); await f.wait_for_timeout(300)
        chk('E1 el editor abre sobre la lámina elegida y avisa que no cambia cifras', await f.evaluate("!!document.getElementById('rp-editor')") and 'no cambia ninguna cifra' in await f.evaluate("document.getElementById('rp-editor').innerText"))
        chk('E2 sin permiso de IA no hay botón para pedir hipótesis y no se llama a la IA', await f.query_selector('[data-action="rp-ai-ask"]') is None and await f.evaluate("window.__calls") == 0)
        await f.fill('#rp-ed-title', 'Así vamos contra la meta <b>hoy</b>'); await f.dispatch_event('#rp-ed-title', 'change'); await f.wait_for_timeout(300)
        await f.fill('#rp-ed-note', 'Revisar con Ventas el lunes.'); await f.dispatch_event('#rp-ed-note', 'change'); await f.wait_for_timeout(300)
        t = await f.evaluate(TXT('pacing'))
        chk('E3 el título propio reemplaza al generado y se muestra como TEXTO (el HTML escrito no se interpreta)', 'Así vamos contra la meta <b>hoy</b>' in t and await f.evaluate("!document.querySelector('#view-presentacion .rp-page[data-page=\"pacing\"] .rp-title b')"), t[:200])
        chk('E4 la nota sale al pie de la lámina, rotulada «Nota.»', 'Nota. Revisar con Ventas el lunes.' in t)
        chk('E5 la lámina editada queda marcada «Editada» en la propuesta', await f.evaluate("[...document.querySelectorAll('#rp-prop tbody tr')].some(r=>r.innerText.includes('Pacing')&&r.innerText.includes('Editada'))"))
        chk('E6 la portada y el anexo no se pueden editar', await f.query_selector('#rp-prop button[data-id="cover"]') is None and await f.query_selector('#rp-prop button[data-id="annex"]') is None)
        # cifras intactas
        nums = await f.evaluate("JSON.stringify(FP.app.state.rp.report.pages.find(p=>p.id==='pacing').kpis)")
        # IA con permiso
        await f.check('#rp-editor input[data-key="ai"]'); await f.wait_for_timeout(300)
        chk('A1 con el permiso aparece el botón y todavía no se ha enviado nada', await f.query_selector('[data-action="rp-ai-ask"]') is not None and await f.evaluate("window.__calls") == 0)
        await f.click('[data-action="rp-ai-ask"]'); await f.wait_for_selector('#rp-ai-sug', timeout=10000)
        chk('A2 una hipótesis válida se ofrece para aceptar, no se agrega sola', await f.evaluate("window.__calls") == 1 and await f.evaluate("document.querySelectorAll('#rp-ai-sug li').length") == 1 and 'Hipótesis (IA)' not in await f.evaluate(TXT('pacing')))
        await f.click('#rp-ai-sug button[data-action="rp-ai-accept"]'); await f.wait_for_timeout(300)
        t = await f.evaluate(TXT('pacing'))
        chk('A3 al aceptarla sale en la lámina rotulada «Hipótesis (IA), por validar»', 'Hipótesis (IA), por validar' in t and 'Podría ser que el cumplimiento por canal' in t, t[-300:])
        # respuesta inválida
        await f.evaluate("FP.cohereClient.chatJson=async(a)=>({ok:true,status:'ok',text:JSON.stringify({hypotheses:[{text:'La causa es el precio y subió 77 %.'}]})})")
        await f.click('[data-action="rp-ai-ask"]'); await f.wait_for_timeout(600)
        chk('A4 una respuesta que viola las reglas no se muestra y se explica por qué', await f.query_selector('#rp-ai-sug') is None and 'no cumple las reglas' in await f.evaluate("document.getElementById('rp-editor').innerText"))
        chk('A5 las cifras calculadas de la lámina no cambiaron con ninguna edición', await f.evaluate("JSON.stringify(FP.app.state.rp.report.pages.find(p=>p.id==='pacing').kpis)") == nums)
        # impresión: texto máximo no desborda una lámina densa
        await f.fill('#rp-ed-title', 'T' * 120); await f.dispatch_event('#rp-ed-title', 'change'); await f.fill('#rp-ed-note', 'N' * 280); await f.dispatch_event('#rp-ed-note', 'change'); await f.wait_for_timeout(300)
        geo = await f.evaluate("""(()=>{const r=FP.app.state.rp.report,h=FP.reportView.mountPrint(r,{exclude:FP.app.state.rp.exclude,tags:true,sel:FP.reportSetupView.selectionOf(FP.app.state.rp),edits:FP.app.state.rp.edits});const pg=h.querySelector('.rp-page[data-page="pacing"]');const o={ov:pg.getAttribute('data-overflow'),ed:!!pg.querySelector('.rp-ed')};
          h.remove();document.getElementById('rp-print-style')&&document.getElementById('rp-print-style').remove();document.body.classList.remove('rp-printing');return o})()""")
        chk('E7 con título y nota del largo máximo y una hipótesis, la lámina de pacing sigue cabiendo en 16:9', geo['ed'] and geo['ov'] is None, geo)
        # persistencia de ediciones y restaurar
        await f.reload(); await f.wait_for_selector('[data-action="rp-generate"]'); await f.wait_for_timeout(600); await gen(f)
        chk('P7 las ediciones se restauran al volver a abrir y se aplican al generar', await f.evaluate("Object.keys(FP.app.state.rp.edits).join()") == 'gerencial|pacing' and ('T' * 30) in await f.evaluate(TXT('pacing')))
        chk('P8 la IA vuelve a estar apagada al reabrir (hay que permitirla de nuevo)', await f.evaluate("FP.app.state.rp.options.ai") is False)
        await f.click('#rp-prop button[data-action="rp-edit-open"][data-id="pacing"]'); await f.click('[data-action="rp-edit-reset"]'); await f.wait_for_timeout(300)
        chk('E8 «Restaurar el texto original» quita la edición y vuelve el título generado', await f.evaluate("Object.keys(FP.app.state.rp.edits).length") == 0 and 'TTTT' not in await f.evaluate(TXT('pacing')))
        # lo guardado inválido se descarta con aviso
        await f.evaluate(f"localStorage.setItem('{k}', JSON.stringify({{data:{{schema:'report_prefs',version:1,audience:'inventada',type:'desempeno',options:{{thresholds:{{okPct:9}}}},edits:{{'gerencial|cover':{{title:'x'}}}}}}}}))")
        await f.reload(); await f.wait_for_selector('[data-action="rp-generate"]'); await f.wait_for_timeout(600)
        st = await f.evaluate("({a:FP.app.state.rp.audience,n:(document.getElementById('rp-prefs-note')||{}).innerText||''})")
        chk('P9 lo guardado que ya no aplica se descarta, rige el valor por defecto y se avisa', st['a'] == 'actual' and 'ya no aplica' in st['n'], st)
        # cierre de sesión
        src = open(os.path.join(ROOT, 'js/app.js'), encoding='utf-8').read()
        keep = [l for l in src.splitlines() if l.strip().startswith('const SIGNOUT_KEEP')][0]
        chk('S1 la clave de preferencias NO está en lo que se conserva al cerrar sesión (se borra con los datos del equipo)', 'reportPrefs' not in keep and 'storage.clear();' in src[src.index('async function wipeLocalData'):src.index('async function wipeLocalData') + 1200], keep)
        await f.click('[data-action="rp-audience"][data-id="operativo"]'); await f.wait_for_timeout(300)
        chk('S2 antes de borrar hay algo guardado', await f.evaluate(f"localStorage.getItem('{k}')") is not None)
        await f.evaluate("window.confirm=()=>true; FP.app.actions['clear-all']()"); await f.wait_for_timeout(800)
        chk('S3 al borrar los datos del navegador (el mismo borrado de cerrar sesión) las preferencias desaparecen y la pantalla no las vuelve a escribir', await f.evaluate(f"localStorage.getItem('{k}')") is None, await f.evaluate(f"localStorage.getItem('{k}')"))
        chk('S4 la clave es local: no viaja a la nube', 'reportPrefs' in await f.evaluate("JSON.stringify(FP.config.cloud.skipKeys)"))
        chk('X sin errores de página', not f._errs, f._errs)
        await b.close()
    print('\nFALLAS:' if fails else '\nTODO BIEN', fails or ''); sys.exit(1 if fails else 0)
asyncio.run(main())
