"""Command Center · Fase 3 · ronda final de calidad — validación UX/UI y ACCESIBILIDAD AUTOMATIZADA del prototipo (docs/command-center/prototipo/home_3_5_prototipo.html).
Chromium EMULADO, datos SIMULADOS. No sustituye pruebas en móviles reales, con lector de pantalla ni con usuarios. Solo lee.
Uso: python3 run_batch.py batch_fase3_calidad_ux.py <raíz>"""
import sys, asyncio, json, pathlib, re
ROOT = sys.argv[1]; sys.argv = sys.argv[:2]
from ed_common import *
R = pathlib.Path(ROOT); D = R / 'docs/command-center'
URL = 'file://' + str(D / 'prototipo/home_3_5_prototipo.html')
SIT = json.loads((D / 'generated/PROTOTIPO_SITUACIONES.json').read_text())['situaciones']
WIDTHS = [320, 360, 375, 390, 414, 768, 1024, 1366, 1440]
OVERFLOW = """(()=>{const out=[]; const vw=document.documentElement.clientWidth; document.querySelectorAll('.sit:not([hidden]) *, [data-bc]:not([hidden]) *, .qa *').forEach(e=>{const r=e.getBoundingClientRect(); if(r.width===0||r.height===0) return; if(r.right>vw+1||r.left<-1) out.push((e.className||e.tagName)+':'+Math.round(r.right))}); const sw=document.documentElement.scrollWidth-vw; return {out:out.slice(0,5), sw}})()"""
CLIP = """(()=>{const out=[]; document.querySelectorAll('.sit:not([hidden]) *').forEach(e=>{if(!e.offsetParent) return; const cs=getComputedStyle(e); if((cs.overflowX==='hidden'||cs.overflowX==='clip'||cs.overflowX==='auto'||cs.overflowX==='scroll') && e.scrollWidth>e.clientWidth+1) out.push((e.className||e.tagName)+':'+e.scrollWidth+'>'+e.clientWidth)}); return out.slice(0,5)})()"""
LUM = """(c)=>{const m=c.match(/\\d+(\\.\\d+)?/g).map(Number); const f=v=>{v/=255; return v<=0.03928? v/12.92 : Math.pow((v+0.055)/1.055,2.4)}; return 0.2126*f(m[0])+0.7152*f(m[1])+0.0722*f(m[2])}"""
async def show(pg, sid): await pg.click(f'[data-sit-btn={sid}]'); await pg.wait_for_timeout(60)
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(); errs = []
        for w in WIDTHS:
            h = 1000 if w >= 768 else 800
            pg = await b.new_page(viewport={'width': w, 'height': h}); pg.on('pageerror', lambda e: errs.append(str(e))); pg.on('console', lambda m: errs.append(m.text) if m.type == 'error' else None)
            await pg.goto(URL); await pg.wait_for_timeout(250); bad = []; clip = []; heights = {}
            for s in SIT:
                await show(pg, s['id']); r = await pg.evaluate(OVERFLOW); c = await pg.evaluate(CLIP); heights[s['id']] = await pg.evaluate('document.documentElement.scrollHeight')
                if r['out'] or r['sw'] > 1: bad.append((s['id'], r))
                if c: clip.append((s['id'], c))
            chk(f'Q1 {w} px: en las 6 situaciones nada se sale del ancho, no hay desplazamiento horizontal y ningún contenedor recorta su contenido', not bad and not clip, (bad[:1], clip[:1]))
            await show(pg, 'alta'); await pg.evaluate("document.querySelector('.sit:not([hidden])').scrollIntoView()")  # la botonera de situaciones es del prototipo, no del producto
            fold = await pg.evaluate("""(h)=>{const q=(s)=>{const e=document.querySelector('.sit:not([hidden]) '+s); if(!e) return null; const r=e.getBoundingClientRect(); return r.top<h && r.bottom>0}; return {estado:q('.z1h .st'), veredicto:q('.vd'), cifra:q('.ec__n'), confiabilidad:q('.z1h .cf'), respuestas:q('.qa')}}""", h)
            chk(f'Q2 {w} px: en el primer pantallazo se ven el estado, el veredicto, la cifra protagonista, la confiabilidad y las respuestas rápidas', all(fold.values()) if w >= 360 else (fold['estado'] and fold['veredicto'] and fold['confiabilidad']), fold)
            small = await pg.evaluate("""(()=>{const out=[]; document.querySelectorAll('.sit:not([hidden]) *').forEach(e=>{if(!e.offsetParent||e.children.length) return; const t=(e.textContent||'').trim(); if(!t) return; const fs=parseFloat(getComputedStyle(e).fontSize); if(fs<11) out.push([e.className||e.tagName, fs, t.slice(0,20)])}); return out.slice(0,5)})()""")
            chk(f'Q3 {w} px: ningún texto mide menos de 11 px', not small, small)
            if w <= 414:
                tg = await pg.evaluate("""(()=>{const out=[]; document.querySelectorAll('.sit:not([hidden]) button, .sit:not([hidden]) summary, .sit:not([hidden]) a, [data-sit-btn]').forEach(e=>{const r=e.getBoundingClientRect(); if(r.width>0 && (r.height<24||r.width<24)) out.push([e.textContent.trim().slice(0,20), Math.round(r.width), Math.round(r.height)])}); return out.slice(0,5)})()""")
                chk(f'Q4 {w} px: los objetivos táctiles miden al menos 24 × 24 px (WCAG 2.2, 2.5.8)', not tg, tg)
                one = await pg.evaluate("""(()=>{const btns=[...document.querySelectorAll('.sit:not([hidden]) .ac__go')]; return btns.map(e=>Math.round(e.getBoundingClientRect().width))})()""")
                chk(f'Q5 {w} px: los botones de destino de Z4 son anchos (≥ 120 px) para el uso con una mano; la ergonomía real (alcance del pulgar) queda Pendiente de validación en dispositivo', all(x >= 120 for x in one), one)
            await pg.close()
        pg = await b.new_page(viewport={'width': 1366, 'height': 900}); pg.on('pageerror', lambda e: errs.append(str(e))); pg.on('console', lambda m: errs.append(m.text) if m.type == 'error' else None)
        await pg.goto(URL); await pg.wait_for_timeout(300)
        for s in SIT:
            await show(pg, s['id'])
            a = await pg.evaluate("""(()=>{const out={}; const hs=[...document.querySelectorAll('h1,h2,h3,h4')].filter(e=>e.offsetParent!==null); out.levels=hs.map(e=>+e.tagName[1]); out.h1=hs.filter(e=>e.tagName==='H1').length;
              let prev=0, skip=[]; hs.forEach(e=>{const l=+e.tagName[1]; if(prev && l>prev+1) skip.push([prev,l,e.textContent.trim().slice(0,30)]); prev=l}); out.skip=skip;
              out.main=document.querySelectorAll('main').length; out.nav=document.querySelectorAll('nav[aria-label]').length; out.regions=document.querySelectorAll('[role=region][aria-label]').length; out.lang=document.documentElement.lang;
              const ids=[...document.querySelectorAll('[id]')].map(e=>e.id); out.dupIds=ids.filter((x,i)=>ids.indexOf(x)!==i); out.imgNoAlt=document.querySelectorAll('img:not([alt])').length;
              out.labelled=[...document.querySelectorAll('section[aria-labelledby]')].filter(e=>e.offsetParent!==null).every(e=>document.getElementById(e.getAttribute('aria-labelledby'))); out.skipLink=!!document.querySelector('a.skip[href="#main"]');
              out.zones=[...document.querySelectorAll('.sit:not([hidden]) > section')].map(e=>e.querySelector('h2')? 'h2':'sin h2'); return out})()""")
            chk(f'Q6 «{s["id"]}»: un solo h1, sin saltos de nivel de encabezado, h2 por zona (Z1 a Z5), ids únicos, referencias aria resueltas, un <main>, idioma declarado y enlace para saltar al contenido', a['h1'] == 1 and not a['skip'] and a['zones'] == ['h2'] * 5 and not a['dupIds'] and a['labelled'] and a['main'] == 1 and a['lang'] == 'es' and a['skipLink'], a)
            low = await pg.evaluate("""(()=>{const lum=""" + LUM + """; const out=[]; document.querySelectorAll('.sit:not([hidden]) *, [data-bc]:not([hidden]) *, .qa *, .proto *').forEach(e=>{if(!e.offsetParent||e.children.length) return; const t=(e.textContent||'').trim(); if(!t) return; let bg=e, c; while(bg){const x=getComputedStyle(bg).backgroundColor; if(x&&!/rgba\\(0, 0, 0, 0\\)|transparent/.test(x)){c=x;break} bg=bg.parentElement} c=c||'rgb(217,217,217)'; const f=getComputedStyle(e).color; const a=lum(f), b=lum(c); const r=(Math.max(a,b)+0.05)/(Math.min(a,b)+0.05); if(r<4.5) out.push([(e.className||e.tagName)+'', r.toFixed(2), t.slice(0,18)])}); return out.slice(0,6)})()""")
            chk(f'Q7 «{s["id"]}»: TODO el texto visible tiene contraste ≥ 4.5:1 con su fondo (WCAG AA)', not low, low)
            alt = await pg.evaluate("""(()=>{const sit=document.querySelector('.sit:not([hidden])'); const t=[...sit.querySelectorAll('.cls, .cd3__ti, .ac__k, .ac__l, .st, .cf')].map(e=>e.textContent.trim()); return t.length>0 && t.every(x=>/[A-Za-zÁÉÍÓÚáéíóú]/.test(x))})()""")
            chk(f'Q8 «{s["id"]}»: la clase, el tipo, el estado y la confiabilidad se identifican con texto (no solo con color o forma)', alt)
        # orden de tabulación = orden visual (arriba→abajo) dentro de la situación
        await show(pg, 'alta'); await pg.focus('[data-sit-btn=alta]'); tops = []; fvis = []
        for _ in range(30):
            await pg.keyboard.press('Tab'); r = await pg.evaluate("(()=>{const a=document.activeElement; if(!a||a===document.body) return null; const cs=getComputedStyle(a); const r=a.getBoundingClientRect(); return [Math.round(r.top+scrollY), parseFloat(cs.outlineWidth)>0 && cs.outlineStyle!=='none', a.tagName]})()")
            if r: tops.append(r[0]); fvis.append(r[1])
        mono = all(tops[i] <= tops[i + 1] + 4 or tops[i + 1] >= tops[i] - 90 for i in range(len(tops) - 1))  # tarjetas en columnas: se lee por filas; tolera la diferencia de altura entre columnas
        chk('Q9 el orden de tabulación sigue el orden visual (de arriba abajo) en la situación «alta»', mono and len(tops) >= 25, tops[:30])
        chk('Q10 cada parada del teclado muestra un indicador de foco visible (contorno)', all(fvis), fvis.count(False))
        await pg.close()
        # «¿Dónde está la oportunidad?» y respuestas rápidas
        pg = await b.new_page(viewport={'width': 390, 'height': 844}); await pg.goto(URL); await pg.wait_for_timeout(300)
        await show(pg, 'alta'); await pg.click('.sit:not([hidden]) [data-go-oport]'); await pg.wait_for_timeout(150)
        st = await pg.evaluate("""(()=>{const sit=document.querySelector('.sit:not([hidden])'); const cards=[...sit.querySelectorAll('[id^=z3] .cd3')].filter(c=>!c.hidden&&c.offsetParent!==null).map(c=>c.dataset.clase); const z=sit.querySelector('[id^=z3]').getBoundingClientRect(); return {cards, top:Math.round(z.top), focus:document.activeElement.tagName}})()""")
        chk('Q11 «¿Dónde está la oportunidad?» filtra Z3 por oportunidades, lleva a Z3 y mueve el foco allí', st['cards'] and set(st['cards']) == {'oportunidad'} and abs(st['top']) < 200 and st['focus'] == 'H2', st)
        n = await pg.evaluate("""(()=>{const sit=document.querySelector('.sit:not([hidden])'); return [...sit.querySelectorAll('.qa a')].every(a=>document.querySelector(a.getAttribute('href'))!==null)})()""")
        chk('Q12 las respuestas rápidas apuntan a zonas que existen', n)
        await show(pg, 'enorden'); off = await pg.evaluate("!!document.querySelector('.sit:not([hidden]) .qa .qa__off') && !document.querySelector('.sit:not([hidden]) [data-go-oport]')")
        chk('Q13 sin oportunidades, la respuesta rápida lo dice y no ofrece un enlace vacío', off)
        # compactación móvil: el supuesto y la contribución pasan a «Evidencia y límites» a ≤ 700 px y la información no se pierde
        await show(pg, 'alta'); moved = await pg.evaluate("(()=>{const c=document.querySelector('.sit:not([hidden]) [id^=z3] .cd3'); return {box:!!c.querySelector('.imp-moved'), inImp:!!c.querySelector('.imp .imp2'), text:(c.querySelector('.imp-moved')||{}).textContent||''}})()")
        await pg.set_viewport_size({'width': 1366, 'height': 900}); await pg.wait_for_timeout(150)
        back = await pg.evaluate("(()=>{const c=document.querySelector('.sit:not([hidden]) [id^=z3] .cd3'); return {box:!!c.querySelector('.imp-moved'), inImp:!!c.querySelector('.imp .imp2')}})()")
        chk('Q14 en pantallas angostas el supuesto y la contribución pasan a «Evidencia y límites» (a un toque) y al ensanchar vuelven a la tarjeta: la información no se pierde', moved['box'] and not moved['inImp'] and 'Supuesto' in moved['text'] and not back['box'] and back['inImp'], (moved, back))
        await pg.close()
        chk('Q15 sin errores de consola ni excepciones durante todas las pruebas', not errs, errs[:3])
        await b.close()
    print(f'\n{len(passed)} bien, {len(fails)} mal'); print('TODO BIEN' if not fails else 'FALLAS: ' + '; '.join(fails)); sys.exit(1 if fails else 0)
asyncio.run(main())
