"""Ejecuta una batería de navegador:  python3 tools/regression/run_batch.py batch_xxx.py <raíz_del_repositorio>
La app declara una política de seguridad de contenido (CSP) sin «unsafe-eval». Las ayudas de Playwright como `wait_for_function('texto')` evalúan texto dentro de la página y la CSP
las bloquea: es una limitación de la herramienta de prueba, no de la app. Este lanzador abre los contextos con `bypass_csp=True` y luego ejecuta la batería tal cual.
La batería que PRUEBA la política (batch_fase1_csp.py) define PW_KEEP_CSP=1 y se puede ejecutar directamente o con este lanzador (entonces no se omite la política)."""
import os, sys, runpy
from playwright.async_api import Browser
_nc, _np = Browser.new_context, Browser.new_page
async def new_context(self, *a, **k):
    if not os.environ.get('PW_KEEP_CSP'): k.setdefault('bypass_csp', True)
    return await _nc(self, *a, **k)
async def new_page(self, *a, **k):
    if not os.environ.get('PW_KEEP_CSP'): k.setdefault('bypass_csp', True)
    return await _np(self, *a, **k)
Browser.new_context, Browser.new_page = new_context, new_page
if len(sys.argv) < 3: sys.exit('uso: python3 run_batch.py batch_xxx.py <raíz>')
script = os.path.join(os.path.dirname(os.path.abspath(__file__)), os.path.basename(sys.argv[1]))
sys.argv = [script] + sys.argv[2:]
runpy.run_path(script, run_name='__main__')
