#!/usr/bin/env node
/* Genera docs/command-center/ESCENARIOS_COMERCIALES_CRITICOS.md y generated/ESCENARIOS_COMERCIALES.json desde tools/audit/escenarios-comerciales.js (datos SIMULADOS). */
const fs = require('fs'), path = require('path'), E = require('./escenarios-comerciales.js');
const D = path.join(__dirname, '../../docs/command-center'), r = E.run();
fs.writeFileSync(path.join(D, 'generated/ESCENARIOS_COMERCIALES.json'), JSON.stringify(r, null, 1) + '\n');
const esc = (s) => String(s).replace(/\|/g, '\\|');
const L = ['# Escenarios comerciales críticos — Z1, Z3 y Z4 (ronda de calidad, Fase 3)', '',
  '> Estado: **pendiente de aceptación formal** · Datos **simulados** (ninguno es de FESA) · No cambia cálculos ni reglas comerciales: ejercita las existentes y deja **decisiones pendientes** donde la definición de negocio no existe.',
  '> Generado por `tools/audit/escenarios-comerciales-generar.js`; comprobado por `tools/test-fase3-escenarios-comerciales.js`.', '',
  `Resultado: **${r.filter((x) => !x.fallas.length && !x.contradicciones.length).length} de ${r.length}** escenarios cumplen todas sus comprobaciones y no presentan contradicción entre Z1, Z3 y Z4.`, '',
  '| Id | Escenario | Datos | Interpretación | Confiabilidad | Mensaje de Z1 | Z3 / Z4 | Recomendación | Afirmaciones que se evitan | Decisión pendiente |', '|---|---|---|---|---|---|---|---|---|---|'];
r.forEach((x) => L.push(`| ${x.id} | ${esc(x.familia)} | ${esc(x.datos)} | ${esc(x.interpreta)} | ${esc(x.confiabilidad)} | ${esc(x.mensaje)} | ${esc(x.z3)} / ${esc(x.z4)} | ${esc(x.recomendacion.join('; ') || '—')} | ${esc(x.evita.join('; '))} | ${esc(x.pendiente || '—')} |`));
L.push('', '## Comprobaciones por escenario', '');
r.forEach((x) => { L.push(`**${x.id} — ${x.familia}**`, ...x.comprobaciones.map((c) => `- ${c}`), ''); });
L.push('## Defectos encontrados y corregidos con esta matriz', '',
  '- **C17 (corregido y probado):** la derivación Z3 ofrecía «Recuperar elevando la conversión» y «La conversión explica la mayor parte de la variación» aunque Z1 declaraba la conversión no verificable (sesiones o pedidos faltantes, venta con cero pedidos, pedidos sin sesiones). Ahora esos elementos solo se derivan con conversión verificable y el detector de coherencia tiene la regla C17.',
  '- **Observación sobre Z1 (aceptado; no se modifica):** con sesiones faltantes y el resto completo, Z1 mantiene confiabilidad *Alta* y la frase «datos completos» aunque la conclusión de conversión sea no verificable (resolución C3 de 3.2: confianza por conclusión). Z3 ya lo dice con un elemento de datos; se registra como limitación **L-17** para que el usuario decida si la frase debe matizarse.', '');
fs.writeFileSync(path.join(D, 'ESCENARIOS_COMERCIALES_CRITICOS.md'), L.join('\n'));
console.log('escenarios comerciales:', r.length);
