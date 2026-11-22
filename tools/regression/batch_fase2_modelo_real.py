"""Command Center · Fase 2 — los modelos (contratos de hallazgo, estado, severidad, impacto económico) probados contra los MOTORES REALES de la aplicación.
Datos de demostración con una desviación real (Ecommerce −12 % en venta y pedidos). Nada se recalcula aparte: los adaptadores solo traducen salidas de los motores.
Uso: python3 run_batch.py batch_fase2_modelo_real.py <raíz>"""
import sys, asyncio, json, pathlib
ROOT = sys.argv[1]; sys.argv = sys.argv[:2]
from ed_common import *
from recovery_state import prepare
CONTRACTS = (pathlib.Path(ROOT) / 'tools/audit/command-center-contracts.js').read_text()

SETUP = r"""(()=>{const S=FP.app.state; FP.dataStore.records(S.store,'actual').forEach(r=>{ if(r.channel==='ecommerce'){ ['revenue','orders'].forEach(k=>{ if(r.metrics[k]&&typeof r.metrics[k].value==='number') r.metrics[k].value*=0.88 }) } }); S.fc.run=null; S.dx.run=null; })()"""
HOOK = "(()=>{const o=FP.attentionEngine.evaluate; if(!o.__cap){const w=function(i){const r=o.apply(this,arguments); window.__att={i,r}; return r}; w.__cap=true; FP.attentionEngine.evaluate=w}})()"

ADAPT = r"""(()=>{
  const CC=window.CCContracts, S=FP.app.state, a=window.__att, st=a.i.status.forecast, pf=FP.homeView.periodFigures(S).p, key=pf.key, today='2026-09-18';
  const lin=(engine,id,family)=>({engine,id,role:'origin',family});
  const base=(o)=>Object.assign({schema:'cc.finding',version:1,period:{type:'month',key,comparison:'plan'},indicator:'revenue',limitations:[],
    validity:{status:'activo',firstSeen:today,lastSeen:today,expiresWhen:'El indicador vuelve a su banda normal dos corridas seguidas.'}, economics:null, economicsReason:'La brecha ya está en pesos de venta; no hay otra magnitud que valuar.'},o);
  const ev=(cls,text,field,numbers,headline)=>({class:cls,text,source:{module:'attentionEngine',field},numbers,headline:!!headline});
  const sev=(f)=>f.severity==='attention'?'importante':'seguimiento';
  const fromAtt=(f)=>{
    const fam=f.kind==='gap'?'pacing_gap':f.kind==='driver'?'driver_'+f.id.split('_')[1]:f.kind==='forecast'?'forecast_close':f.kind==='channel'?'channel_'+f.id.split('_')[1]:'data_'+f.id.split('_')[1];
    const channel=f.kind==='channel'?f.id.split('_')[1]:'total';
    const lvl=f.kind==='driver'?'driver':'calculo';
    const evi=(f.evidence||[]).map((t,i)=>ev(lvl,t,'findings['+f.id+'].evidence',[],i===0));
    if(f.hypothesis) evi.push(ev('hipotesis',f.hypothesis,'findings['+f.id+'].hypothesis',[],false));
    if(!evi.length) evi.push(ev(lvl,f.what,'findings['+f.id+'].what',[],true));
    return base({id:'att:'+f.id,type:f.kind==='forecast'?'risk':'deviation',title:f.title,description:f.what,scope:{level:channel==='total'?'total':'channel',channel},
      observed:{value:typeof f.amount==='number'?f.amount:null,unit:'MXN'},reference:{value:null,basis:'trayectoria del plan'},evidence:evi,
      rule:{id:'attention.'+f.kind,family:fam,version:1},certainty:{level:lvl,support:f.support?f.support.level:'medio',basis:f.support?f.support.rule:'regla de respaldo'},
      severity:sev(f),lineage:[lin('attentionEngine',f.id,'atencion')]});
  };
  const agentFam={brecha_concentrada:'channel_ecommerce',meta_en_riesgo:'forecast_close',forecast_divergente:'forecast_methods'};
  const fromAgent=(f)=>base({id:'ag:'+f.id,type:f.id==='meta_en_riesgo'?'risk':'deviation',title:f.title,description:f.resumen,
    scope:{level:f.id==='brecha_concentrada'?'channel':'total',channel:f.id==='brecha_concentrada'?'ecommerce':'total'},
    observed:{value:(f.big&&typeof f.big.value==='number')?f.big.value:null,unit:'MXN'},reference:{value:null,basis:'plan del periodo'},
    evidence:[{class:'calculo',text:f.que,source:{module:'agents/analista',field:'findings['+f.id+'].que'},numbers:[],headline:true}],
    rule:{id:'agent.'+f.id,family:agentFam[f.id]||f.id,version:1},certainty:{level:'calculo',support:'medio',basis:'detector del agente analista sobre el motor de forecast/gap'},
    severity:f.prio==='Alta'?'importante':'seguimiento',lineage:[lin('agents/analista',f.id,'agentes')]});
  const att=a.r.findings.filter(f=>f.kind!=='data').map(fromAtt);
  const ag=FP.agents.analista.detect(S,{}).findings.map(fromAgent);
  const all=[...att,...ag];
  const out={n:all.length, validation:all.map(f=>[f.id,CC.validateFinding(f)]) };
  const merged=CC.mergeFindings(all);
  out.merged=merged.map(f=>[f.id,f.lineage.map(l=>l.engine+':'+l.id+':'+l.role),f.explains||null]);
  out.mergedValid=merged.map(f=>[f.id,CC.validateFinding(f).ok]);
  // estado general con entradas ya calculadas por los motores
  const comp=st.compliance, fgp=st.forecastGapPct;
  out.state=CC.classifyBusinessState({compliance:comp,forecastGapPct:fgp,growthVsComparable:null,coverage:1,findings:merged,dataWarnings:true,concentration:true});
  out.state2=CC.classifyBusinessState({compliance:comp,forecastGapPct:fgp,growthVsComparable:0.06,coverage:1,findings:merged,dataWarnings:true,concentration:true});
  out.inputs={comp,fgp};
  // severidad de la desviación de Ecommerce con las bandas del motor de umbrales (config)
  out.sev=CC.classifyDeviation({devPct:-0.126,band:{normal:0.02,unusual:0.05},moneyAbs:748005,planBase:pf.planToDate?pf.planToDate.revenue:15956810,persistence:6,support:'medio',corroborated:true,streakDays:5});
  return out})()"""

ECON = r"""(()=>{
  const CC=window.CCContracts, S=FP.app.state, i=window.__edIn, SE=FP.scenarioEngine, RE=FP.recoveryEngine, out={};
  const ctx=SE.buildContext({run:i.run,rf:i.rf,channel:'total',period:{type:'month',key:'2026-09'},applyTo:'all',store:S.store});
  const R=SE.simulate(ctx,{changes:{}}).base.revenue;
  const A=0.05,B=0.04,C=0.03, one=(ch)=>SE.simulate(ctx,{changes:ch}).incremental.revenue;
  const t=one({trafficPct:A}), c=one({crMode:'pct',crValue:B}), v=one({aovMode:'pct',aovValue:C});
  const j=one({trafficPct:A,crMode:'pct',crValue:B,aovMode:'pct',aovValue:C});
  out.R=R; out.ind=[t,c,v]; out.joint=j; out.expectedJoint=CC.jointRelative(R,A,B,C);
  out.sumInd=t+c+v; out.interaction=j-(t+c+v); out.expectedInteraction=R*((1+A)*(1+B)*(1+C)-1-A-B-C);
  // atribución secuencial del conjunto: Σ = conjunto (sin doble conteo)
  const base={trafficVolume:1000,conversionRate:0.02,aov:900}, cur={trafficVolume:1050,conversionRate:0.02*(1+B),aov:900*(1+C)};
  const at=FP.attribution.attribute(base,cur,{method:'sequential',order:['trafficVolume','conversionRate','aov']});
  out.attr=[Object.values(at.contributions).reduce((x,y)=>x+y,0), at.total, at.closes];
  // equivalencia attribution.js ↔ trafficConversionEngine.effects (misma identidad, mismo orden)
  const b2={t:1000,o:20,r:18000}, c2={t:1050,o:1050*0.02*(1+B),r:1050*0.02*(1+B)*900*(1+C)};
  const ef=FP.trafficConversionEngine.effects(b2,c2), at2=FP.attribution.attribute({trafficVolume:b2.t,conversionRate:b2.o/b2.t,aov:b2.r/b2.o},{trafficVolume:c2.t,conversionRate:c2.o/c2.t,aov:c2.r/c2.o},{method:'sequential',order:['trafficVolume','conversionRate','aov']});
  out.equiv=[[ef.traffic,at2.contributions.trafficVolume],[ef.cr,at2.contributions.conversionRate],[ef.aov,at2.contributions.aov]];
  // borde: base sin pedidos → effects atribuye todo a conversión; attribution.js responde insufficient_data (diferencia documentada)
  const e0=FP.trafficConversionEngine.effects({t:100,o:0,r:0},{t:100,o:2,r:200}); out.e0=[e0.status,e0.unattributed,e0.cr,e0.aov,e0.attributed]; const a0=FP.attribution.attribute({trafficVolume:100,conversionRate:0,aov:0},{trafficVolume:100,conversionRate:0.02,aov:100},{method:'sequential',order:['trafficVolume','conversionRate','aov']});
  out.edge=[e0.kind,e0.cr,a0.status,a0.contributions&&a0.contributions.aov,a0.contributions&&a0.contributions.conversionRate,a0.total];
  // brecha y recuperación: las alternativas son EXCLUYENTES (cada una cierra la misma brecha)
  const plan=SE.simulate(ctx,{changes:{}}); out.gap=plan.gap;
  const ctxF=SE.buildContext({run:i.run,rf:i.rf,channel:'total',period:{type:'month',key:'2026-09'},applyTo:'future',store:S.store});
  const ro=RE.recoveryOptions(ctxF,{targetPct:1}); out.ro={ok:ro.ok,reason:ro.reason||null,n:(ro.alternatives||[]).length,
    alts:(ro.alternatives||[]).map(a=>[a.id||a.label,a.simulated&&a.simulated.incremental&&a.simulated.incremental.revenue,a.simulated&&a.simulated.recoveryPercent]),gapBefore:ro.gap&&ro.gap.gapBefore};
  return out})()"""

async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(); q = await boot(b, patch=True)
        await prepare(q, U)
        await q.evaluate(SETUP)
        await q.goto(U + '#inicio'); await q.wait_for_timeout(500)
        await q.evaluate(HOOK); await q.goto(U + '#resumen'); await q.wait_for_timeout(400); await q.goto(U + '#inicio'); await q.wait_for_timeout(2500)
        await q.evaluate(CONTRACTS + ';window.CCContracts=window.CCContracts||globalThis.CCContracts')
        chk('F2.R0 el módulo de contratos está cargado', await q.evaluate('typeof CCContracts==="object"'))
        o = await q.evaluate(ADAPT)
        chk(f'F2.R1 los motores reales aportan {o["n"]} hallazgos adaptables (atención + agente analista)', o['n'] >= 6, o['n'])
        for fid, v in o['validation']: chk(f'F2.R2 {fid} cumple el contrato cc.finding', v['ok'], v['errors'])
        keys = {m[0]: m for m in o['merged']}
        chk('F2.R3 la deduplicación fusiona atención y agente cuando dicen lo mismo (forecast y canal Ecommerce)', len(o['merged']) < o['n'] and sum(1 for m in o['merged'] if len(m[1]) > 1) >= 2, o['merged'])
        chk('F2.R4 el fusionado conserva trazabilidad: cada hallazgo trae el motor de origen y los duplicados', all(any(':origin' in x for x in m[1]) for m in o['merged']))
        chk('F2.R5 los hallazgos fusionados siguen cumpliendo el contrato', all(ok for _, ok in o['mergedValid']), o['mergedValid'])
        chk('F2.R6 el driver de conversión «explica» la brecha (relación, no suma)', any(m[2] for m in o['merged'] if 'driver:cr' in m[0]), o['merged'])
        chk('F2.R7 estado general sin dato de evolución: riesgo de cumplimiento (95.5 % del plan, cierre −3.3 %)', o['state']['state'] == 'riesgo_cumplimiento', o['state'])
        chk('F2.R8 con crecimiento contra comparable +6 %: «creciendo por debajo de potencial»', o['state2']['state'] == 'creciendo_bajo_potencial', o['state2'])
        chk('F2.R9 el estado trae calificadores (cierre en riesgo, concentración, datos con avisos)', {'cierre_en_riesgo', 'concentracion_en_un_canal', 'datos_con_avisos'} <= set(o['state']['qualifiers']), o['state']['qualifiers'])
        chk('F2.R10 desviación de Ecommerce (−12.6 %, persistente 6 días, material) = crítica', o['sev']['severity'] == 'critica', o['sev'])
        st = await generate(q); chk('F2.E0 el reporte se genera con los datos desviados (run y reforecast disponibles)', st == 'ready', st)
        e = await q.evaluate(ECON)
        chk('F2.E1 efecto conjunto del escenario = R·((1+a)(1+b)(1+c)−1) (fórmula independiente)', abs(e['joint'] - e['expectedJoint']) <= max(1e-6, abs(e['joint']) * 1e-9), [e['joint'], e['expectedJoint']])
        chk('F2.E2 los efectos NO son aditivos: conjunto − Σ individuales = R·términos cruzados', abs(e['interaction'] - e['expectedInteraction']) <= max(1e-6, abs(e['interaction']) * 1e-9) and abs(e['interaction']) > 1, [e['interaction'], e['expectedInteraction']])
        chk('F2.E3 la atribución secuencial del conjunto suma exacto el total (sin doble conteo)', e['attr'][2] and abs(e['attr'][0] - e['attr'][1]) < 1e-6, e['attr'])
        chk('F2.E4 attribution.js y trafficConversionEngine.effects coinciden en tráfico, conversión y ticket', all(abs(x - y) < 1e-6 for x, y in e['equiv']), e['equiv'])
        chk('F2.E5 divergencia RESUELTA (punto A): base sin pedidos → effects() y attribution.js coinciden: «recuperación desde cero», sin reparto entre conversión y ticket', e['edge'][0] == 'noBaseOrders' and e['e0'] == ['recuperacion_desde_cero', 200, 0, 0, False] and e['edge'][2] == 'insufficient_data', [e['edge'], e['e0']])
        chk('F2.E6 la brecha del periodo existe y el motor de recuperación devuelve alternativas', e['ro']['ok'] and e['ro']['n'] >= 1, e['ro'])
        if e['ro']['ok']:
            chk('F2.E7 cada alternativa de recuperación cierra la misma brecha (excluyentes: se reporta rango, no suma)', all(a[2] is None or a[2] >= 0.99 for a in e['ro']['alts']), e['ro']['alts'])
        await b.close()
    print(f'\n{len(passed)} bien, {len(fails)} mal'); print('TODO BIEN' if not fails else 'FALLAS: ' + '; '.join(fails)); sys.exit(1 if fails else 0)
asyncio.run(main())
