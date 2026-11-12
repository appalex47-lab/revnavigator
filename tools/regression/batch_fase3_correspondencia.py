"""Command Center · Fase 3 · ronda de calidad — CORRESPONDENCIA entre el prototipo 3.5 y el Home REAL de la aplicación. SOLO LEE (no cambia nada).
Comprueba, en el Home real con datos de prueba, qué elementos del prototipo EXISTEN HOY y cuáles no, para que la matriz de correspondencia (MATRIZ_CORRESPONDENCIA_PROTOTIPO_APP.md) se sostenga con evidencia.
Uso: python3 run_batch.py batch_fase3_correspondencia.py <raíz>"""
import sys, asyncio, json, pathlib
ROOT = sys.argv[1]; sys.argv = sys.argv[:2]
from ed_common import *
R = pathlib.Path(ROOT)
PROBE = r"""(()=>{const h=document.getElementById('home'); const q=(s)=>!!h.querySelector(s); const t=h.innerText||''; const hs=[...document.querySelectorAll('h1,h2,h3')].map(e=>e.tagName);
 return {verdict:q('[data-home-verdict]'), trust:q('[data-home-trust]'), summary:q('[data-home-summary]'), att:q('.att__list'), hoy:q('.home-hoy'), mejorPaso:/Tu siguiente mejor paso/.test(t), desdeAyer:/Desde ayer/.test(t), porQue:/¿Por qué va así\?/.test(t),
   canal:q('table') || /canal/i.test(t), recorrido:/Recorrido/.test(t), verMas:q('details.home-more'),
   quickAnswers:!!document.querySelector('.qa, [data-qa]'), estadoNegocio:/En riesgo de incumplir|En deterioro|En línea con el plan|Sin base para evaluar/.test(t), filtrosClase:!![...h.querySelectorAll('button')].find(b=>/Hallazgos \(|Riesgos \(|Oportunidades \(/.test(b.textContent)),
   claseRiesgo:/Riesgo|▲/.test(t) && !!h.querySelector('[data-class="riesgo"],.cd3'), nuevoMarca:/Nuevo:/.test(t), skip:!!document.querySelector('a.skip, a[href="#main"]'), h1:hs.filter(x=>x==='H1').length, h2:hs.filter(x=>x==='H2').length, main:document.querySelectorAll('main').length,
   confianzaNivel:/Confiabilidad (alta|media|baja|insuficiente)/i.test(t), hipotesis:/Hipótesis/.test(t), margen:/contribución bruta/i.test(t), recomendaciones:/Recomend/i.test(t)}})()"""
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(); q = await boot(b, patch=True); errs = []
        q.on('pageerror', lambda e: errs.append(str(e))); q.on('console', lambda m: errs.append(m.text) if m.type == 'error' else None)
        await q.goto(U + '#inicio'); await q.wait_for_timeout(2500)
        r = await q.evaluate(PROBE); out = r
        chk('CP1 el Home real renderiza con veredicto, confiabilidad y resumen (existen hoy)', r['verdict'] and r['trust'] and r['summary'], r)
        chk('CP2 el Home real tiene la lista de atención (.att__list) y el bloque «¿Qué hago hoy?» / siguiente mejor paso', r['att'] and (r['hoy'] or r['mejorPaso']), r)
        chk('CP3 el Home real tiene «Desde ayer», «¿Por qué va así?» y pliegues «Ver más» (Z2/Z5 parciales)', r['desdeAyer'] and r['porQue'] and r['verMas'], r)
        chk('CP4 NO existen hoy en el Home real las respuestas rápidas del prototipo (3.5)', not r['quickAnswers'], r)
        chk('CP5 NO existen hoy los filtros por clase (hallazgos / riesgos / oportunidades) ni la clase «riesgo» como elemento', not r['filtrosClase'] and not r['claseRiesgo'], r)
        chk('CP6 NO existe hoy la marca «Nuevo» de Desde ayer sobre los elementos de atención', not r['nuevoMarca'], r)
        chk('CP7 NO existe hoy la etiqueta de estado del negocio de Z1 (En riesgo de incumplir / En deterioro / …)', not r['estadoNegocio'], r)
        chk('CP8 NO existe hoy el enlace «saltar al contenido» del prototipo (accesibilidad no integrada)', not r['skip'], r)
        chk('CP9 el Home real no muestra la leyenda de nivel de confiabilidad con los 4 niveles de Fase 3 (Alta/Media/Baja/Insuficiente)', not r['confianzaNivel'], r)
        chk('CP10 sin errores de consola ni excepciones al cargar el Home real', not errs, errs[:3])
        pathlib.Path(ROOT, 'docs/command-center/generated/CORRESPONDENCIA_HOME_REAL.json').write_text(json.dumps(out, indent=1, ensure_ascii=False) + '\n')
        await b.close()
    print(f'\n{len(passed)} bien, {len(fails)} mal'); print('TODO BIEN' if not fails else 'FALLAS: ' + '; '.join(fails)); sys.exit(1 if fails else 0)
asyncio.run(main())
