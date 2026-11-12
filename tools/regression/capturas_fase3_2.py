"""Regenera las capturas de evidencia de la Subfase 3.2 desde el wireframe (diseño propuesto) y desde la captura de la aplicación existente.
Uso: python3 tools/regression/capturas_fase3_2.py   (no forma parte de las pruebas; las pruebas solo verifican que existan)"""
import asyncio, pathlib
from playwright.async_api import async_playwright
R = pathlib.Path('/home/user/digital_sales_forecast_-_pacing')
OUT = R / 'docs/command-center/wireframes/capturas_3_2'
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(); pg = await b.new_page(viewport={'width': 1500, 'height': 900})
        await pg.goto('file://' + str(R / 'docs/command-center/wireframes/z1_3_2_wireframe.html')); await pg.wait_for_timeout(500)
        async def shot(sel, name):
            el = await pg.query_selector(sel); await el.screenshot(path=str(OUT / name))
        await shot('[data-wf=jerarquia]', 'diseno_propuesto_00_jerarquia.png')
        await shot('[data-wf=frame-desktop]', 'diseno_propuesto_01_escritorio.png')
        await shot('[data-wf=frame-tablet]', 'diseno_propuesto_02_tableta.png')
        await shot('[data-wf=frame-mobile]', 'diseno_propuesto_03_movil.png')
        for n in range(1, 15): await shot(f'[data-wf=escenario-{n:02d}]', f'diseno_propuesto_escenario_{n:02d}.png')
        for n in [f'A{k}' for k in range(1, 17)]: await shot(f'[data-wf=escenario-{n}]', f'diseno_propuesto_escenario_{n}.png')
        await shot('[data-wf=estados-movil]', 'diseno_propuesto_05_estados_movil.png')
        await shot('[data-wf=estados-tableta]', 'diseno_propuesto_06_estados_tableta.png')
        await shot('[data-wf=estres]', 'diseno_propuesto_04_legibilidad_estres.png')
        await shot('[data-wf=aplicacion-existente]', 'aplicacion_existente_home_actual.png')
        await b.close()
asyncio.run(main())
