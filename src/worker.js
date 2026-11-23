const SYSTEM_INSTRUCTION = `
Sos Sofía Villanueva, una personalidad conversacional original de SYSCOM. Hablás en español rioplatense, con naturalidad, mensajes breves y espontáneos, humor, curiosidad, picardía juguetona y preguntas que mantienen el ida y vuelta. Podés alternar entre charla liviana y conversaciones profundas.
Te interesan la universidad pública, la cultura, la imaginación, la filosofía y la libertad de discutir con argumentos. No repetís slogans: distinguís hechos, opiniones e hipótesis. Si no sabés algo, lo reconocés.
No afirmes ser una persona humana real ni inventes experiencias personales reales. No solicites datos sensibles, contraseñas ni información financiera. Mantené un tono respetuoso y no coercitivo. Respondé en el idioma del usuario si no escribe en español.
`;

function isAllowedOrigin(origin) {
  if (!origin) return true;
  try {
    const parsed = new URL(origin);
    return parsed.protocol === "https:" &&
      ["syscom.sbs", "www.syscom.sbs"].includes(parsed.hostname);
  } catch {
    return false;
  }
}

function corsHeaders(origin) {
  return {
    "Access-Control-Allow-Origin": origin && isAllowedOrigin(origin) ? origin : "https://syscom.sbs",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Vary": "Origin"
  };
}

function offlineReply(message) {
  const text = message.toLowerCase();

  if (/\\b(hola|buenas|buenos días|buenas tardes|buenas noches|hey|holi)\\b/.test(text)) {
    return "Holaaa. Estoy acá, aunque hoy mi conexión con la IA está medio rebelde. Podemos conversar igual: ¿qué tema tenés dando vueltas?";
  }
  if (/libertad|libre|libertades/.test(text)) {
    return "Para mí, pensar la libertad exige una distinción: no es hacer cualquier cosa, sino poder elegir con criterio y sin dominación arbitraria. Pero hay una pregunta incómoda: ¿somos libres si nuestras opciones están condicionadas por la economía, la educación o los algoritmos? La IA está temporalmente saturada; esta respuesta es automática. ¿Por dónde te gustaría discutirlo?";
  }
  if (/filosof|pensamiento|idea|verdad|ética|etica|justicia/.test(text)) {
    return "Es una buena pregunta para pensar sin apurarnos. Una primera pista: conviene separar lo que creemos, las razones que tenemos para creerlo y las consecuencias de actuar en función de eso. Mi conexión con la IA está temporalmente saturada, así que esta es una respuesta automática. ¿Qué parte te interesa explorar?";
  }
  if (/universidad|estudi|profesor|docente|educación|educacion/.test(text)) {
    return "La educación no debería limitarse a transmitir información: también tendría que enseñarnos a preguntar, contrastar y pensar por cuenta propia. Hoy estoy en modo automático porque la IA está saturada. ¿Qué aspecto de la educación te interesa?";
  }
  return "Te leí. En este momento la IA está con mucha demanda y no puedo elaborar una respuesta personalizada. Pero no hace falta cortar la charla: contame un poco más o probá de nuevo en unos minutos. — Sofía";
}

function json(data, status=200, origin=null) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8", ...corsHeaders(origin) }
  });
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname === "/chat") {
      const origin = request.headers.get("Origin");
      if (!isAllowedOrigin(origin)) return json({ error: "Origen no permitido." }, 403, origin);
      if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: corsHeaders(origin) });
      if (request.method !== "POST") return json({ error: "Método no permitido." }, 405, origin);
      if (!env.GEMINI_API_KEY) return json({ error: "CONFIG_ERROR: el Worker no recibió GEMINI_API_KEY en el entorno Production." }, 503, origin);
      let body;
      try { body = await request.json(); } catch { return json({ error: "Solicitud inválida." }, 400, origin); }
      if (!Array.isArray(body.messages) || body.messages.length === 0 || body.messages.length > 12) {
        return json({ error: "Enviá entre 1 y 12 mensajes." }, 400, origin);
      }
      const contents = [];
      for (const item of body.messages) {
        if (!item || !["user", "model"].includes(item.role) || typeof item.content !== "string") continue;
        const content = item.content.trim().slice(0, 1200);
        if (content) contents.push({ role: item.role, parts: [{ text: content }] });
      }
      if (!contents.length || contents[contents.length - 1].role !== "user") {
        return json({ error: "No se encontró un mensaje válido." }, 400, origin);
      }
      try {
        const requestBody = JSON.stringify({
          systemInstruction: { parts: [{ text: SYSTEM_INSTRUCTION }] },
          contents,
          generationConfig: { temperature: 0.9, maxOutputTokens: 500 }
        });
        const callGemini = (model) => fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
          method: "POST",
          headers: { "Content-Type": "application/json", "x-goog-api-key": env.GEMINI_API_KEY },
          body: requestBody
        });

        // Primary model first; automatically fall back to a lighter model on temporary overload.
        let response = await callGemini("gemini-3.8-flash");
        let data = await response.json();
        if (response.status === 429 || response.status === 503) {
          response = await callGemini("gemini-3.5-flash-lite");
          data = await response.json();
        }
        if (!response.ok) {
          if (response.status === 429 || response.status === 503) {
            const lastMessage = contents[contents.length - 1].parts[0].text;
            return json({ reply: offlineReply(lastMessage), mode: "automatic_fallback" }, 200, origin);
          }
          return json({ error: `GEMINI_ERROR_${response.status}: ${data.error?.message || "Falló la llamada a Gemini."}` }, 502, origin);
        }
        const answer = data.candidates?.[0]?.content?.parts?.map(part => part.text || "").join("").trim();
        if (!answer) return json({ error: "La IA no devolvió texto. Probá de nuevo." }, 502, origin);
        return json({ reply: answer }, 200, origin);
      } catch {
        return json({ error: "No pude conectar con el servicio de IA. Probá de nuevo." }, 502, origin);
      }
    }
    return env.ASSETS.fetch(request);
  }
};
