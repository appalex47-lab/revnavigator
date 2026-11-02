"""Fase 9 · integral (anio): formato × profundidad con la aplicación real. Uso: python3 batch_integral_anio.py <raíz>"""
import sys; sys.argv = sys.argv[:2]
import asyncio
from integral_common import *
asyncio.run(run('anio'))
