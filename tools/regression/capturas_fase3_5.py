"""Regenera las capturas de evidencia de 3.5 desde el prototipo (diseño propuesto, datos simulados): 6 situaciones × 3 anchos emulados + 2 interacciones.
Uso: python3 tools/regression/capturas_fase3_5.py   (no forma parte de las pruebas; estas solo verifican que existan)"""
import asyncio, pathlib
from playwright.async_api import async_playwright
R = pathlib.Path(__file__).resolve().parents[2]; OUT = R / 'docs/command-center/prototipo/capturas_3_5'; OUT.mkdir(exist_ok=True)
SIT = ['alta', 'media', 'baja', 'insuficiente', 'sinactividad', 'enorden']
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch()
        for w, h, nm in [(1366, 900, 'escritorio'), (768, 1024, 'tableta'), (390, 844, 'movil')]:
            pg = await b.new_page(viewport={'width': w, 'height': h}); await pg.goto('file://' + str(R / 'docs/command-center/prototipo/home_3_5_prototipo.html')); await pg.wait_for_timeout(300)
            for s in SIT:
                await pg.click(f'[data-sit-btn={s}]'); await pg.wait_for_timeout(80); await pg.screenshot(path=str(OUT / f'prototipo_{nm}_{s}.png'), full_page=True)
            if nm == 'escritorio':
                await pg.click('[data-sit-btn=alta]'); await pg.click('.sit:not([hidden]) .nc .lk'); await pg.click('.sit:not([hidden]) [id^=z3] details.all summary'); await pg.click('.sit:not([hidden]) [id^=z3] [data-filter=riesgo]')
                await pg.wait_for_timeout(100); await pg.screenshot(path=str(OUT / 'prototipo_interaccion_contexto_y_filtro.png'), full_page=True)
            await pg.close()
        await b.close()
asyncio.run(main())
