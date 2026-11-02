"""Simulación de la sesión de equipo + servidor de IA para las pruebas de navegador (cierre técnico, hallazgo 2).
La aplicación ya no llama a Cohere desde el navegador: toda consulta pasa por FP.cohereProxy. Estas pruebas NO validan el servidor real
(Edge Function de Supabase) ni a Cohere: sustituyen solo la SESIÓN (available) y el transporte (post → fetch de la página, que cada prueba ya simula).
El cliente real (js/ai/cohereClient.js), las validaciones y los flujos de la app sí se ejecutan tal cual."""
def sim(on=True):
    return ("(()=>{ if(!FP.cohereProxy.__orig){ const o={available:FP.cohereProxy.available,post:FP.cohereProxy.post}; FP.cohereProxy.__orig=o;"
            "FP.cohereProxy.available=()=>window.__simProxy===true||o.available();"
            "FP.cohereProxy.post=(body,opt)=>window.__simProxy===true?(async()=>{const f=(opt&&opt.fetchImpl)||window.fetch.bind(window);return f(FP.cohereProxy.endpoint(),{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body),signal:opt&&opt.signal})})():o.post(body,opt) }"
            f" window.__simProxy={'true' if on else 'false'} }})()")
