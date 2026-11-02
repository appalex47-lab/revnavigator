"""Fase 9 · integral (canal): formato × profundidad con la aplicación real. Uso: python3 batch_integral_canal.py <raíz>"""
import sys; sys.argv = sys.argv[:2]
import asyncio
from integral_common import *
asyncio.run(run('canal'))
