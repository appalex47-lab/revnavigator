"""Regenera las capturas de evidencia de 3.3 (Z3) y 3.4 (Z4) desde sus wireframes (diseño propuesto) y de la aplicación existente.
Uso: python3 tools/regression/capturas_fase3_3_3_4.py   (no forma parte de las pruebas; estas solo verifican que existan)"""
import asyncio, pathlib
from playwright.async_api import async_playwright
R = pathlib.Path(__file__).resolve().parents[2]; W = R / 'docs/command-center/wireframes'
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch()
        for z, folder, f, pref in [('z3', 'capturas_3_3', 'z3_3_3_wireframe.html', 'z3'), ('z4', 'capturas_3_4', 'z4_3_4_wireframe.html', 'z4')]:
            pg = await b.new_page(viewport={'width': 1500, 'height': 900}); await pg.goto('file://' + str(W / f)); await pg.wait_for_timeout(400)
            out = W / folder
            async def shot(sel, name):
                el = await pg.query_selector(sel); await el.screenshot(path=str(out / name))
            await shot('[data-wf=frame-desktop]', f'diseno_propuesto_01_escritorio.png'); await shot('[data-wf=frame-tablet]', 'diseno_propuesto_02_tableta.png'); await shot('[data-wf=frame-mobile]', 'diseno_propuesto_03_movil.png')
            for n in range(1, 15): await shot(f'[data-wf=escenario-{n:02d}]', f'diseno_propuesto_escenario_{n:02d}.png')
            await shot('[data-wf=estres]', 'diseno_propuesto_04_legibilidad_estres.png'); await shot('[data-wf=aplicacion-existente]', 'aplicacion_existente_home_actual.png')
            if z == 'z3': await shot('[data-wf=clases]', 'diseno_propuesto_00_clases.png')
            else: await shot('[data-wf=tipos]', 'diseno_propuesto_00_tipos.png')
            await pg.close()
        await b.close()
asyncio.run(main())
