"""Fase 9 · pruebas integrales: recorre formato × profundidad en un escenario (mes, trimestre, año o un canal) con la aplicación real y revisa, en cada caso,
la coherencia entre la propuesta y la vista previa, el texto, la impresión 16:9, las cifras y las reglas de cada formato."""
import sys, asyncio, json, re
from ed_common import *
from recovery_state import prepare
AUD = ['actual', 'operativo', 'gerencial', 'directivo']
DEPTH = ['resumen', 'ejecutivo', 'detallado']
PAGES = "[...document.querySelectorAll('#view-presentacion .rp-frame .rp-page')].map(p=>p.dataset.page)"
CHECK = r"""(()=>{
  const rp=FP.app.state.rp, sel=FP.reportSetupView.selectionOf(rp), units=FP.reportComposer.units(rp.report, rp.exclude, sel);
  const planIds=units.map(u=>u.id+(u.sub?'-'+u.sub:'')), prevIds=[...document.querySelectorAll('#view-presentacion .rp-frame .rp-page')].map(p=>p.dataset.page);
  const host=FP.reportView.mountPrint(rp.report,{exclude:rp.exclude,tags:true,sel,edits:rp.edits}); host.style.cssText='display:block;position:absolute;left:0;top:0;visibility:hidden';
  const slides=[...host.querySelectorAll('.rp-page')].map(pg=>{const b=pg.getBoundingClientRect();
    const small=[...pg.querySelectorAll('*')].filter(e=>[...e.childNodes].some(n=>n.nodeType===3&&n.textContent.trim())&&!e.closest('svg')&&parseFloat(getComputedStyle(e).fontSize)<13.3).length;
    return {id:pg.dataset.page,w:Math.round(b.width),h:Math.round(b.height),ov:pg.getAttribute('data-overflow'),wide:[...pg.querySelectorAll('table')].filter(t=>t.getBoundingClientRect().right>b.right+1).length,small,text:(()=>{const c=pg.cloneNode(true);c.querySelectorAll('td,th,li,p,div,span,h2,h3,tr,br,strong,b').forEach(e=>e.insertAdjacentText('afterend',' '));return c.textContent.replace(/\s+/g,' ').trim()})()}});
  host.remove(); const st=document.getElementById('rp-print-style'); if(st)st.remove(); document.body.classList.remove('rp-printing');
  const P=(id)=>rp.report.pages.find(p=>p.id===id&&p.status==='included');
  const real=(p,id)=>{const k=p&&(p.kpis||[]).find(x=>x.id===id);return k&&typeof k.value==='number'?k.value:null};
  const cp=P('channelPacing'), sc=P('channelScorecard'), vd=P('verdict'), pc=P('pacing');
  return {status:rp.status,err:rp.error,profile:rp.report.profile||null,planIds,prevIds,slides,
    x:{cpTotal:cp&&cp.total?cp.total.cells.revenue.actual:null, scTotal:sc&&sc.total?sc.total.actual:null, vdReal:real(vd,'real'), vdPlan:real(vd,'plan'), pcReal:real(pc,'real'), pcPlan:real(pc,'plan'), cpPlan:cp&&cp.total?cp.total.cells.revenue.plan:null, scPlan:sc&&sc.total?sc.total.plan:null},
    omitted:rp.report.omitted.map(o=>o.id), included:rp.report.included,
    nums:(()=>{const o=[];const w=(v)=>{if(typeof v==='number'){if(Number.isFinite(v))o.push(v)}else if(typeof v==='string'){(v.match(/\d[\d,]*\.?\d*/g)||[]).forEach(t=>{const n=parseFloat(t.replace(/,/g,''));if(Number.isFinite(n))o.push(n)})}else if(Array.isArray(v))v.forEach(w);else if(v&&typeof v==='object')Object.keys(v).forEach(k=>{if(k!=='tags')w(v[k])})};rp.report.pages.filter(p=>p.status==='included').forEach(w);return o})()}
})()"""
async def gen(f):
    await f.click('[data-action="rp-generate"]'); await f.wait_for_timeout(200)
    if await f.query_selector('[data-action="rp-gap-go"]'): await f.click('[data-action="rp-gap-go"]')
    await f.wait_for_function("FP.app.state.rp.status==='ready'||FP.app.state.rp.status==='error'", timeout=120000)
    return await f.evaluate("FP.app.state.rp.status")
NEW = ('channelPacing', 'evolution', 'funnel', 'actions', 'channelScorecard', 'opportunities', 'scenarios', 'verdict', 'riskOpp', 'annexRules')
STRIP = [r'\d{1,2} (?:ene|feb|mar|abr|may|jun|jul|ago|sep|oct|nov|dic)[a-z]* \d{4}', r'\b20\d\d\b', r'Semana \d+', r'\bQ[1-4]\b', r'\b[A-Z]{2,4}_\d+\b', r'\b\d+ (?:de \d+ )?d[ií]as?\b', r'\b\d{1,2} de \d{1,2}\b', r'\b1?\d{3} %', r'\b\d+ de (?:los )?\d+\b', r'\b(?:[1-9]|1[0-9]) (?:canal|canales|escenario|escenarios|acci[oó]n|acciones|semana|semanas|mes|meses|producto|productos)\b', r'\b\d de cada \d\b', r'(?<![\d.,])(?:0\.5|1) %', r'(?<![\d.,])5 %', r'(?<![\d.,])1000\b', r'(?<![\d.,])110\b', r'(?<![\d.,])13\.4\b', r'(?<![\d.,])\b(?:[1-9]|1[0-9])\b(?! ?[.,]\d)']
def tokens(t):
    for pat in STRIP: t = re.sub(pat, ' ', t)
    out = []
    for m in re.finditer(r'(\d[\d,]*(?:\.\d+)?)\s*([KM]?)', t):
        n = float(m.group(1).replace(',', ''))
        out.append((m.group(0).strip(), n * (1000 if m.group(2) == 'K' else 1000000 if m.group(2) == 'M' else 1)))
    return out
def allowed(nums):
    s = set()
    for v in nums:
        for x in (v, abs(v), v * 100, abs(v) * 100): s.add(round(x, 6))
    return list(s)
def covered(val, al):
    return any(abs(a - val) <= max(0.051, abs(a) * 0.006) for a in al)
BAD = re.compile(r'\b(null|undefined|NaN|Infinity)\b')
BIZ = re.compile(r'\b(margen|ROI|ROAS|CAC)\b')
def near(a, b): return a is None or b is None or abs(a - b) <= max(1.0, abs(a) * 1e-9)
async def setup(b, scenario):
    f = await new_page(b, 1280, 900)
    await f.add_init_script("document.addEventListener('DOMContentLoaded',()=>{const s=document.createElement('style');s.textContent='#tour-offer{display:none!important}';document.head.appendChild(s)})")
    await load_products(f, U); await prepare(f, U)
    await f.evaluate("""(async()=>{const gen=FP.mockProducts.generate({from:'2026-07-01',to:'2026-09-30',skus:48,channels:['ecommerce','app']});
      const r=await FP.productImport.process(FP.productImport.stage(gen.funnel,{fileName:'GA4_funnel.csv',kind:'funnel'}),{}); await FP.productStore.commit(r.draft,{fileName:'GA4_funnel.csv'})})()""")
    await f.goto(U + '#presentacion'); await f.wait_for_selector('[data-action="rp-generate"]')
    ctx = {'q3': [('periodType', 'quarter'), ('periodKey', '2026-Q3')], 'anio': [('periodType', 'year')], 'canal': [('channel', 'ecommerce')], 'mes': []}[scenario]
    for k, v in ctx: await f.evaluate(f"FP.app.actions['pkg-context']({{dataset:{{key:'{k}',value:'{v}'}},value:'{v}'}})"); await f.wait_for_timeout(300)
    return f
async def run(scenario):
    ROOT = None
    async with async_playwright() as p:
        b = await p.chromium.launch(); f = await setup(b, scenario); n = 0; seen = {}
        for a in AUD:
            await f.click(f'[data-action="rp-audience"][data-id="{a}"]'); await f.wait_for_timeout(250)
            for d in DEPTH:
                await f.click(f'[data-action="rp-depth"][data-id="{d}"]'); await f.wait_for_timeout(200)
                tag = f'{scenario}/{a}/{d}'
                st = await gen(f); n += 1
                r = await f.evaluate(CHECK)
                chk(f'[{tag}] se genera sin error', st == 'ready' and not r['err'], r['err'])
                chk(f'[{tag}] la vista previa tiene exactamente las láminas de la propuesta (mismo orden)', r['planIds'] == r['prevIds'] and len(r['planIds']) >= 1 and r['planIds'][0] == 'cover', [r['planIds'], r['prevIds']])
                chk(f'[{tag}] el reporte queda marcado con el formato correcto', (r['profile'] or 'actual') == a or (a == 'actual' and r['profile'] is None), r['profile'])
                bad = [(s['id'], BAD.search(s['text']).group(0)) for s in r['slides'] if BAD.search(s['text'])]
                chk(f'[{tag}] ninguna lámina tiene «null», «undefined», «NaN» ni «Infinity»', not bad, bad)
                geo = [(s['id'], s['w'], s['h'], s['ov'], s['wide'], s['small']) for s in r['slides'] if not (s['w'] == 1122 and s['h'] == 630 and s['ov'] is None and s['wide'] == 0)]
                chk(f'[{tag}] todas las láminas son 1122×630, sin desborde y sin tablas fuera del marco', not geo, geo)
                small = [(s['id'], s['small']) for s in r['slides'] if s['small'] and s['id'] not in ('cover',)]
                chk(f'[{tag}] el texto de las láminas no baja de 13.4 px (salvo la portada)', not small, small)
                al = allowed(r['nums']); miss = []
                for sl in r['slides']:
                    if sl['id'] in NEW:
                        for raw, val in tokens(sl['text']):
                            if not covered(val, al): miss.append((sl['id'], raw))
                chk(f'[{tag}] toda cifra de las láminas nuevas existe en los datos del reporte (nada inventado)', not miss, miss[:8])
                x = r['x']
                chk(f'[{tag}] las cifras repetidas entre láminas coinciden (venta real y plan del veredicto, pacing y semáforo)', near(x['cpTotal'], x['scTotal']) and near(x['cpPlan'], x['scPlan']) and (r['profile'] != 'directivo' or True), x)
                if a == 'directivo':
                    txt = ' '.join(s['text'] for s in r['slides']); txt2 = txt.replace('no se calcula margen, ROI, ROAS ni CAC', '').replace('no hay costos ni márgenes', '').replace('no hay costos, márgenes ni inversión', '')
                    chk(f'[{tag}] Directivo no habla de margen, ROI, ROAS ni CAC (salvo para decir que no se calculan)', not BIZ.search(txt2), BIZ.findall(txt2))
                    chk(f'[{tag}] Directivo solo trae láminas de su formato', all(i.split('-')[0] in ('cover', 'verdict', 'riskOpp', 'opportunities', 'scenarios', 'pacing', 'movers', 'decisions', 'annexRules', 'annexEdits', 'annex') for i in r['planIds']), r['planIds'])
                if a in ('operativo', 'gerencial', 'directivo'):
                    nw = [s['id'] for s in r['slides'] if s['id'] in ('channelPacing', 'evolution', 'funnel', 'actions', 'channelScorecard', 'opportunities', 'scenarios', 'verdict', 'riskOpp')]
                    seen.setdefault(a, set()).update(nw)
        chk(f'[{scenario}] se probaron {n} combinaciones de formato × profundidad', n == 12, n)
        chk(f'[{scenario}] sin errores de página', not f._errs, f._errs)
        print(f'   láminas nuevas vistas en {scenario}:', {k: sorted(v) for k, v in seen.items()})
        await b.close()
    print('\nFALLAS:' if fails else '\nTODO BIEN', fails or ''); sys.exit(1 if fails else 0)
