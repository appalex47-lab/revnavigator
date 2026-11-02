"""Cierre técnico · hallazgos 8 y 9: (8) títulos, notas e hipótesis de longitud máxima no desbordan ninguna lámina; (9) fidelidad del PDF real
(page.pdf) en los tres formatos: hojas = láminas, 16:9, texto igual al de la pantalla, sin «null/undefined/NaN», letra mínima.
Uso: python3 batch_cierre_ediciones_pdf.py <raíz> [directorio_pdf]. Usa el navegador real y la aplicación real (datos de demostración)."""
import sys, os, re, subprocess, asyncio
OUT = sys.argv[2] if len(sys.argv) > 2 else '/tmp/pi_pdf'; sys.argv = sys.argv[:2]
from integral_common import *
os.makedirs(OUT, exist_ok=True)
T120 = ('Título muy largo escrito por la persona para comprobar que la lámina nunca se desborda aunque se use el máximo permitido de caracteres ' * 2)[:120]
N280 = ('Nota extensa que la persona escribe para explicar el contexto de la lámina con todo detalle y comprobar que cabe sin cortar ninguna cifra calculada. ' * 3)[:280]
H220 = [(f'Hipótesis {i} de la IA aceptada por la persona, redactada con el máximo de caracteres permitido para probar el ajuste de espacio en cada lámina del formato. ' * 3)[:220] for i in (1, 2, 3)]
SETUP_EDITS = """(()=>{const rp=FP.app.state.rp, sel=FP.reportSetupView.selectionOf(rp), us=FP.reportComposer.units(rp.report, rp.exclude, sel), ed={};
  us.filter(u=>!['cover','annex'].includes(u.id)).forEach(u=>{ed[FP.reportPrefs.editKey(sel.profile,u.id)]={title:%s,note:%s,hyp:%s}}); rp.edits=ed; return {sel, n:Object.keys(ed).length, units:us.length}})()"""
MEASURE = r"""(()=>{const rp=FP.app.state.rp, sel=FP.reportSetupView.selectionOf(rp);
  const host=FP.reportView.mountPrint(rp.report,{exclude:rp.exclude,tags:true,sel,edits:rp.edits}); host.style.cssText='display:block;position:absolute;left:0;top:0;visibility:hidden';
  const out=[...host.querySelectorAll('.rp-page')].map(pg=>{const b=pg.querySelector('.rp-body'), bb=pg.getBoundingClientRect(), ed=pg.querySelector('.rp-ed'), tt=pg.querySelector('.rp-title');
    const small=[...pg.querySelectorAll('*')].filter(e=>[...e.childNodes].some(n=>n.nodeType===3&&n.textContent.trim())&&!e.closest('svg')&&parseFloat(getComputedStyle(e).fontSize)<13.3).length;
    const edBox=ed?ed.getBoundingClientRect():null, bodyBox=b?b.getBoundingClientRect():null;
    return {id:pg.dataset.page, w:Math.round(bb.width), h:Math.round(bb.height), ov:pg.getAttribute('data-overflow'), trimmed:pg.getAttribute('data-trimmed'), small,
      hasEd:!!ed, edInside:!edBox||(edBox.bottom<=bodyBox.bottom+1&&edBox.bottom<=bb.bottom), trimNote:!!pg.querySelector('.rp-ed__trim'), title:tt?tt.textContent:'', titleBottom:tt?tt.getBoundingClientRect().bottom<=bb.bottom:true,
      noteTx:ed&&ed.querySelector('.rp-ed__n')?ed.querySelector('.rp-ed__n').textContent:'', hypTx:ed?[...ed.querySelectorAll('.rp-ed__h li')].map(l=>l.textContent):[], ctrl:b?b.scrollHeight<=b.clientHeight+1:true, bh:b?[b.scrollHeight,b.clientHeight]:null, edh:ed?Math.round(edBox.height):0}}); host.style.cssText=''; return out})()"""
VARIANT = r"""(()=>{const rp=FP.app.state.rp, sel=FP.reportSetupView.selectionOf(rp), v='__V__'; const rep=JSON.parse(JSON.stringify(rp.report)); let i=0;
  const walk=(o)=>{ if(Array.isArray(o)) o.forEach(walk); else if(o&&typeof o==='object') Object.keys(o).forEach(k=>{ const x=o[k]; if(typeof x==='number'&&Number.isFinite(x)&&!/^(year|month|day|n|count|total|rank|order|index|days|countedDays)$/i.test(k)){ if(v==='enormes') o[k]=x*1e6; else if(v==='negativos') o[k]=-x; else if(v==='nulos'&&(i++%3===0)) o[k]=null; } else walk(x); }); };
  walk(rep.pages);
  const host=FP.reportView.mountPrint(rep,{exclude:rp.exclude,tags:true,sel,edits:null}); host.style.cssText='display:block;position:absolute;left:0;top:0;visibility:hidden';
  const out=[...host.querySelectorAll('.rp-page')].map(pg=>{const bb=pg.getBoundingClientRect();const small=[...pg.querySelectorAll('*')].filter(e=>[...e.childNodes].some(n=>n.nodeType===3&&n.textContent.trim())&&!e.closest('svg')&&parseFloat(getComputedStyle(e).fontSize)<13.3).length;return {id:pg.dataset.page,w:Math.round(bb.width),h:Math.round(bb.height),ov:pg.getAttribute('data-overflow'),small}});
  host.style.cssText=''; return out})()"""
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch()
        for scenario in os.environ.get('SC', 'mes,anio').split(','):
            f = await setup(b, scenario)
            for a in ('actual', 'operativo', 'gerencial', 'directivo'):
                await f.click(f'[data-action="rp-audience"][data-id="{a}"]'); await f.wait_for_timeout(250)
                await f.click('[data-action="rp-depth"][data-id="detallado"]') if await f.query_selector('[data-action="rp-depth"][data-id="detallado"]') else None
                await f.wait_for_timeout(200)
                tag = f'{scenario}/{a}'
                st = await gen(f); chk(f'[{tag}] se genera sin error', st == 'ready', st)
                # ---- 9: PDF real SIN ediciones (el reporte tal cual) ----
                m0 = await f.evaluate(MEASURE); await f.emulate_media(media='print')
                path0 = f'{OUT}/{scenario}_{a}.pdf'; await f.pdf(path=path0, prefer_css_page_size=True, print_background=True)
                info = subprocess.run(['pdfinfo', path0], capture_output=True, text=True).stdout
                pg = re.search(r'Pages:\s+(\d+)', info); sz = re.search(r'Page size:\s+([\d.]+) x ([\d.]+)', info)
                chk(f'[{tag}] PDF real: una hoja por lámina ({len(m0)})', bool(pg) and int(pg.group(1)) == len(m0), [pg and pg.group(1), len(m0)])
                chk(f'[{tag}] PDF real: formato 16:9', bool(sz) and abs(float(sz.group(1)) / float(sz.group(2)) - 16 / 9) < 0.01, sz and sz.groups())
                txt = subprocess.run(['pdftotext', '-layout', path0, '-'], capture_output=True, text=True).stdout
                chk(f'[{tag}] PDF real: el PDF trae texto (no está en blanco)', len(txt.strip()) > 400, len(txt))
                chk(f'[{tag}] PDF real: sin «null», «undefined», «NaN» ni «Infinity»', not re.search(r'\b(null|undefined|NaN|Infinity)\b', txt), re.findall(r'.{20}\b(?:null|undefined|NaN)\b.{20}', txt)[:3])
                scr = await f.evaluate("[...document.querySelectorAll('#rp-print-host .rp-page')].map(p=>{const c=p.cloneNode(true);c.querySelectorAll('svg,style,script').forEach(x=>x.remove());c.querySelectorAll('*').forEach(x=>x.append(' '));return c.textContent.replace(/\\s+/g,' ')}).join(' ')")
                key = re.findall(r'[−+\-]?\$[\d.,]+[KM]?|\d+(?:\.\d+)?\s?%', scr); inpdf = re.sub(r'\s+', ' ', subprocess.run(['pdftotext', path0, '-'], capture_output=True, text=True).stdout)
                miss = [k for k in dict.fromkeys(key) if k.replace(' ', '') not in inpdf.replace(' ', '')]
                chk(f'[{tag}] PDF real: todas las cifras de la pantalla ({len(set(key))}) aparecen en el PDF', not miss, miss[:8])
                chk(f'[{tag}] PDF real: ninguna lámina desborda, 1122×630 y letra ≥ 13.4 px (salvo portada)', all(s['w'] == 1122 and s['h'] == 630 and s['ov'] is None for s in m0) and not [s['id'] for s in m0 if s['small'] and s['id'] != 'cover'], [(s['id'], s['ov'], s['small']) for s in m0 if s['ov'] or (s['small'] and s['id'] != 'cover')])
                await f.emulate_media(media='screen'); await f.evaluate("FP.reportView.unmountPrint()")
                # ---- 8: ediciones de longitud máxima en todas las láminas editables ----
                info = await f.evaluate(SETUP_EDITS % (repr(T120).replace("'", '"') if False else __import__('json').dumps(T120), __import__('json').dumps(N280), __import__('json').dumps(H220)))
                m = await f.evaluate(MEASURE); await f.emulate_media(media='print')
                path1 = f'{OUT}/{scenario}_{a}_textos_maximos.pdf'; await f.pdf(path=path1, prefer_css_page_size=True, print_background=True)
                n1 = int(re.search(r'Pages:\s+(\d+)', subprocess.run(['pdfinfo', path1], capture_output=True, text=True).stdout).group(1))
                ed_slides = [s for s in m if s['id'] not in ('cover', 'annex') and s['hasEd']]
                chk(f'[{tag}] textos máximos: se aplicaron a {len(ed_slides)} láminas ({info["n"]} ediciones)', len(ed_slides) >= max(1, info['n'] - 1) or info['n'] == 0, [info, len(ed_slides)])
                chk(f'[{tag}] textos máximos: ninguna lámina desborda', all(s['ov'] is None and s['ctrl'] and s['w'] == 1122 and s['h'] == 630 for s in m), [(s['id'], s['ov'], s['bh'], s['edh']) for s in m if s['ov'] or not s['ctrl']])
                chk(f'[{tag}] textos máximos: nota e hipótesis quedan dentro de la lámina y el título también', all(s['edInside'] and s['titleBottom'] for s in m), [(s['id']) for s in m if not (s['edInside'] and s['titleBottom'])])
                chk(f'[{tag}] textos máximos: letra ≥ 13.4 px (salvo portada)', not [s['id'] for s in m if s['small'] and s['id'] != 'cover'], [(s['id'], s['small']) for s in m if s['small'] and s['id'] != 'cover'])
                def short(s_):
                    return s_['hasEd'] and (N280[-25:] not in s_['noteTx'] or len(s_['hypTx']) < 3 or any(H220[i][-25:] not in h for i, h in enumerate(s_['hypTx'])))
                abr = [s_ for s_ in m if s_['id'] not in ('cover', 'annex') and short(s_)]
                chk(f'[{tag}] textos máximos: toda lámina cuyo texto se abrevió lo dice en la propia lámina ({len(abr)} abreviadas)', all(s_['trimNote'] for s_ in abr), [s_['id'] for s_ in abr if not s_['trimNote']])
                chk(f'[{tag}] textos máximos: el título de la persona se conserva completo (120 caracteres)', all(T120 in s_['title'] for s_ in m if s_['hasEd']), [s_['title'][:40] for s_ in m if s_['hasEd'] and T120 not in s_['title']])
                chk(f'[{tag}] textos máximos: el PDF real sigue con una hoja por lámina', n1 == len(m), [n1, len(m)])
                t1 = subprocess.run(['pdftotext', '-layout', path1, '-'], capture_output=True, text=True).stdout
                chk(f'[{tag}] textos máximos: la nota y la etiqueta de IA se leen en el PDF', ('Nota.' in t1 or info['n'] == 0) and ('Hipótesis (IA), por validar' in t1 or info['n'] == 0), None)
                # ---- casos límite de DATOS (hardening): números enormes, signos invertidos y valores nulos sobre el reporte real ----
                if scenario == 'mes':
                    for variant in ('enormes', 'negativos', 'nulos'):
                        mv = await f.evaluate(VARIANT.replace('__V__', variant))
                        chk(f'[{tag}] datos {variant}: ninguna lámina desborda ni queda más baja que 13.4 px', all(s_['ov'] is None and s_['w'] == 1122 and s_['h'] == 630 for s_ in mv) and not [s_['id'] for s_ in mv if s_['small'] and s_['id'] != 'cover'], [(s_['id'], s_['ov'], s_['small']) for s_ in mv if s_['ov'] or (s_['small'] and s_['id'] != 'cover')])
                        bad = await f.evaluate("(()=>{const h=document.getElementById('rp-print-host');const t=[...h.querySelectorAll('.rp-page')].map(p=>{const c=p.cloneNode(true);c.querySelectorAll('svg,style,script').forEach(x=>x.remove());c.querySelectorAll('*').forEach(x=>x.append(' '));return p.dataset.page+'::'+c.textContent.replace(/\\s+/g,' ')});return t.filter(x=>/\\b(null|undefined|NaN|Infinity)\\b/.test(x.split('::')[1])).map(x=>x.split('::')[0])})()")
                        chk(f'[{tag}] datos {variant}: ninguna lámina muestra «null», «undefined», «NaN» ni «Infinity»', not bad, bad)
                        await f.evaluate("FP.reportView.unmountPrint()")
                await f.emulate_media(media='screen'); await f.evaluate("FP.reportView.unmountPrint(); FP.app.state.rp.edits={}")
            await f.close()
        await b.close()
    print(f'\n{len(passed)} bien, {len(fails)} mal'); print('TODO BIEN' if not fails else 'FALLAS: ' + '; '.join(fails)); sys.exit(1 if fails else 0)
asyncio.run(main())
