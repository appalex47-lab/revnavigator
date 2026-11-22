"""Command Center · Fase 1 (1.1/1.2/1.3): genera el catálogo de módulos DESDE EL CÓDIGO (no a mano): por archivo, su descripción (cabecera), lo que exporta en FP.*,
sus dependencias declaradas, tamaño y si está cargado en index.html y si lo cubre alguna prueba. Uso: python3 tools/audit/fase1_catalogo.py > docs/command-center/generated/CATALOGO_MODULOS.md"""
import re, os, glob, sys
R = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
html = open(f'{R}/index.html', encoding='utf8').read()
loaded = [m for m in re.findall(r'<script src="(js/[^"?]+)', html)]
tests = {f: open(f, encoding='utf8', errors='ignore').read() for f in glob.glob(f'{R}/tools/test-*.js') + glob.glob(f'{R}/tools/regression/*.py') + [f'{R}/tools/selftest-node.js']}
alltests = '\n'.join(tests.values())
def head(src):
    m = re.match(r'\s*/\*\*?(.*?)\*/', src, re.S)
    if not m: m2 = re.match(r'\s*((?://.*\n)+)', src); txt = m2.group(1) if m2 else ''
    else: txt = m.group(1)
    lines = [re.sub(r'^\s*\*?\s?|^//\s?', '', l).strip() for l in txt.split('\n')]
    lines = [l for l in lines if l]
    return ' '.join(lines[:2])[:260]
rows = []
for f in sorted(glob.glob(f'{R}/js/**/*.js', recursive=True)):
    rel = os.path.relpath(f, R); src = open(f, encoding='utf8').read()
    exports = sorted(set(re.findall(r'FP\.([A-Za-z_]\w*)\s*=\s*[{(a-zA-Z]', src)))[:6]
    needs = sorted(set(re.findall(r'FP\.([A-Za-z_]\w*)', src)) - set(exports))
    declared = re.findall(r'necesita ([^\']{0,80})', src)
    base = os.path.basename(rel)
    covered = base in alltests or rel in alltests
    rows.append((rel, head(src), exports, len(src.splitlines()), rel in loaded or rel.startswith('js/workers'), covered, len(needs), declared[:1]))
by = {}
for r in rows: by.setdefault(r[0].split('/')[1] if r[0].count('/') > 1 else 'raíz', []).append(r)
print('# Catálogo de módulos (generado del código)\n')
print(f'Generado por `tools/audit/fase1_catalogo.py`. Archivos JS: **{len(rows)}**; cargados en `index.html`: **{sum(1 for r in rows if r[4])}**; con referencia en alguna prueba: **{sum(1 for r in rows if r[5])}**.\n')
unl = [r[0] for r in rows if not r[4]]
print('Archivos JS no cargados por `index.html` (ni worker):', ', '.join(f'`{x}`' for x in unl) or 'ninguno', '\n')
for g in sorted(by):
    print(f'## js/{g}  ({len(by[g])} archivos, {sum(r[3] for r in by[g])} líneas)\n')
    print('| Archivo | Qué hace (cabecera) | Exporta | Líneas | Prueba |\n|---|---|---|---|---|')
    for r in by[g]:
        print(f"| `{os.path.basename(r[0])}` | {r[1].replace('|','/')} | {', '.join('`FP.'+e+'`' for e in r[2]) or '—'} | {r[3]} | {'sí' if r[5] else '**no**'} |")
    print()

# ---------- mapa vista → motores (1.2): qué namespaces FP.* de motores usa cada archivo de interfaz ----------
ENG = ('calculations', 'forecast', 'analytics', 'diagnostics', 'projection', 'scenarios', 'impact', 'promotions', 'products', 'quality', 'report', 'ai', 'agents', 'narrative', 'import', 'export', 'model', 'data', 'storage', 'cloud', 'events', 'actions')
owner = {}
for f in glob.glob(f'{R}/js/**/*.js', recursive=True):
    rel = os.path.relpath(f, R); d = rel.split('/')[1] if rel.count('/') > 1 else ''
    if d in ENG:
        for e in re.findall(r'FP\.([A-Za-z_]\w*)\s*=\s*[{(a-zA-Z]', open(f, encoding='utf8').read()): owner.setdefault(e, d)
print('## Mapa archivo de interfaz → familias de motores que consume\n')
print('Generado leyendo las referencias `FP.<módulo>` de cada archivo de `js/ui/` y asignándolas a la carpeta que las define. Una referencia indica dependencia, no necesariamente cálculo propio.\n')
print('| Archivo de interfaz | Familias de motores | Módulos más usados |\n|---|---|---|')
for f in sorted(glob.glob(f'{R}/js/ui/**/*.js', recursive=True)):
    src = open(f, encoding='utf8').read(); refs = re.findall(r'FP\.([A-Za-z_]\w*)', src)
    fam = {}; cnt = {}
    for r in refs:
        if r in owner: fam[owner[r]] = fam.get(owner[r], 0) + 1; cnt[r] = cnt.get(r, 0) + 1
    if not fam: continue
    top = sorted(cnt.items(), key=lambda x: -x[1])[:4]
    print(f"| `{os.path.relpath(f, R + '/js/ui')}` | {', '.join(sorted(fam))} | {', '.join('`'+k+'`' for k, _ in top)} |")
