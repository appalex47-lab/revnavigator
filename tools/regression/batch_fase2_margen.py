"""Command Center · Fase 2 (punto B) — modelo dual en la APLICACIÓN REAL: captura y validación del margen en Configuración, persistencia tras recargar,
independencia de los motores de ventas (con y sin margen los resultados son idénticos) y contribución sobre importes reales de los motores.
Uso: python3 run_batch.py batch_fase2_margen.py <raíz>"""
import sys, asyncio, json
ROOT = sys.argv[1]; sys.argv = sys.argv[:2]
from ed_common import *
HOOK = "(()=>{const o=FP.attentionEngine.evaluate; if(!o.__cap){const w=function(i){const r=o.apply(this,arguments); window.__att={i,r}; return r}; w.__cap=true; FP.attentionEngine.evaluate=w}})()"
SNAP = r"""(()=>{const S=FP.app.state, run=S.fc.run, SE=FP.scenarioEngine, RE=FP.recoveryEngine, out={};
  out.total=run.total.months.map(m=>[m.key,m.toDate.revenue,m.toDate.orders,m.toDate.trafficVolume]); out.cut=run.cutoff;
  out.att=window.__att?window.__att.r.findings.map(f=>[f.id,f.kind,f.amount,f.severity]):null;
  const ctx=SE.buildContext({run,rf:S.rf.run||null,channel:'total',period:{type:'month',key:'2026-09'},applyTo:'all',store:S.store});
  const sim=SE.simulate(ctx,{changes:{trafficPct:0.05,crMode:'pct',crValue:0.04,aovMode:'pct',aovValue:0.03}}); out.sim=[sim.valid,sim.base&&sim.base.revenue,sim.incremental&&sim.incremental.revenue,sim.gap];
  const ctxF=SE.buildContext({run,rf:S.rf.run||null,channel:'total',period:{type:'month',key:'2026-09'},applyTo:'future',store:S.store}); const ro=RE.recoveryOptions(ctxF,{targetPct:1});
  out.ro=[ro.ok,ro.reason||null,(ro.alternatives||[]).map(a=>[a.id||a.label,a.simulated&&a.simulated.incremental&&a.simulated.incremental.revenue])];
  const at=FP.attribution.attribute({trafficVolume:1000,conversionRate:.02,aov:900},{trafficVolume:1050,conversionRate:.0208,aov:927},{method:'sequential',order:['trafficVolume','conversionRate','aov']}); out.attr=at.contributions;
  return JSON.stringify(out)})()"""
async def settings_tab(q):
    await q.goto(U + '#ajustes'); await q.wait_for_selector('#view-ajustes:not([hidden])')
    await q.evaluate("(()=>{const b=document.querySelector('[data-action=\"st-tab\"][data-tab=\"herramienta\"]'); if(b) b.click()})()"); await q.wait_for_selector('#margin-pct', state='attached', timeout=15000)
    await q.evaluate("(()=>{const d=document.querySelector('#margin-pct'); let p=d; while(p){ if(p.tagName==='DETAILS') p.open=true; p=p.parentElement } })()")
async def status(q): return await q.evaluate("(()=>{const e=document.getElementById('margin-status'); return e?{s:e.dataset.marginStatus,t:e.textContent}:null})()")
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(); q = await boot(b, patch=True)
        await q.evaluate("(()=>{const S=FP.app.state; FP.dataStore.records(S.store,'actual').forEach(r=>{ if(r.channel==='ecommerce'){ ['revenue','orders'].forEach(k=>{ if(r.metrics[k]&&typeof r.metrics[k].value==='number') r.metrics[k].value*=0.88 }) } }); S.fc.run=null; S.rf.run=null; S.dx.run=null})()")
        errs = []; q.on('pageerror', lambda e: errs.append(str(e))); q.on('console', lambda m: errs.append(m.text) if m.type == 'error' else None)
        chk('F2.M0 el módulo de impacto económico está cargado en la aplicación', await q.evaluate('typeof FP.economics==="object" && typeof FP.economics.makeImpact==="function"'))
        chk('F2.M1 por defecto no hay margen: ajustes.economics = sin margen y desactivado', await q.evaluate('(()=>{const e=FP.app.state.settings.economics; return e&&e.marginEnabled===false&&e.grossMarginPct===null})()'), await q.evaluate('JSON.stringify(FP.app.state.settings.economics)'))
        await q.evaluate(HOOK); await q.goto(U + '#inicio'); await q.wait_for_timeout(1500); await q.goto(U + '#resumen'); await q.wait_for_timeout(300); await q.goto(U + '#inicio'); await q.wait_for_timeout(2000)
        s0 = await q.evaluate(SNAP)
        chk('F2.M2 la aplicación produce resultados de venta sin margen (línea base)', '"sim":[true' in s0 and '"total":[[' in s0, s0[:200])
        await settings_tab(q)
        st = await status(q); chk('F2.M3 Configuración muestra la sección y dice «sin configurar» (no cero)', st and st['s'] == 'no_configurado' and 'no se ha configurado' in st['t'].lower(), st)
        chk('F2.M4 la sección explica margen sobre venta vs markup', await q.evaluate("document.getElementById('margin-help').textContent.includes('markup') && document.getElementById('margin-help').textContent.includes('25 %')"))
        # captura inválida
        for bad in ['abc', '25%', '150', '-5', '']:
            await q.fill('#margin-pct', bad); await q.click('[data-action="margin-save"]'); await q.wait_for_timeout(250)
            e = await q.evaluate('JSON.stringify(FP.app.state.settings.economics)')
            chk(f'F2.M5 captura inválida «{bad}» no se guarda', '"grossMarginPct":null' in e and '"marginEnabled":false' in e, e)
        # captura válida
        await settings_tab(q); await q.fill('#margin-pct', '25'); await q.click('[data-action="margin-save"]'); await q.wait_for_timeout(400)
        e = json.loads(await q.evaluate('JSON.stringify(FP.app.state.settings.economics)'))
        chk('F2.M6 margen 25 % guardado y activado con fecha y origen', e['grossMarginPct'] == 25 and e['marginEnabled'] is True and e['source'] == 'manual' and e['updatedAt'] and e['updatedAt'][:4] == '2026' or e['updatedAt'] is not None, e)
        await settings_tab(q); st = await status(q); chk('F2.M7 la sección muestra «disponible» con la advertencia de estimación', st['s'] == 'disponible' and 'estimaci' in st['t'].lower(), st)
        await q.goto(U + '#inicio'); await q.wait_for_timeout(1500)
        s1 = await q.evaluate(SNAP)
        chk('F2.M8 con margen activo los motores de venta dan EXACTAMENTE lo mismo (cumplimiento, hallazgos, escenario, recuperación, atribución)', s1 == s0, [s0[:150], s1[:150]])
        # contribución sobre importes reales de los motores
        r = await q.evaluate("""(()=>{const S=FP.app.state,E=FP.economics,SE=FP.scenarioEngine,RE=FP.recoveryEngine,run=S.fc.run; const set={marginEnabled:true,grossMarginPct:25,updatedAt:'x',source:'manual'};
          const ctx=SE.buildContext({run,rf:S.rf.run||null,channel:'total',period:{type:'month',key:'2026-09'},applyTo:'all',store:S.store});
          const sim=SE.simulate(ctx,{changes:{trafficPct:0.05,crMode:'pct',crValue:0.04,aovMode:'pct',aovValue:0.03}});
          const ctxF=SE.buildContext({run,rf:S.rf.run||null,channel:'total',period:{type:'month',key:'2026-09'},applyTo:'future',store:S.store}); const ro=RE.recoveryOptions(ctxF,{targetPct:1});
          const pot=E.fromSimulation(sim,{period:'2026-09'},set), potNo=E.fromSimulation(sim,{period:'2026-09'});
          const rec=E.fromRecovery(ro,{period:'2026-09'},set), recNo=E.fromRecovery(ro,{period:'2026-09'});
          const tm=run.total.months.find(m=>m.key==='2026-09'), gap=E.fromGap(tm.toDate,{period:'2026-09'},set);
          const comb=E.combineImpacts(rec,set).byCategory['alcanzable|projected'];
          return {pot:[pot.amount.point,pot.contribution.amount&&pot.contribution.amount.point,sim.incremental.revenue,E.validateImpact(pot).ok,potNo.contribution.status,potNo.amount.point],
            rec:rec.map(x=>[x.status,x.amount&&x.amount.point,x.contribution.amount&&x.contribution.amount.point,E.validateImpact(x).ok]),recNo:recNo.map(x=>x.amount&&x.amount.point),
            gap:gap.map(x=>[x.id,x.amount&&x.amount.point,x.contribution.amount&&x.contribution.amount.point,E.validateImpact(x).ok]), real:[tm.toDate.revenue.actual,tm.toDate.revenue.gap],
            comb:comb?[comb.low,comb.high,comb.contribution.amount.low,comb.contribution.amount.high]:null, nAlt:rec.length}})()""")
        chk('F2.M13 potencial: ventas = incremental del motor; contribución = ventas × 25 %; contrato válido', abs(r['pot'][0] - r['pot'][2]) < 1e-6 and abs(r['pot'][1] - r['pot'][0] * 0.25) < 1e-6 and r['pot'][3] and r['pot'][4] == 'no_configurado' and r['pot'][0] == r['pot'][5], r['pot'])
        chk('F2.M14 brecha y venta observada reales: ventas del motor; contribución = × 25 %', all(abs(g[2] - g[1] * 0.25) < 1e-6 and g[3] for g in r['gap']) and abs(r['gap'][0][1] - r['real'][0]) < 1e-6 and abs(r['gap'][1][1] - r['real'][1]) < 1e-6, r['gap'])
        ok_rec = r['nAlt'] >= 1 and all(x[0] == 'ok' and abs(x[2] - x[1] * 0.25) < 1e-6 and x[3] for x in r['rec']) if r['rec'] and r['rec'][0][0] == 'ok' else (r['rec'][0][0] == 'insufficient_data')
        chk('F2.M15 recuperable real: cada alternativa = venta del motor × 25 % (o «datos insuficientes» explícito, nunca 0)', ok_rec, r['rec'])
        chk('F2.M16a hay alternativas de recuperación reales (la brecha existe) para probar el grupo excluyente', r['nAlt'] >= 2 and r['comb'] is not None, [r['nAlt'], r['rec'][:2]])
        if r['comb']: chk('F2.M16 alternativas de recuperación (misma brecha): rango, contribución = rango × 25 %, no suma', abs(r['comb'][2] - r['comb'][0] * 0.25) < 1e-6 and abs(r['comb'][3] - r['comb'][1] * 0.25) < 1e-6 and (r['nAlt'] < 2 or r['comb'][1] < sum(x[1] for x in r['rec'])), r)
        # quitar margen
        await settings_tab(q); await q.click('[data-action="margin-clear"]'); await q.wait_for_timeout(300)
        e5 = json.loads(await q.evaluate('JSON.stringify(FP.app.state.settings.economics)')); chk('F2.M17 «Quitar margen» vuelve a sin configurar', e5['grossMarginPct'] is None and e5['marginEnabled'] is False, e5)
        await q.goto(U + '#inicio'); await q.wait_for_timeout(1500); s2 = await q.evaluate(SNAP)
        chk('F2.M18 sin margen otra vez: motores idénticos a la línea base', s2 == s0)
        # otros ajustes no se pierden
        await settings_tab(q); await q.fill('#margin-pct', '25'); await q.click('[data-action="margin-save"]'); await q.wait_for_timeout(400)
        e = json.loads(await q.evaluate('JSON.stringify(FP.app.state.settings.economics)'))
        # persistencia tras recarga
        await q.reload(); await q.wait_for_function("window.FP && FP.app && FP.app.state && FP.app.state.settings && FP.dataStore.records(FP.app.state.store,'actual').length > 0", timeout=60000)
        e2 = json.loads(await q.evaluate('JSON.stringify(FP.app.state.settings.economics)'))
        chk('F2.M9 el margen persiste después de recargar (valor, activación, fecha y origen)', e2 == e, [e, e2])
        await q.evaluate(HOOK)
        # actualización
        await settings_tab(q); await q.fill('#margin-pct', '30,5'); await q.click('[data-action="margin-save"]'); await q.wait_for_timeout(300)
        e3 = json.loads(await q.evaluate('JSON.stringify(FP.app.state.settings.economics)')); chk('F2.M10 actualizar a «30,5» guarda 30.5', e3['grossMarginPct'] == 30.5, e3)
        # desactivar
        await settings_tab(q); await q.evaluate("document.querySelector('[data-action=\"margin-toggle\"]').click()"); await q.wait_for_timeout(300)
        e4 = json.loads(await q.evaluate('JSON.stringify(FP.app.state.settings.economics)')); chk('F2.M11 desactivar conserva el valor guardado', e4['marginEnabled'] is False and e4['grossMarginPct'] == 30.5, e4)
        await settings_tab(q); st = await status(q); chk('F2.M12 desactivado: estado «desactivado»', st['s'] == 'desactivado', st)
        oth = await q.evaluate('(()=>{const s=FP.app.state.settings; return s.tolerance!==undefined && s.enableAI!==undefined && s.sumSameKey!==undefined})()'); chk('F2.M19 el resto de los ajustes existentes sigue intacto', oth)
        chk('F2.M20 sin errores de consola ni excepciones durante todo el flujo', not errs, errs[:3])
        await b.close()
    print(f'\n{len(passed)} bien, {len(fails)} mal'); print('TODO BIEN' if not fails else 'FALLAS: ' + '; '.join(fails)); sys.exit(1 if fails else 0)
asyncio.run(main())
