"""Modificaciones AUTORIZADAS por el usuario a archivos protegidos (docs/command-center/generated/MODIFICACIONES_AUTORIZADAS.json).
Un archivo protegido solo puede diferir de su línea base si su contenido actual coincide EXACTAMENTE con el hash registrado para la modificación autorizada; cualquier otro cambio se sigue detectando."""
import hashlib, json, pathlib
_F = pathlib.Path(__file__).resolve().parents[2] / 'docs/command-center/generated/MODIFICACIONES_AUTORIZADAS.json'
MODS = json.loads(_F.read_text())['archivos'] if _F.exists() else {}
def hash_ok(path, key, base_hash):
    if not path.exists(): return False
    cur = hashlib.sha256(path.read_bytes()).hexdigest()
    if cur == base_hash: return True
    m = MODS.get(key)
    return bool(m and m['hash_base'] == base_hash and m['hash_nuevo'] == cur)
