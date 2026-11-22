"""Command Center · Fase 3 · Subfase 3.5 — validación AUTOMATIZADA del prototipo navegable del Home inteligente (docs/command-center/prototipo/home_3_5_prototipo.html).
No cambia nada de la aplicación. Son pruebas de especificación, de navegador EMULADO (Chromium) y de accesibilidad básica con DATOS SIMULADOS: NO sustituyen pruebas con
usuarios, en dispositivos móviles reales ni con lector de pantalla. Cada tarea mide cuántos pasos (clics) necesita una persona para responder una pregunta del Command Center.
Uso: python3 run_batch.py batch_fase3_5_prototipo.py <raíz>"""
import sys, asyncio, json, pathlib, re
ROOT = sys.argv[1]; sys.argv = sys.argv[:2]
from ed_common import *
R = pathlib.Path(ROOT); D = R / 'docs/command-center'
URL = 'file://' + str(D / 'prototipo/home_3_5_prototipo.html')
SIT = json.loads((D / 'generated/PROTOTIPO_SITUACIONES.json').read_text())['situaciones']
INTERNAL = r'\b(sin_base|no_configurado|datos_insuficientes|no_aplica|insufficient_data|solo_observado|solo_datos|datos_primero|con_elementos|sin_conclusiones|que_falta|sin_dato_actividad|conversion_cero|riesgo_cumplimiento|pacing_gap)\b'
OVERFLOW = """(()=>{const out=[]; const vw=document.documentElement.clientWidth; document.querySelectorAll('.sit:not([hidden]) *, .bc:not([hidden]) *').forEach(e=>{const r=e.getBoundingClientRect(); if(r.width===0||r.height===0) return; if(r.right>vw+1||r.left<-1) out.push((e.className||e.tagName)+':'+Math.round(r.right))}); return out.slice(0,6)})()"""
LUM = """(c)=>{const m=c.match(/\\d+(\\.\\d+)?/g).map(Number); const f=v=>{v/=255; return v<=0.03928? v/12.92 : Math.pow((v+0.055)/1.055,2.4)}; return 0.2126*f(m[0])+0.7152*f(m[1])+0.0722*f(m[2])}"""
async def show(pg, sid): await pg.click(f'[data-sit-btn={sid}]'); await pg.wait_for_timeout(80)
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(); errs = []
        chk('P0 el prototipo y su archivo de situaciones existen y la salida está generada desde las especificaciones (6 situaciones)', (D / 'prototipo/home_3_5_prototipo.html').exists() and len(SIT) == 6)
        for w, h, nm in [(1366, 900, 'escritorio'), (768, 1024, 'tableta'), (390, 844, 'móvil emulado'), (320, 700, 'móvil estrecho emulado')]:
            pg = await b.new_page(viewport={'width': w, 'height': h}); pg.on('pageerror', lambda e: errs.append(str(e))); pg.on('console', lambda m: errs.append(m.text) if m.type == 'error' else None)
            await pg.goto(URL); await pg.wait_for_timeout(300)
            for s in SIT:
                await show(pg, s['id']); ov = await pg.evaluate(OVERFLOW); sw = await pg.evaluate("document.documentElement.scrollWidth - document.documentElement.clientWidth")
                chk(f'P1 {nm} ({w} px) · «{s["id"]}»: nada se sale del ancho y la página no tiene desplazamiento horizontal (reflujo)', not ov and sw <= 1, (ov, sw))
            await pg.close()
        pg = await b.new_page(viewport={'width': 1366, 'height': 900}); pg.on('pageerror', lambda e: errs.append(str(e))); pg.on('console', lambda m: errs.append(m.text) if m.type == 'error' else None)
        await pg.goto(URL); await pg.wait_for_timeout(300)
        for s in SIT:
            await show(pg, s['id'])
            st = await pg.evaluate("""(()=>{const sit=document.querySelector('.sit:not([hidden])'); const cf=sit.querySelector('[data-wf=z1-confiabilidad]')||sit.querySelector('.z1h .cf'); const bc=document.querySelector('[data-bc]:not([hidden]) [data-bc-level]');
              const z3=sit.querySelector('[id^=z3] .zb__c'), z4=sit.querySelector('[id^=z4] .zb__c'); const order=[...document.querySelectorAll('.page > *:not([hidden]), .sit:not([hidden]) > section')].map(e=>e.id||e.dataset.bc||e.className).filter(x=>x); 
              return {z1:cf?cf.textContent.trim():null, bc:bc?bc.dataset.bcLevel:null, z3:z3?z3.textContent.trim():null, z4:z4?z4.textContent.trim():null, ids:[...sit.querySelectorAll(':scope > section')].map(e=>e.id.split('-')[0])}})()""")
            lv = {'Alta': 'Confiabilidad alta', 'Media': 'Confiabilidad media', 'Baja': 'Confiabilidad baja', 'Insuficiente': 'Confiabilidad insuficiente'}
            chk(f'P2 «{s["id"]}»: la confiabilidad es la misma en la barra de contexto, en Z1 y en el modo de Z3 y de Z4 (coherencia entre capas)', lv[s['z1Level']] == st['z1'] and st['bc'] == s['z1Level'] and s['z1Level'] == s['z3Level'] and {'Alta': 'completo', 'Media': 'completo', 'Baja': 'solo_observado', 'Insuficiente': 'solo_datos'}[s['z3Level']] == s['z3Mode'], st)
            chk(f'P3 «{s["id"]}»: el orden de las zonas es Z1, Z2, Z3, Z4, Z5 (arquitectura de 3.1)', st['ids'] == ['z1', 'z2', 'z3', 'z4', 'z5'], st['ids'])
            chk(f'P4 «{s["id"]}»: cada acción de Z4 cita un elemento que está a la vista en Z3 (o es de datos con su requisito)', True if not s['z4Cards'] else await pg.evaluate("""(()=>{const sit=document.querySelector('.sit:not([hidden])'); const titles=[...sit.querySelectorAll('[id^=z3] .cd3__ti')].map(e=>e.textContent.trim()); return [...sit.querySelectorAll('[id^=z4] .ac')].every(a=>{const m=[...a.querySelectorAll('.ac__m')]; return m.length>0 && m.some(x=>{const t=x.textContent; return titles.some(ti=>t.includes(ti)) || /Dato que falta/.test(t)})})})()"""))
            vis = await pg.evaluate("document.querySelector('.sit:not([hidden])').innerText"); leak = sorted(set(re.findall(INTERNAL, vis)))
            chk(f'P5 «{s["id"]}»: el texto visible no contiene identificadores internos', not leak, leak)
            big = await pg.evaluate("""(()=>{const z=document.querySelector('.sit:not([hidden]) [id^=z1]'); return [...z.querySelectorAll('*')].filter(e=>e.children.length===0 && parseFloat(getComputedStyle(e).fontSize)>=28 && e.textContent.trim()).length})()""")
            chk(f'P6 «{s["id"]}»: Z1 tiene a lo sumo UN número de tamaño grande (≥ 28 px): el protagonista', big <= 1, big)
        # --- interacción (situación «alta») ---
        await show(pg, 'alta')
        nl = await pg.evaluate("document.querySelector('.sit:not([hidden]) .nl').hidden"); await pg.click('.sit:not([hidden]) .nc .lk'); nl2 = await pg.evaluate("document.querySelector('.sit:not([hidden]) .nl').hidden"); await pg.click('.sit:not([hidden]) .nc .lk'); nl3 = await pg.evaluate("document.querySelector('.sit:not([hidden]) .nl').hidden")
        chk('P7 «Ver contexto» abre la narrativa ampliada (hecho, interpretación, limitaciones, implicación) y la cierra', nl is True and nl2 is False and nl3 is True, (nl, nl2, nl3))
        c0 = await pg.evaluate("[...document.querySelectorAll('.sit:not([hidden]) [id^=z3] .cd3')].filter(c=>!c.hidden).length")
        await pg.click('.sit:not([hidden]) [id^=z3] [data-filter=riesgo]'); await pg.wait_for_timeout(80)
        vis = await pg.evaluate("[...document.querySelectorAll('.sit:not([hidden]) [id^=z3] .cd3')].filter(c=>!c.hidden && c.offsetParent!==null).map(c=>c.dataset.clase)"); op = await pg.evaluate("document.querySelector('.sit:not([hidden]) [id^=z3] details.all').open")
        await pg.click('.sit:not([hidden]) [id^=z3] [data-filter=todos]'); await pg.wait_for_timeout(80); allc = await pg.evaluate("[...document.querySelectorAll('.sit:not([hidden]) [id^=z3] .cd3')].filter(c=>!c.hidden).length")
        chk('P8 los filtros de Z3 funcionan: «Riesgos» deja solo riesgos (y abre «Ver todos» si hace falta) y «Todos» devuelve el universo', c0 == len(SIT[0]['z3Cards']) and vis == ['riesgo'] and allc == c0 and op is True, (c0, vis, allc))
        await pg.click('.sit:not([hidden]) [id^=z4] [data-filter=revisar]'); await pg.wait_for_timeout(80); k = await pg.evaluate("[...document.querySelectorAll('.sit:not([hidden]) [id^=z4] .ac')].filter(c=>!c.hidden && c.offsetParent!==null).map(c=>c.dataset.kind)")
        chk('P9 los filtros de Z4 funcionan: «Revisar» deja solo acciones de ese tipo', k and set(k) == {'revisar'}, k)
        await pg.click('.sit:not([hidden]) [id^=z4] .ac:not([hidden]) .ac__go'); await pg.wait_for_timeout(100); tt = await pg.evaluate("document.getElementById('toast').textContent")
        chk('P10 el botón «Ir a: destino» de una acción informa a dónde llevaría (prototipo)', 'Prototipo' in tt and 'se abriría' in tt, tt)
        z5l = await pg.evaluate("[...document.querySelectorAll('.sit:not([hidden]) [id^=z5] h3')].map(h=>h.textContent.trim())"); z5t = await pg.evaluate("document.querySelector('.sit:not([hidden]) [id^=z5] h2').textContent.trim()")
        z5 = await pg.evaluate("[...document.querySelectorAll('.sit:not([hidden]) details[data-z5]')].map(d=>d.open)"); await pg.click('.sit:not([hidden]) details[data-z5] summary'); z5b = await pg.evaluate("document.querySelector('.sit:not([hidden]) details[data-z5]').open")
        chk('P11 Z5 «Oportunidades y visión de conjunto» tiene tres niveles: Oportunidades y Visión de conjunto a la vista y «Evidencia y detalle» plegada (una sola sección secundaria) que se abre sin salir de la página', len(z5) == 1 and not any(z5) and z5b is True and z5l == ['Oportunidades', 'Visión de conjunto'] and z5t == 'Oportunidades y visión de conjunto', (z5, z5l, z5t))
        # --- accesibilidad básica y teclado ---
        names = await pg.evaluate("""(()=>{const bad=[]; document.querySelectorAll('.sit:not([hidden]) button, .sit:not([hidden]) summary, .sit:not([hidden]) [role=button], [data-sit-btn]').forEach(e=>{const n=(e.getAttribute('aria-label')||e.textContent||'').trim(); if(!n) bad.push(e.outerHTML.slice(0,60))}); return bad})()""")
        chk('P12 todo elemento interactivo tiene nombre accesible', not names, names)
        await pg.focus('[data-sit-btn=alta]'); seen = set()
        for _ in range(40):
            await pg.keyboard.press('Tab'); e = await pg.evaluate("(()=>{const a=document.activeElement; return a? (a.tagName+'|'+(a.textContent||'').trim().slice(0,30)+'|'+Math.round(a.getBoundingClientRect().top)):null})()"); seen.add(e)
        chk('P13 el teclado recorre los controles (situaciones, «Ver contexto», filtros, «Ver todos», destinos y Z5) con Tab: ≥ 25 paradas distintas', len(seen) >= 25, len(seen))
        await pg.focus('.sit:not([hidden]) .nc .lk'); await pg.keyboard.press('Enter'); ex = await pg.evaluate("document.querySelector('.sit:not([hidden]) .nc .lk').getAttribute('aria-expanded')")
        chk('P14 «Ver contexto» se opera con el teclado (Enter) y anuncia su estado (aria-expanded)', ex == 'true', ex)
        fv = await pg.evaluate("""(()=>{const s=[...document.styleSheets].flatMap(x=>[...x.cssRules]).map(r=>r.cssText).join(' '); return /focus-visible/.test(s)})()""")
        chk('P15 existe un estilo de foco visible para teclado (:focus-visible)', fv)
        low = await pg.evaluate("""(()=>{const lum=""" + LUM + """; const out=[]; document.querySelectorAll('.sit:not([hidden]) .vd, .sit:not([hidden]) .cd3__ti, .sit:not([hidden]) .cd3__de, .sit:not([hidden]) .ac__l, .sit:not([hidden]) .nc, .sit:not([hidden]) .ec__s, .sit:not([hidden]) .cert, .sit:not([hidden]) .imp2').forEach(e=>{let bg=e, c; while(bg){const x=getComputedStyle(bg).backgroundColor; if(x&&!/rgba\\(0, 0, 0, 0\\)|transparent/.test(x)){c=x;break} bg=bg.parentElement} c=c||'rgb(255,255,255)'; const f=getComputedStyle(e).color; const a=lum(f), b=lum(c); const r=(Math.max(a,b)+0.05)/(Math.min(a,b)+0.05); if(r<4.5) out.push([e.className, r.toFixed(2)])}); return out.slice(0,6)})()""")
        chk('P16 el contraste del texto principal (veredicto, títulos, descripciones, subtextos) es ≥ 4.5:1 (WCAG AA)', not low, low)
        await pg.close()
        # --- primer pantallazo y tamaño de objetivos táctiles ---
        for w, h, nm in [(1366, 800, 'escritorio'), (390, 844, 'móvil emulado')]:
            pg = await b.new_page(viewport={'width': w, 'height': h}); await pg.goto(URL); await pg.wait_for_timeout(300)
            fold = await pg.evaluate("""(h)=>{const q=(s)=>{const e=document.querySelector('.sit:not([hidden]) '+s); if(!e) return null; const r=e.getBoundingClientRect(); return r.top<h && r.bottom>0}; return {estado:q('[data-wf=z1-estado]')||q('.z1h .st'), veredicto:q('.vd'), cifra:q('.ec__n'), confiabilidad:q('.z1h .cf')}}""", h)
            chk(f'P17 {nm}: en el primer pantallazo (sin desplazarse) se ven el estado, el veredicto, la cifra protagonista y la confiabilidad (3.1: primer pantallazo)', all(fold.values()), fold)
            small = await pg.evaluate("""(()=>{const out=[]; document.querySelectorAll('.sit:not([hidden]) button, [data-sit-btn], .sit:not([hidden]) summary').forEach(e=>{const r=e.getBoundingClientRect(); if(r.width>0 && (r.height<24||r.width<24)) out.push([e.textContent.trim().slice(0,20), Math.round(r.width), Math.round(r.height)])}); return out.slice(0,5)})()""")
            chk(f'P18 {nm}: los objetivos interactivos miden al menos 24 × 24 px (WCAG 2.2, 2.5.8)', not small, small)
            await pg.close()
        # --- tareas: pasos para responder cada pregunta del Command Center (medición automatizada, no es prueba con usuarios) ---
        pg = await b.new_page(viewport={'width': 1366, 'height': 900}); await pg.goto(URL); await pg.wait_for_timeout(300)
        T = {}
        await show(pg, 'alta')
        T['T1 ¿Cómo está el negocio?'] = (0, await pg.evaluate("!!document.querySelector('.sit:not([hidden]) .z1h .st') && !!document.querySelector('.sit:not([hidden]) .vd')"))
        T['T2 ¿Cuánto representa la brecha?'] = (0, await pg.evaluate("/723/.test(document.querySelector('.sit:not([hidden]) .ec__n').textContent)"))
        T['T3 ¿Qué tan confiable es la lectura?'] = (0, await pg.evaluate("/Confiabilidad alta/.test(document.querySelector('[data-bc]:not([hidden])').textContent)"))
        T['T4 ¿Qué merece atención primero?'] = (0, await pg.evaluate("/Importante|Crítica/.test(document.querySelector('.sit:not([hidden]) [id^=z3] .cd3 .sv').textContent)"))
        T['T5 ¿Qué hago primero?'] = (0, await pg.evaluate("!!document.querySelector('.sit:not([hidden]) [id^=z4] .ac .ac__l')"))
        await pg.click('.sit:not([hidden]) [id^=z3] details.all summary'); T['T6 Ver los elementos restantes de atención'] = (1, await pg.evaluate("[...document.querySelectorAll('.sit:not([hidden]) [id^=z3] details.all .cd3')].length === " + str(len(SIT[0]['z3Cards']) - 3)))
        await pg.click('.sit:not([hidden]) [id^=z3] .cd3 details.ev summary'); T['T7 ¿Dónde está la evidencia de una cifra?'] = (1, await pg.evaluate("/pacing|forecastEngine|·/.test(document.querySelector('.sit:not([hidden]) [id^=z3] .cd3 details.ev').textContent)"))
        await show(pg, 'baja'); T['T8 (lectura preliminar) ¿Qué falta para concluir?'] = (0, await pg.evaluate("!!document.querySelector('.sit:not([hidden]) [data-wf-f=z3-datos]') && /filas rechazadas/.test(document.querySelector('.sit:not([hidden]) [data-wf-f=z3-datos]').textContent)"))
        await show(pg, 'insuficiente'); T['T9 (sin información suficiente) ¿Se afirma algo que no se puede sostener?'] = (0, await pg.evaluate("document.querySelector('.sit:not([hidden]) .ec__l').textContent.includes('Venta observada') && !/En crecimiento|En riesgo de incumplir/.test(document.querySelector('.sit:not([hidden]) .z1h .st').textContent)"))
        await show(pg, 'sinactividad'); T['T10 (sin actividad) ¿Aparece $0 como resultado?'] = (0, await pg.evaluate("!/\\$\\s?0(?![\\d.])/.test(document.querySelector('.sit:not([hidden]) [id^=z1]').innerText)"))
        for k, (clicks, okv) in T.items(): chk(f'P19 tarea «{k}»: se responde en {clicks} clic(s) y la respuesta es la correcta', okv and clicks <= 1, (clicks, okv))
        await pg.close()
        chk('P20 sin errores de consola ni excepciones durante todas las pruebas del prototipo', not errs, errs[:3])
        await b.close()
    print(f'\n{len(passed)} bien, {len(fails)} mal'); print('TODO BIEN' if not fails else 'FALLAS: ' + '; '.join(fails)); sys.exit(1 if fails else 0)
asyncio.run(main())
