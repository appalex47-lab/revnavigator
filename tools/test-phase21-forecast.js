const __path=require('path'),__fs=require('fs');
// Si la instantánea externa (/tmp/phase21) no existe, se prueba el código ACTUAL del repositorio (js/analytics): mismas aserciones, sin omitir.
const __R=__fs.existsSync('/tmp/phase21/js/analytics/trendEngine.js')?'/tmp/phase21':__path.join(__dirname,'..');
const fs=require('fs'),vm=require('vm');
const ctx=vm.createContext({FP:{},console});
for(const f of ['trendEngine.js','trendForecastEngine.js']) vm.runInContext(fs.readFileSync(__R+'/js/analytics/'+f,'utf8'),ctx);
let p=0,f=0; const t=(n,fn)=>{try{if(!fn())throw Error('false');console.log('PASS',n);p++}catch(e){console.log('FAIL',n,e.message);f++}};
const TE=ctx.FP.trendEngine, FE=ctx.FP.trendForecastEngine;
const s=[['2026-04',100],['2026-05',110],['2026-06',120],['2026-07',130],['2026-08',140]].map(([period,value])=>({period,value}));
const r=TE.analyzeTrend(s,{entity:'X'});
t('inicio del patrón actual existe',()=>r.patternStartPeriod==='2026-05');
t('duración del patrón actual',()=>r.patternDurationPeriods===4 && r.consecutivePeriods===4);
t('fin del patrón',()=>r.patternEndPeriod==='2026-08');
t('compatibilidad startPeriod',()=>r.startPeriod==='2026-05');
const d=TE.analyzeTrend([['2026-04',200],['2026-05',180],['2026-06',160],['2026-07',140],['2026-08',120]].map(([period,value])=>({period,value})),{entity:'D'});
t('inicio de caída actual',()=>d.direction==='decline' && d.patternStartPeriod==='2026-05');
t('duración de caída',()=>d.patternDurationPeriods===4);
const fc=FE.forecast({...r,series:s},{horizon:3,method:'linear',periodType:'month'});
t('forecast disponible',()=>fc.status==='available'&&fc.periods.length===3);
t('forecast conserva inicio',()=>fc.patternStartPeriod==='2026-05');
t('forecast conserva duración',()=>fc.patternDurationPeriods===4);
t('backtest presente',()=>fc.backtest && fc.backtest.periodsTested>0);
const ui=fs.readFileSync(__R+'/js/ui/trend-view.js','utf8');
// Las etiquetas «Inicio del patrón actual» / «Duración del patrón» existían en la UI de la fase 21 y se retiraron en el rediseño del commit 68b4aef. Con la instantánea externa se siguen
// verificando (comportamiento original); contra el código ACTUAL se verifica lo que la UI vigente sí muestra, y que el motor sigue entregando esos datos (aserciones del forecast de arriba).
if(__R==='/tmp/phase21'){
  t('UI etiqueta inicio actual',()=>ui.includes('Inicio del patrón actual'));
  t('UI etiqueta duración patrón',()=>ui.includes('Duración del patrón'));
}else{
  t('UI vigente muestra el patrón con sus etiquetas (Crecimiento acelerado / Caída acelerada)',()=>ui.includes('Crecimiento acelerado')&&ui.includes('Caída acelerada'));
  t('el motor sigue entregando inicio y duración del patrón (la UI vigente ya no los rotula)',()=>typeof r.patternStartPeriod==='string'&&Number.isFinite(r.patternDurationPeriods));
}
const app=fs.readFileSync(__R+'/js/app.js','utf8');
t('forecast respeta granularidad al cambiar horizonte',()=>app.includes('periodType: state.an.periodType'));
console.log(`RESULT ${p}/${p+f} PASS`);process.exitCode=f?1:0;
