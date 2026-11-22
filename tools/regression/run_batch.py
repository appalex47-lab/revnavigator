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
import re
# Las baterías informan sus fallas por texto (✘ / «FALLAS: …») y casi todas terminan con código 0 aunque fallen. Este lanzador cuenta esas líneas y devuelve código 1 si hay alguna:
# así la regresión no depende de leer cada log. Lo que se considera falla: una línea que empieza con «✘», o «FALLAS:» (también «RESULTADO x: FALLAS:») con algo distinto de 0 / ninguna / [].
_FALLA = re.compile(r'^\s*(✘|(RESULTADO[^:]*:\s*)?FALLAS?:(?!\s*(?:0|ninguna|\[\]|none)\s*$))')
class _Tee:
    def __init__(self, out): self.out, self.buf, self.fallas = out, '', 0
    def write(self, s):
        self.buf += s
        while '\n' in self.buf:
            ln, self.buf = self.buf.split('\n', 1)
            if _FALLA.match(ln): self.fallas += 1
        return self.out.write(s)
    def flush(self): return self.out.flush()
    def __getattr__(self, k): return getattr(self.out, k)
_tee = _Tee(sys.stdout); sys.stdout = _tee
try:
    runpy.run_path(script, run_name='__main__')
finally:
    sys.stdout = _tee.out
if _tee.fallas:
    print(f'[run_batch] {_tee.fallas} línea(s) de falla detectadas → código de salida 1'); sys.exit(1)
