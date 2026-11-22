#!/usr/bin/env python3
"""Subfase 3.3 — verificador de consistencia (ver _verificador_zona.py). Uso: python3 tools/audit/verificar_consistencia_3_3.py"""
import pathlib, sys
sys.argv = [sys.argv[0], 'Z3']; exec(compile((pathlib.Path(__file__).parent / '_verificador_zona.py').read_text(), '_verificador_zona.py', 'exec'))
