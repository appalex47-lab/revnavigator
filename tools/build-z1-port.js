#!/usr/bin/env node
/* Genera js/commandCenter/z1.js A PARTIR de la especificación aceptada tools/audit/z1-lectura-ejecutiva.js (fuente de referencia de Z1).
 * El módulo de js/ es un ARTEFACTO GENERADO: no se edita a mano. Un cambio autorizado de la especificación se propaga con  `node tools/build-z1-port.js`;
 * `node tools/build-z1-port.js --check` falla (código 1) si el archivo de js/ no es exactamente lo que produce la especificación actual (lo usa la prueba de cierre).
 * Única transformación: se reemplaza el envoltorio UMD (require de la especificación) por la inyección perezosa de FP.businessState y FP.economics. */
const fs = require('fs'), path = require('path');
const R = path.join(__dirname, '..'), SPEC = path.join(R, 'tools/audit/z1-lectura-ejecutiva.js'), OUT = path.join(R, 'js/commandCenter/z1.js');
const HEADER = `/**
 * z1.js — Evaluador de Z1 «Lectura ejecutiva» (Fase 4.2). Navegador (\`FP.z1\`) y Node (\`module.exports\`).
 *
 * ARCHIVO GENERADO — NO EDITAR A MANO. Se produce con \`node tools/build-z1-port.js\` desde la especificación ACEPTADA tools/audit/z1-lectura-ejecutiva.js (3.2, D-01 a D-07), que es la
 * FUENTE DE REFERENCIA de Z1. Un único código ejecutable en la aplicación: este. La especificación solo se ejecuta en las pruebas de Fase 3 y como referencia; \`--check\` y
 * tools/test-cierre-4-1-4-2.js verifican que este archivo es exactamente el que produce la especificación vigente (no pueden divergir).
 * Recibe lo que ya calcularon los motores y decide QUÉ se muestra, QUÉ se calla y QUÉ se puede afirmar; NO calcula indicadores. Los estados frente al plan salen de FP.businessState
 * (que delega en FP.gap.pacingStatus). Dependencias: FP.businessState y FP.economics (contributionOf, validateMarginInput).
 * Alimenta a FP.reliability (cc.reliability/1): el nivel de confiabilidad es el de \`evaluate(i).level\`. ESTADO: disponible; sin consumidores en vistas ni carga en index.html hasta que exista el primer consumidor.
 */
(function (root, factory) {
  const api = factory(root);
  if (typeof module === 'object' && module.exports) module.exports = api;
  const FP = (root.FP = root.FP || {}); FP.z1 = api;
})(typeof window !== 'undefined' ? window : globalThis, function (root) {
  const need = (k) => { const FP = root.FP; if (!FP || !FP[k]) throw new Error(\`z1.js requiere FP.\${k} cargado antes.\`); return FP[k]; };
  const CC = { classifyBusinessState: (...a) => need('businessState').classifyBusinessState(...a) };
  const ECON = { contributionOf: (...a) => need('economics').contributionOf(...a), validateMarginInput: (...a) => need('economics').validateMarginInput(...a) };
`;
function generate() {
  const spec = fs.readFileSync(SPEC, 'utf8'), m = /\}\)\(typeof window !== 'undefined' \? window : globalThis, function \(CC, ECON\) \{\n([\s\S]*)\n\}\);\s*$/.exec(spec);
  if (!m) throw new Error('La especificación de Z1 no tiene la forma esperada del envoltorio UMD.');
  return HEADER + m[1] + '\n});\n';
}
const out = generate();
if (process.argv.includes('--check')) { const cur = fs.existsSync(OUT) ? fs.readFileSync(OUT, 'utf8') : ''; if (cur !== out) { console.error('js/commandCenter/z1.js NO coincide con lo que produce la especificación. Ejecuta: node tools/build-z1-port.js'); process.exit(1); } console.log('z1.js coincide con la especificación'); }
else { fs.writeFileSync(OUT, out); console.log('generado ' + path.relative(R, OUT)); }
module.exports = { generate };
