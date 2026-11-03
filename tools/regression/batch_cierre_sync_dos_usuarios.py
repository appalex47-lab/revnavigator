"""Cierre técnico · hallazgo 4 en la aplicación real: DOS personas (dos navegadores) editan la presentación sin verse.
⚠ SIMULADO: el servidor es un Supabase en memoria (route de Playwright, tabla team_blobs con updated_at). Se ejecuta la aplicación real (cloudSync, vista, acciones),
pero NO el Supabase real: RLS, red y condiciones de carrera del servidor quedan sin validar (ver informe). Uso: python3 batch_cierre_sync_dos_usuarios.py <raíz>"""
import sys, asyncio, json, os, datetime as dt
from urllib.parse import urlparse
ROOT = os.path.abspath(sys.argv[1]); sys.argv = sys.argv[:2]
from ed_common import *
from recovery_state import prepare
CORS = {'access-control-allow-origin': '*', 'access-control-allow-headers': '*', 'access-control-allow-methods': '*'}
rows = []; USERS = {'T-ana': 'u1', 'T-beto': 'u2'}
def cloud_note():
    r = sorted([x for x in rows if x['key'] == 'reportPrefs'], key=lambda x: x['part'])
    if not r: return None
    d = json.loads(''.join(x['payload'] for x in r))['data']; return {k: v.get('note') for k, v in (d.get('edits') or {}).items()}
async def wire(q):
    async def h(route):
        r = route.request; u = urlparse(r.url)
        if r.method == 'OPTIONS': return await route.fulfill(status=204, headers=CORS)
        def jr(st, o): return route.fulfill(status=st, content_type='application/json', headers=CORS, body=json.dumps(o))
        tk = (r.headers.get('authorization') or '').replace('Bearer ', '')
        if tk not in USERS: return await jr(401, {'message': 'JWT'})
        if u.path == '/rest/v1/team_members': return await jr(200, [{'team_id': 'T', 'teams': {'name': 'Equipo'}}])
        if u.path == '/rest/v1/rpc/put_blob_cas':   # réplica de la función SQL por versión (el servidor real se probó aparte, por SQL)
            b = json.loads(r.post_data); cur = next((y for y in rows if y['key'] == b['p_key'] and y['part'] == 0), None); ev = b['p_expected_version']
            if (cur and (ev is None or int(ev) != cur.get('version', 1))) or (not cur and ev not in (None, 0)): return await jr(200, {'ok': False, 'conflict': True, 'version': cur.get('version', 1) if cur else 0})
            nv = (cur.get('version', 1) + 1) if cur else 1
            rows[:] = [y for y in rows if y['key'] != b['p_key']] + [{'key': b['p_key'], 'version': nv, **x} for x in b['p_rows']]
            return await jr(200, {'ok': True, 'version': nv})
        if u.path.startswith('/rest/v1/team_blobs'):
            qs = dict(p.split('=', 1) for p in u.query.split('&') if '=' in p)
            if r.method == 'POST':
                for x in json.loads(r.post_data):
                    old = next((y for y in rows if y['key'] == x['key'] and y['part'] == x['part']), None); x['version'] = (old.get('version', 1) + (1 if x['part'] == 0 else 0)) if old else 1
                    rows[:] = [y for y in rows if not (y['key'] == x['key'] and y['part'] == x['part'])] + [x]
                return await route.fulfill(status=201, headers=CORS, body='')
            sel = list(rows); k = qs.get('key', ''); p_ = qs.get('part', '')
            if k.startswith('eq.'):
                from urllib.parse import unquote; sel = [x for x in sel if x['key'] == unquote(k[3:])]
            if p_.startswith('eq.'): sel = [x for x in sel if x['part'] == int(p_[3:])]
            if p_.startswith('gte.'): sel = [x for x in sel if x['part'] >= int(p_[4:])]
            if r.method == 'DELETE':
                for x in sel: rows.remove(x)
                return await route.fulfill(status=204, headers=CORS, body='')
            return await jr(200, [{kk: x[kk] for kk in ('key', 'part', 'total', 'payload', 'updated_at', 'bytes', 'version')} for x in sel])
        return await jr(404, {})
    await q.route('https://odsaouldxxjurniizefc.supabase.co/**', h)
async def person(b, name):
    f = await new_page(b, 1280, 900)
    await wire(f)
    await f.add_init_script("document.addEventListener('DOMContentLoaded',()=>{const s=document.createElement('style');s.textContent='#tour-offer{display:none!important}';document.head.appendChild(s)})")
    await f.add_init_script(f"try{{localStorage.setItem('fp.cloudSession',JSON.stringify({{access_token:'T-{name}',refresh_token:'r-{name}',expires_at:Math.floor(Date.now()/1000)+36000,user_id:'u',email:'{name}@x.com',anonymous:false,team_id:'T',team_name:'Equipo'}}));localStorage.setItem('fp.cloudAuto','1')}}catch(e){{}}")
    await load_products(f, U); await prepare(f, U)
    return f
async def edit_note(f, text, aud='gerencial', nav=True):
    if nav: await f.goto(U + '#presentacion')   # navegar = volver a abrir la app (trae lo nuevo de la nube); con nav=False la persona sigue en su pantalla sin enterarse de lo de la otra
    await f.wait_for_selector('[data-action="rp-generate"]'); await f.wait_for_timeout(500)
    await f.click(f'[data-action="rp-audience"][data-id="{aud}"]'); await f.wait_for_timeout(300)
    await f.click('[data-action="rp-generate"]'); await f.wait_for_timeout(200)
    if await f.query_selector('[data-action="rp-gap-go"]'): await f.click('[data-action="rp-gap-go"]')
    await f.wait_for_function("FP.app.state.rp.status==='ready'||FP.app.state.rp.status==='error'", timeout=120000)
    await f.click('#rp-prop button[data-action="rp-edit-open"][data-id="pacing"]'); await f.wait_for_timeout(300)
    await f.fill('#rp-ed-note', text); await f.dispatch_event('#rp-ed-note', 'change'); await f.wait_for_timeout(300)
async def reload_to_pres(f):
    await f.goto(U + '#presentacion'); await f.reload(); await f.wait_for_selector('[data-action="rp-generate"]', timeout=60000); await f.wait_for_timeout(1500)
LOCAL_NOTE = "(()=>{const e=FP.app.state.rp.edits;return Object.fromEntries(Object.entries(e).map(([k,v])=>[k,v.note]))})()"
async def at(minute, *pages):
    """Línea de tiempo compartida: fija la hora de los dos navegadores (el reloj de las pruebas está congelado, así que cada paso avanza minutos)."""
    for q in pages: await q.clock.set_fixed_time(dt.datetime(2026, 10, 7, 9, minute))
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch()
        A = await person(b, 'ana'); B = await person(b, 'beto')
        await A.wait_for_function("FP.cloud.autoOn()", timeout=20000)
        # 1. Ana edita la nota y se sincroniza sola
        await at(1, A, B); await edit_note(A, 'Nota de Ana v1'); await A.wait_for_timeout(6500)
        chk('D1 (Ana) su edición sube sola a la nube', (cloud_note() or {}).get('gerencial|pacing') == 'Nota de Ana v1', cloud_note())
        # 2. Beto abre la app: trae la de Ana (no tiene nada propio) sin conflicto
        await at(2, A, B); await reload_to_pres(B)
        chk('D2 (Beto) sin cambios propios, recibe la nota de Ana sin conflicto y sin avisos', (await B.evaluate(LOCAL_NOTE)).get('gerencial|pacing') == 'Nota de Ana v1' and await B.query_selector('#rp-conflict') is None, await B.evaluate(LOCAL_NOTE))
        # 3. Ana edita otra vez (v2) y sube; Beto, sin haber recargado, edita la MISMA lámina
        await at(10, A, B); await edit_note(A, 'Nota de Ana v2'); await A.wait_for_timeout(6500)
        chk('D3 (Ana) su segunda versión queda en la nube', (cloud_note() or {}).get('gerencial|pacing') == 'Nota de Ana v2', cloud_note())
        await at(12, A, B); await edit_note(B, 'Nota de Beto (sin haber visto la v2)', nav=False); await B.wait_for_timeout(6500)
        chk('D4 (Beto) se detecta el conflicto: aparece el aviso en Presentación con las tres salidas', await B.query_selector('#rp-conflict') is not None and await B.locator('#rp-conflict [data-action="rp-conflict"]').count() == 3, await B.evaluate("document.body.innerText.slice(0,200)"))
        chk('D5 (Beto) NO se sobrescribió nada: la nube sigue con la v2 de Ana y la copia local de Beto sigue con la suya', (cloud_note() or {}).get('gerencial|pacing') == 'Nota de Ana v2' and (await B.evaluate(LOCAL_NOTE)).get('gerencial|pacing') == 'Nota de Beto (sin haber visto la v2)', [cloud_note(), await B.evaluate(LOCAL_NOTE)])
        txt = await B.evaluate("document.getElementById('rp-conflict').innerText")
        chk('D6 el aviso explica qué pasó y que no se sobrescribió nada', 'No se sobrescribió nada' in txt and 'lámina' in txt, txt)
        # 4. Beto elige «Combinar»: queda su nota donde chocan, y las demás ediciones se unen
        await at(13, A, B); await B.click('#rp-conflict [data-action="rp-conflict"][data-choice="merge"]'); await B.wait_for_timeout(1500)
        chk('D7 (Beto) tras combinar el aviso desaparece y la nube recibe la elección', await B.query_selector('#rp-conflict') is None and (cloud_note() or {}).get('gerencial|pacing') == 'Nota de Beto (sin haber visto la v2)', cloud_note())
        # 5. Ana recarga: recibe la elegida sin conflicto
        await at(14, A, B); await reload_to_pres(A)
        chk('D8 (Ana) al volver a abrir recibe lo elegido por Beto, sin conflicto', (await A.evaluate(LOCAL_NOTE)).get('gerencial|pacing') == 'Nota de Beto (sin haber visto la v2)' and await A.query_selector('#rp-conflict') is None, await A.evaluate(LOCAL_NOTE))
        # 6. otra ronda: «Usar la del equipo»
        await at(20, A, B); await edit_note(A, 'Ana v3'); await A.wait_for_timeout(6500)
        await at(22, A, B); await edit_note(B, 'Beto v3 (conflicto otra vez)', nav=False); await B.wait_for_timeout(6500)
        chk('D9 (Beto) vuelve a detectarse el conflicto', await B.query_selector('#rp-conflict') is not None)
        await at(23, A, B); await B.click('#rp-conflict [data-action="rp-conflict"][data-choice="theirs"]'); await B.wait_for_timeout(1200)
        chk('D10 (Beto) «Usar la del equipo»: aviso fuera, su copia pasa a la de Ana y la nube no cambia', await B.query_selector('#rp-conflict') is None and (await B.evaluate(LOCAL_NOTE)).get('gerencial|pacing') == 'Ana v3' and (cloud_note() or {}).get('gerencial|pacing') == 'Ana v3', [cloud_note(), await B.evaluate(LOCAL_NOTE)])
        # 7. «Conservar la mía»
        await at(30, A, B); await edit_note(A, 'Ana v4'); await A.wait_for_timeout(6500)
        await at(32, A, B); await edit_note(B, 'Beto v4 (la mía)', nav=False); await B.wait_for_timeout(6500)
        await at(33, A, B); await B.click('#rp-conflict [data-action="rp-conflict"][data-choice="mine"]'); await B.wait_for_timeout(1500)
        chk('D11 (Beto) «Conservar la mía»: la nube queda con la de Beto', (cloud_note() or {}).get('gerencial|pacing') == 'Beto v4 (la mía)' and await B.query_selector('#rp-conflict') is None, cloud_note())
        # 8. un conflicto sin resolver impide dar por respaldado el cierre de sesión (Ana editó sobre su v4 sin haber visto lo que Beto conservó)
        await at(40, A, B); await edit_note(A, 'Ana v5', nav=False); await A.wait_for_timeout(6500)
        await at(42, A, B)
        pend = await A.evaluate("FP.app.state.cloud.conflicts.length")
        chk('D12 (Ana) editó sobre una versión vieja: queda registrado el conflicto y NO se pisó la nube de Beto', pend == 1 and (cloud_note() or {}).get('gerencial|pacing') == 'Beto v4 (la mía)', [pend, cloud_note()])
        await A.evaluate("FP.app.actions['cloud-signout']()"); await A.wait_for_function("document.querySelector('#signout-dialog') && !document.querySelector('#signout-dialog').innerText.includes('Comprobando')", timeout=20000)
        sd = await A.evaluate("document.querySelector('#signout-dialog').innerText")
        chk('D13 (Ana) al cerrar sesión se avisa que la presentación tiene un conflicto sin resolver (no está respaldada)', 'conflicto sin resolver' in sd, sd[:400])
        await A.evaluate("FP.app.actions['signout-cancel']()")
        await b.close()
    print(f'\n{len(passed)} bien, {len(fails)} mal'); print('TODO BIEN' if not fails else 'FALLAS: ' + '; '.join(fails)); sys.exit(1 if fails else 0)
asyncio.run(main())
