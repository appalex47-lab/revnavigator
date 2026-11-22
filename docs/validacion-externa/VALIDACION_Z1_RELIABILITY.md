# Procedimiento de validación real de Z1 y `reliability`

1. Prepara `diario-plan-real.csv` (plan y venta real por día y canal, con sesiones y pedidos si existen) y `config-z1.json` (corte, periodo, calidad por canal, y lo que esperas).
2. `node tools/validacion-externa/e3-z1.js --origen real`.
3. Revisa en el reporte: nivel por entidad, completitud, comparabilidad, **usos permitidos** (mostrar venta · clasificar estado · diagnosticar · recomendar · estimar impacto · conclusión) y las razones («qué falta / qué limita»).
4. Los invariantes A1–A7 deben estar en OK. Si alguno falla es un **defecto reproducible**: se corrige con prueba nueva (no se ajusta el invariante).
5. Si declaraste `esperados`, A8 compara. Una diferencia = revisión analítica conjunta; **no** se modifican reglas de negocio ni especificaciones aceptadas para hacerla coincidir.
6. Para ver lo mismo en pantalla (opcional, sin datos reales en el repositorio): cargar los mismos archivos en la app local y comparar con el chip «Confiabilidad de la lectura» de Inicio.
