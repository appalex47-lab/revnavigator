/**
 * report-setup-view.js — Configuración y propuesta de la presentación (Presentation Intelligence · Fase 2).
 *
 * Pinta los pasos 1 a 3 (audiencia, tipo de presentación y profundidad) y el paso 5 (propuesta del compositor: láminas con su motivo, lo no incluido
 * con su motivo, anexos y limitaciones). El paso 4 (periodo, canal y filtros) sigue siendo el de siempre, en report-view.js.
 * Solo presenta lo que deciden FP.reportCatalog (qué existe y qué está habilitado) y FP.reportComposer (qué láminas van); no calcula ni redacta cifras.
 */
(function (root) {
  'use strict';
  const FP = (root.FP = root.FP || {});
  const esc = (v) => FP.ui.helpers.esc(v);
  const TYPE_LABEL = { portada: 'Portada', analisis: 'Análisis', cierre: 'Cierre', anexo: 'Anexo' };
  const KIND_LABEL = { 'sin-datos': 'Sin datos', 'en-anexo': 'Dentro del anexo', 'fuera-de-perfil': 'No es de este formato', 'seleccion-persona': 'Fuera de la selección', profundidad: 'Fuera de la profundidad elegida' };
  const LIM_LABEL = { confiabilidad: 'Hay una advertencia de confiabilidad del forecast (detalle en el anexo técnico B).', 'periodo-parcial': 'Incluye un período parcial.' };

  /** Selección que consumen el compositor y la vista: perfil, profundidad y bloques quitados o agregados. Lanza si la elección no corresponde a un perfil habilitado. */
  function selectionOf(rp) {
    const prof = FP.reportCatalog.resolve(rp.audience, rp.type);
    if (!prof) throw new Error(`No hay un perfil habilitado para la audiencia «${rp.audience}» y el tipo «${rp.type}».`);
    return { profile: prof.id, depth: prof.depths && prof.depths.length ? (rp.depth || prof.defaultDepth) : undefined, exclude: rp.exclude || [], include: rp.include || [] };
  }

  const choice = (action, o, pressed) => `<button type="button" class="rp-choice${o.enabled ? '' : ' rp-choice--off'}" data-action="${action}" data-id="${esc(o.id)}" aria-pressed="${pressed ? 'true' : 'false'}"${o.enabled ? '' : ` aria-disabled="true" title="${esc(o.reason)}"`}>
    <span class="rp-choice__t">${esc(o.label)}</span>${o.who ? `<span class="rp-choice__who">${esc(o.who)}</span>` : ''}<span class="rp-choice__d">${esc(o.description || '')}</span>${o.enabled ? '' : '<span class="rp-choice__na">Próximamente</span>'}</button>`;

  /** Pasos 1 a 3. */
  function stepsHtml(state) {
    const rp = state.rp, C = FP.reportCatalog, sel = selectionOf(rp), prof = FP.reportProfiles.get(sel.profile);
    const auds = C.audiences(), types = C.types(rp.audience), depths = C.depths(prof);
    const step = (n, q, id, body) => `<fieldset class="rp-step" id="${id}"><legend class="rp-step__q"><span class="rp-step__n">Paso ${n}</span> ${esc(q)}</legend><div class="rp-choices">${body}</div></fieldset>`;
    return `<div class="rp-steps">
      ${step(1, '¿Para quién es?', 'rp-s1', auds.map((a) => choice('rp-audience', a, a.id === rp.audience)).join(''))}
      ${step(2, '¿Qué tipo de presentación?', 'rp-s2', types.map((t) => choice('rp-type', t, t.id === rp.type)).join(''))}
      ${depths.length ? step(3, '¿Con qué profundidad?', 'rp-s3', depths.map((d) => choice('rp-depth', { ...d, enabled: true }, d.id === sel.depth)).join('')) : ''}
      <p class="field__hint" id="rp-selected">Se armará: <strong>${esc(auds.find((a) => a.id === rp.audience).label)}</strong> · <strong>${esc(types.find((t) => t.id === rp.type).label)}</strong>${depths.length ? ` · <strong>${esc(depths.find((d) => d.id === sel.depth).label)}</strong>` : ''}. Los formatos marcados «Próximamente» se habilitan cuando puedan generar una presentación completa; ninguno inventa datos.</p>
    </div>`;
  }

  /** Editor de una lámina: título y nota propios (texto de la persona) y, si se activa, hipótesis de IA para aceptar una por una. */
  function editorHtml(state, plan, prof) {
    const rp = state.rp, id = rp.editing, PE = FP.reportPrefs, L = PE.LIMITS, slide = id && plan.slides.find((s) => s.block === id);
    if (!slide || PE.EDITABLE_NOT.includes(id)) return '';
    const ed = (rp.edits && rp.edits[PE.editKey(prof.id, id)]) || {}, ai = rp.aiRes && rp.aiRes[id], on = Boolean(rp.options.ai);
    const sug = ai && ai.hypotheses && ai.hypotheses.length ? `<ul class="rp-ed__sug" id="rp-ai-sug">${ai.hypotheses.map((h, i) => `<li><span>${esc(h)}</span> <button type="button" class="btn" data-action="rp-ai-accept" data-i="${i}">Aceptar</button></li>`).join('')}</ul>` : '';
    const acc = ed.hyp && ed.hyp.length ? `<ul class="rp-ed__acc" id="rp-ai-acc">${ed.hyp.map((h, i) => `<li><span>${esc(h)}</span> <button type="button" class="btn btn--ghost" data-action="rp-ai-drop" data-i="${i}" aria-label="Quitar la hipótesis ${i + 1}">Quitar</button></li>`).join('')}</ul>` : '';
    const aiMsg = !ai ? '' : ai.busy ? '<p class="field__hint" role="status">Consultando…</p>' : ai.ok ? '' : `<p class="note note--warn" role="status">${esc(ai.status === 'rejected' ? 'La IA respondió algo que no cumple las reglas (cifras que no están en la lámina, lenguaje causal o sin lenguaje de posibilidad); no se muestra. ' : '')}${esc((ai.errors || []).slice(0, 2).join(' '))}</p>`;
    return `<div class="rp-editor" id="rp-editor" role="group" aria-labelledby="rp-editor-t"><h4 class="rp-prop__h" id="rp-editor-t">Editar «${esc(slide.title)}»</h4>
      <p class="field__hint">Tu texto no cambia ninguna cifra: el título propio reemplaza al generado y la nota se agrega al pie de la lámina. Se guarda en este navegador y se borra al cerrar sesión.</p>
      <label class="field"><span class="field__label">Título de la lámina (vacío = el generado)</span><input type="text" id="rp-ed-title" data-action="rp-edit-field" data-field="title" maxlength="${L.title}" value="${esc(ed.title || '')}" placeholder="${esc(slide.title)}"></label>
      <label class="field"><span class="field__label">Nota (máx. ${L.note} caracteres)</span><textarea id="rp-ed-note" data-action="rp-edit-field" data-field="note" rows="2" maxlength="${L.note}">${esc(ed.note || '')}</textarea></label>
      <label class="check"><input type="checkbox" data-action="rp-option" data-key="ai" ${on ? 'checked' : ''}> Permitir sugerencias de IA (al pedirlas se envía a Cohere el texto y las cifras de esta lámina)</label>
      ${on ? `<div class="btn-row"><button type="button" class="btn" data-action="rp-ai-ask" ${ai && ai.busy ? 'disabled aria-busy="true"' : ''}>Pedir hipótesis a la IA</button></div>${aiMsg}${sug}` : ''}
      ${acc ? `<p class="field__hint">Hipótesis aceptadas (salen en la lámina como «Hipótesis (IA), por validar»):</p>${acc}` : ''}
      <div class="btn-row"><button type="button" class="btn btn--ghost" data-action="rp-edit-reset">Restaurar el texto original</button><button type="button" class="btn" data-action="rp-edit-close">Cerrar</button></div></div>`;
  }

  /** Paso 5: la propuesta del compositor, con la selección editable. */
  function proposalHtml(state, plan) {
    const rp = state.rp, prof = FP.reportProfiles.get(plan.profile), req = new Set(prof.slots.filter((s) => s.required).map((s) => s.block));
    const PE = FP.reportPrefs;
    let annexRow = 0;
    const rows = plan.slides.map((s) => {
      const first = s.id !== 'annex' || annexRow++ === 0;
      const box = !first ? '' : req.has(s.block) ? '<span class="rp-prop__req" role="img" aria-label="Obligatoria" title="Obligatoria">●</span>' : `<input type="checkbox" data-action="rp-toggle-page" data-id="${esc(s.block)}" checked aria-label="Incluir «${esc(s.title)}»">`;
      const canEdit = first && !PE.EDITABLE_NOT.includes(s.block), edited = canEdit && rp.edits && rp.edits[PE.editKey(prof.id, s.block)];
      const editCell = canEdit ? `<button type="button" class="btn btn--ghost" data-action="rp-edit-open" data-id="${esc(s.block)}" aria-label="Editar «${esc(s.title)}»">Editar</button>${edited ? ' <span class="pill pill--na">Editada</span>' : ''}` : '';
      return `<tr><td class="rp-prop__c">${box}</td><td class="rp-prop__n">${s.order}</td><td>${esc(s.title)}</td><td>${esc(TYPE_LABEL[s.type] || s.type)}</td><td class="rp-prop__why">${esc(s.reason)}</td><td class="rp-prop__e">${editCell}</td></tr>`;
    }).join('');
    const out = plan.excluded.filter((e) => e.block !== 'cover').map((e) => {
      const can = e.kind === 'seleccion-persona' || e.kind === 'profundidad';
      const box = can ? `<input type="checkbox" data-action="rp-toggle-page" data-id="${esc(e.block)}" aria-label="Agregar «${esc(e.title)}»">` : '';
      return `<li class="rp-off"><span class="rp-off__c">${box}</span><span class="rp-off__t">${esc(e.title)}</span><span class="pill pill--na">${esc(KIND_LABEL[e.kind] || e.kind)}</span><span class="rp-off__why">${esc(e.reason)}</span></li>`;
    }).join('');
    const title = (b) => (plan.slides.find((s) => s.block === b) || plan.excluded.find((e) => e.block === b) || { title: b }).title;
    const lim = plan.limitations.map((l) => `<li><strong>${esc(title(l.block))}:</strong> ${esc(l.text || LIM_LABEL[l.kind] || l.kind)}</li>`).join('');
    const nAnnex = plan.slides.filter((s) => s.type === 'anexo').length;
    return `<section class="panel" aria-labelledby="t-rp-prop"><div class="panel__head"><div><h3 class="panel__title" id="t-rp-prop"><span class="rp-step__n">Paso 5</span> Propuesta de presentación</h3>
      <p class="panel__desc" id="rp-prop-sum">${plan.slides.length} lámina${plan.slides.length === 1 ? '' : 's'} en el PDF${nAnnex ? ` (${nAnnex} de anexo técnico)` : ''}${plan.excluded.length ? ` · ${plan.excluded.length} bloque${plan.excluded.length === 1 ? '' : 's'} no incluido${plan.excluded.length === 1 ? '' : 's'}` : ''}. Quita o agrega láminas con las casillas; cada una dice por qué está o no está.</p></div></div>
      <div class="panel__body stack">
        <div class="rp-prop__w"><table class="rp-prop" id="rp-prop"><caption class="sr-only">Láminas de la presentación</caption><thead><tr><th scope="col"><span class="sr-only">Incluir</span></th><th scope="col">#</th><th scope="col">Lámina</th><th scope="col">Tipo</th><th scope="col">Por qué está</th><th scope="col"><span class="sr-only">Editar</span></th></tr></thead><tbody>${rows}</tbody></table></div>
        ${editorHtml(state, plan, prof)}
        ${out ? `<div><h4 class="rp-prop__h">No incluidas</h4><ul class="rp-offlist" id="rp-offlist">${out}</ul></div>` : ''}
        ${lim ? `<div><h4 class="rp-prop__h">Limitaciones detectadas</h4><ul class="rp-limits" id="rp-limits">${lim}</ul></div>` : '<p class="field__hint">No se detectaron limitaciones declaradas en las páginas incluidas.</p>'}
        <div class="btn-row"><button type="button" class="btn btn--ghost" data-action="rp-reset-selection">Restablecer la selección</button></div>
      </div></section>`;
  }

  FP.reportSetupView = { selectionOf, stepsHtml, proposalHtml };
})(typeof window !== 'undefined' ? window : globalThis);
