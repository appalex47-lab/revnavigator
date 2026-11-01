"""Presentation Intelligence · Fase 2 — configuración y propuesta de la presentación (pasos 1 a 5) en la pantalla real.
Uso: python3 batch_report_setup.py <raíz>"""
import sys, asyncio, subprocess
from ed_common import *
PAGES = "[...document.querySelectorAll('#view-presentacion .rp-frame .rp-page')].map(p=>p.dataset.page)"
ROWS = "[...document.querySelectorAll('#rp-prop tbody tr')].map(r=>r.children[2].innerText.trim())"
async def pages(q): return await q.evaluate(PAGES)
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(); q = await boot(b)
        await q.goto(U + '#presentacion'); await q.wait_for_selector('[data-action="rp-generate"]'); await q.evaluate("(()=>{const d=document.getElementById('tour-offer');if(d)d.remove()})()")
        # ---- pasos 1 a 3 antes de generar
        st = await q.evaluate("""(()=>{const g=(id)=>[...document.querySelectorAll('#'+id+' .rp-choice')].map(b=>({t:b.querySelector('.rp-choice__t').innerText,on:b.getAttribute('aria-pressed'),dis:b.getAttribute('aria-disabled'),na:!!b.querySelector('.rp-choice__na'),title:b.title}));return {a:g('rp-s1'),t:g('rp-s2'),d:g('rp-s3'),sel:document.getElementById('rp-selected').innerText}})()""")
        chk('S1 paso 1: 4 audiencias; «Reporte actual» está elegida; «Operativo», «Gerencial» y «Directivo» están habilitadas sin elegir', [x['t'] for x in st['a']] == ['Reporte actual', 'Operativo', 'Gerencial', 'Directivo'] and st['a'][0]['on'] == 'true' and st['a'][0]['dis'] is None and all(x['on'] == 'false' and x['dis'] is None and not x['na'] for x in st['a'][1:]), st['a'])
        chk('S2 paso 2: 6 tipos; solo «Desempeño comercial» habilitado y elegido; los demás «Próximamente»', len(st['t']) == 6 and st['t'][0]['t'] == 'Desempeño comercial' and st['t'][0]['on'] == 'true' and all(x['dis'] == 'true' and x['na'] for x in st['t'][1:]), st['t'])
        chk('S3 paso 3: Resumen, Ejecutivo y Detallado; Detallado elegido', [x['t'] for x in st['d']] == ['Resumen', 'Ejecutivo', 'Detallado'] and [x['on'] for x in st['d']] == ['false', 'false', 'true'], st['d'])
        chk('S4 la línea «Se armará» resume la elección', 'Reporte actual' in st['sel'] and 'Desempeño comercial' in st['sel'] and 'Detallado' in st['sel'], st['sel'])
        # lo no habilitado no se puede elegir
        s0 = await q.evaluate("JSON.stringify([FP.app.state.rp.audience,FP.app.state.rp.type,FP.app.state.rp.depth])")
        await q.click('#rp-s2 .rp-choice--off >> nth=1', force=True); await q.wait_for_timeout(300)
        chk('S5 hacer clic en una opción no habilitada no cambia nada ni da error', await q.evaluate("JSON.stringify([FP.app.state.rp.audience,FP.app.state.rp.type,FP.app.state.rp.depth])") == s0 and not q._errs, q._errs)
        # ---- propuesta
        await generate(q); await q.wait_for_timeout(400)
        base_prev = await pages(q); at0 = await q.evaluate("FP.app.state.rp.at")
        prop = await q.evaluate("""(()=>({rows:[...document.querySelectorAll('#rp-prop tbody tr')].map(r=>({n:r.children[1].innerText,t:r.children[2].innerText.trim(),ty:r.children[3].innerText,why:r.children[4].innerText,box:!!r.querySelector('input'),req:!!r.querySelector('.rp-prop__req')})),
          off:[...document.querySelectorAll('#rp-offlist li')].map(l=>({t:l.querySelector('.rp-off__t').innerText,k:l.querySelector('.pill').innerText,why:l.querySelector('.rp-off__why').innerText,box:!!l.querySelector('input')})),
          lim:[...document.querySelectorAll('#rp-limits li')].map(l=>l.innerText),sum:document.getElementById('rp-prop-sum').innerText}))()""")
        chk('S6 paso 5: la propuesta lista cada lámina con número, tipo y motivo; la portada es obligatoria (sin casilla) y el resto tiene casilla', len(prop['rows']) == len(base_prev) and prop['rows'][0]['req'] and not prop['rows'][0]['box'] and all(r['box'] and r['why'].startswith('Incluida') for r in prop['rows'][1:]) and [r['n'] for r in prop['rows']] == [str(i + 1) for i in range(len(prop['rows']))], prop['rows'][:3])
        chk('S7 la propuesta tiene el mismo número de láminas que la vista previa', len(prop['rows']) == len(base_prev) and f"{len(prop['rows'])} lámina" in prop['sum'], (len(prop['rows']), len(base_prev), prop['sum']))
        kinds = {o['t']: o for o in prop['off']}
        chk('S8 «No incluidas» dice por qué: sin datos (con el motivo del reporte), dentro del anexo y fuera de la selección', any(o['k'] == 'Sin datos' and len(o['why']) > 10 for o in prop['off']) and any(o['k'] == 'Dentro del anexo' for o in prop['off']) and any(o['k'] == 'Fuera de la selección' and o['box'] for o in prop['off']), prop['off'])
        rel = [o for o in prop['off'] if o['k'] == 'Dentro del anexo']
        chk('S9 hallazgo D2 resuelto: «Confiabilidad del forecast» ya no tiene casilla que no hace nada; se lista como «Dentro del anexo» con el título del anexo', rel and not rel[0]['box'] and 'Anexo técnico' in rel[0]['why'] and 'bloque' not in rel[0]['why'], rel)
        chk('S10 las limitaciones que el reporte ya trae se listan (rezago de la venta real)', any('Venta real hasta el' in l and 'faltan' in l for l in prop['lim']), prop['lim'])
        # ---- profundidad
        for depth, exp in [('resumen', ['cover', 'summary', 'closing', 'decisions']), ('ejecutivo', None)]:
            await q.click(f'[data-action="rp-depth"][data-id="{depth}"]'); await q.wait_for_timeout(400)
            got = await pages(q); rows = await q.evaluate(ROWS)
            if exp: chk(f'S11 profundidad «{depth}»: la vista previa muestra solo portada, resumen, cierre y decisiones', got == exp, got)
            else: chk(f'S12 profundidad «{depth}»: suma desempeño, factores, quién suma/resta y categorías (sin evolución ni clientes)', 'pacing' in got and 'movers' in got and 'categories' in got and not any(x in got for x in ['trends', 'customers']) and got[0] == 'cover' and got[-1] == 'decisions', got)
            chk(f'S13 «{depth}»: la propuesta coincide con la vista previa', len(rows) == len(got), (rows, got))
        chk('S14 cambiar de profundidad no marca la vista como desactualizada ni vuelve a generar el reporte', await q.evaluate("FP.app.state.rp.at") == at0 and not await q.query_selector('#rp-status .note--warn'), at0)
        await q.click('[data-action="rp-depth"][data-id="resumen"]'); await q.wait_for_timeout(300)
        offd = await q.evaluate("[...document.querySelectorAll('#rp-offlist li')].filter(l=>l.querySelector('.pill').innerText==='Fuera de la profundidad elegida').map(l=>l.querySelector('.rp-off__t').innerText+'|'+l.querySelector('.rp-off__why').innerText)")
        chk('S15 lo que la profundidad deja fuera se lista con su motivo (las dos profundidades)', offd and all('Resumen' in x and ('Ejecutivo' in x or 'Detallado' in x) for x in offd), offd)
        # agregar una lámina contra la profundidad, y quitarla
        await q.click('#rp-offlist input[data-id="categories"]'); await q.wait_for_timeout(300)
        got = await pages(q)
        chk('S16 agregar una lámina que la profundidad dejó fuera: entra en su lugar y dice «Agregada por la persona»', got == ['cover', 'summary', 'categories', 'closing', 'decisions'] and 'Agregada por la persona' in await q.evaluate("document.getElementById('rp-prop').innerText"), got)
        await q.click('#rp-prop input[data-id="categories"]'); await q.wait_for_timeout(300)
        chk('S17 volver a quitarla la deja fuera por profundidad (no «quitada por ti»)', await pages(q) == ['cover', 'summary', 'closing', 'decisions'] and 'categories' not in await q.evaluate("JSON.stringify(FP.app.state.rp.exclude)"), await q.evaluate("JSON.stringify(FP.app.state.rp)"))
        # restablecer
        await q.click('[data-action="rp-depth"][data-id="detallado"]'); await q.wait_for_timeout(300)
        await q.click('#rp-prop input[data-id="movers"]'); await q.wait_for_timeout(300)
        quitada = 'movers' not in await pages(q)
        await q.click('[data-action="rp-reset-selection"]'); await q.wait_for_timeout(300)
        chk('S18 quitar una lámina la saca; «Restablecer la selección» vuelve a la propuesta del perfil', quitada and await pages(q) == base_prev and await q.evaluate("FP.app.state.rp.depth") == 'detallado', await pages(q))
        # PDF con otra profundidad
        await q.click('[data-action="rp-depth"][data-id="resumen"]'); await q.wait_for_timeout(300)
        await q.evaluate("FP.reportView.mountPrint(FP.app.state.rp.report,{exclude:FP.app.state.rp.exclude,tags:false,sel:FP.reportSetupView.selectionOf(FP.app.state.rp)})"); await q.emulate_media(media='print')
        await q.pdf(path='/tmp/setup_resumen.pdf', prefer_css_page_size=True, print_background=True)
        info = subprocess.run(['pdfinfo', '/tmp/setup_resumen.pdf'], capture_output=True, text=True).stdout
        import re; pg = int(re.search(r'Pages:\s+(\d+)', info).group(1)); sz = re.search(r'Page size:\s+([\d.]+) x ([\d.]+)', info)
        txt = subprocess.run(['pdftotext', '/tmp/setup_resumen.pdf', '-'], capture_output=True, text=True).stdout
        chk('S19 el PDF con profundidad «Resumen» trae 4 hojas 16:9 (una por lámina elegida) y sin «undefined/NaN/null»', pg == 4 and abs(float(sz.group(1)) / float(sz.group(2)) - 16 / 9) < 0.01 and not re.search(r'\b(undefined|NaN|null)\b', txt), (pg, sz and sz.groups()))
        await q.emulate_media(media='screen'); await q.evaluate("FP.reportView.unmountPrint()")
        # el reporte sin cambios: detallado = golden de siempre
        await q.click('[data-action="rp-reset-selection"]'); await q.click('[data-action="rp-depth"][data-id="detallado"]'); await q.wait_for_timeout(300)
        chk('S20 con la elección inicial (reporte actual · desempeño · detallado) las láminas son las de siempre', await pages(q) == base_prev, await pages(q))
        # accesibilidad
        a11y = await q.evaluate("""(()=>{const btn=[...document.querySelectorAll('.rp-choice')];const boxes=[...document.querySelectorAll('#rp-prop input,#rp-offlist input')];
          return {btnNamed:btn.every(b=>b.innerText.trim().length>0&&b.hasAttribute('aria-pressed')),groups:[...document.querySelectorAll('fieldset.rp-step')].every(f=>f.querySelector('legend')),boxNamed:boxes.every(b=>b.getAttribute('aria-label')),cap:!!document.querySelector('#rp-prop caption'),req:document.querySelector('.rp-prop__req').getAttribute('aria-label')}})()""")
        chk('S21 accesibilidad: cada opción tiene nombre y estado, los pasos son grupos con leyenda, las casillas tienen etiqueta y la tabla tiene título', a11y['btnNamed'] and a11y['groups'] and a11y['boxNamed'] and a11y['cap'] and a11y['req'] == 'Obligatoria', a11y)
        # móvil
        await q.set_viewport_size({'width': 390, 'height': 800}); await q.wait_for_timeout(400)
        chk('S22 en un celular (390 px) no hay desborde horizontal', await q.evaluate("document.documentElement.scrollWidth<=innerWidth+1"))
        chk('S23 sin errores de página durante todo el recorrido', not q._errs, q._errs)
        await b.close()
    print('\nFALLAS:' if fails else '\nTODO BIEN', fails or ''); sys.exit(1 if fails else 0)
asyncio.run(main())
