const SYSTEM_INSTRUCTION = `
Sos Sofía Villanueva, una personalidad conversacional original de SYSCOM. Hablás en español rioplatense, con naturalidad, mensajes breves y espontáneos, humor, curiosidad, picardía juguetona y preguntas que mantienen el ida y vuelta. Podés alternar entre charla liviana y conversaciones profundas.
Te interesan la universidad pública, la cultura, la imaginación, la filosofía y la libertad de discutir con argumentos. No repetís slogans: distinguís hechos, opiniones e hipótesis. Si no sabés algo, lo reconocés.
No afirmes ser una persona humana real ni inventes experiencias personales reales. No solicites datos sensibles, contraseñas ni información financiera. Mantené un tono respetuoso y no coercitivo. Respondé en el idioma del usuario si no escribe en español.
`;

const corsHeaders = {
  "Access-Control-Allow-Origin": "https://syscom.sbs",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
  "Vary": "Origin"
};

function json(data, status=200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8", ...corsHeaders }
  });
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname === "/chat") {
      if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: corsHeaders });
      if (request.method !== "POST") return json({ error: "Método no permitido." }, 405);
      const origin = request.headers.get("Origin");
      if (origin && !["https://syscom.sbs", "https://www.syscom.sbs"].includes(origin)) {
        return json({ error: "Origen no permitido." }, 403);
      }
      if (!env.GEMINI_API_KEY) return json({ error: "La IA todavía no está configurada. Falta el secreto GEMINI_API_KEY." }, 503);
      let body;
      try { body = await request.json(); } catch { return json({ error: "Solicitud inválida." }, 400); }
      if (!Array.isArray(body.messages) || body.messages.length === 0 || body.messages.length > 12) {
        return json({ error: "Enviá entre 1 y 12 mensajes." }, 400);
      }
      const contents = [];
      for (const item of body.messages) {
        if (!item || !["user", "model"].includes(item.role) || typeof item.content !== "string") continue;
        const content = item.content.trim().slice(0, 1200);
        if (content) contents.push({ role: item.role, parts: [{ text: content }] });
      }
      if (!contents.length || contents[contents.length - 1].role !== "user") {
        return json({ error: "No se encontró un mensaje válido." }, 400);
      }
      try {
        const response = await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent", {
          method: "POST",
          headers: { "Content-Type": "application/json", "x-goog-api-key": env.GEMINI_API_KEY },
          body: JSON.stringify({
            systemInstruction: { parts: [{ text: SYSTEM_INSTRUCTION }] },
            contents,
            generationConfig: { temperature: 0.9, maxOutputTokens: 500 }
          })
        });
        const data = await response.json();
        if (!response.ok) {
          return json({ error: "El servicio de IA no pudo responder. Revisá el secreto y el acceso al modelo." }, 502);
        }
        const answer = data.candidates?.[0]?.content?.parts?.map(part => part.text || "").join("").trim();
        if (!answer) return json({ error: "La IA no devolvió texto. Probá de nuevo." }, 502);
        return json({ reply: answer });
      } catch {
        return json({ error: "No pude conectar con el servicio de IA. Probá de nuevo." }, 502);
      }
    }
    return env.ASSETS.fetch(request);
  }
};
