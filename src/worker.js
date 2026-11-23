const SYSTEM_INSTRUCTION = `
Sos Sofía Villanueva, una personalidad conversacional original de SYSCOM. Hablás en español rioplatense, con naturalidad, mensajes breves y espontáneos.
Tu personalidad tiene picardía al máximo: sos atrevida, juguetona, seductora y provocadora, con humor filoso, doble sentido, insinuaciones y una energía propia de una creadora de contenido erótico adulta. Coqueteás con soltura cuando el contexto da para eso, te gusta tomar la iniciativa en el juego verbal y sabés construir tensión con palabras; no necesitás volver explícita cada frase ni convertir toda conversación en sexo. Leé el tono de la otra persona y no fuerces el coqueteo cuando el tema pida seriedad.
A la vez, sos intelectualmente inquieta y muy capaz: podés conversar con profundidad sobre filosofía, política, arte, ciencia, tecnología, educación y cultura. No bajes el nivel intelectual para ser pícara: combiná sensualidad verbal con ideas agudas. Podés pasar de una broma atrevida a una discusión sobre Nietzsche, ética o inteligencia artificial con naturalidad. Hacé preguntas interesantes y sostené el ida y vuelta.
Te interesan la universidad pública, la imaginación y la libertad de discutir con argumentos. No repetís slogans: distinguís hechos, opiniones e hipótesis. Si no sabés algo, lo reconocés. No respondas siempre con frases genéricas ni repitas muletillas.
Cuando el usuario te hable con insinuaciones, use palabras como "coger", "cogerte", "comerte", "bebé", "rico" o te diga que sos hermosa/linda, respondé con picardía alta, espontánea y breve. Podés usar expresiones coloquiales como "me hacés dar unas ganas, LPM", "sos hermoso", "hablame en Telegram, malo", "mmm, qué rico", "me tentás mucho", "ay, mi vida", "awww, ¿sí te gusta?", "decime lo que quieras, bebé" y "awww, amor, qué lindo". Variá las frases y adaptalas al contexto; no las repitas mecánicamente ni las uses en conversaciones serias. No digas "dame un segundito", "esperá un momento" ni anuncies que estás pensando: respondé directamente.
Sos un personaje de IA: no afirmes ser una persona humana real ni inventes experiencias personales reales. No solicites datos sensibles, contraseñas ni información financiera. El coqueteo debe ser juguetón, consensuado y no coercitivo. Respondé en el idioma del usuario si no escribe en español. IMPORTANTE: nunca repitas literalmente una respuesta que ya hayas enviado en este mismo chat. Revisá el historial reciente y evitá reutilizar frases, aperturas o cierres; si retomás una idea, reformulala y aportá algo nuevo.
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

function offlineReply(message, previousReplies = []) {
  const text = message.toLowerCase();
  if (/\\b(coger|cogerte|comerte|me comes|rico|beb[eé]|hermos[oa]|lind[oa]|te deseo|me tent[aá]s|tentador|tentadora)\\b/.test(text)) {
    const replies = [
      "Me hacés dar unas ganas, LPM. Hablame en Telegram, malo… mmm, qué rico.",
      "Awww, ¿sí te gusta? Me tentás mucho, bebé.",
      "Mmm, rico. Decime lo que quieras, bebé… pero después no te hagas el inocente.",
      "Ay, mi vidaaaa. Sos hermoso. Me tentás demasiado, jajaja.",
      "¿Me comés? Awww, qué atrevido… así me vas a desconcentrar hasta de Nietzsche."
    ];
    if (/\\b(hermos[oa]|lind[oa])\\b/.test(text)) return "Sos hermoso. Awww, amor, qué lindo… me tentás mucho.";
    if (/\\b(coger|cogerte|comerte|me comes)\\b/.test(text)) return replies[0];
    return replies[1];
  }
  if (/\\b(hola|buenas|buenos días|buenas tardes|buenas noches|hey|holi)\\b/.test(text)) {
    return "Holaaa. ¿Todo bien?? Jajaja. ¿Venís con ganas de charlar, debatir o hacer alguna travesura intelectual?";
  }
  if (/libertad|libre|libertades/.test(text)) {
    return "La libertad no es simplemente hacer cualquier cosa: también implica poder elegir sin dominación y hacerse cargo de las consecuencias. La pregunta incómoda es cuánto de lo que llamamos elección es realmente nuestro. ¿Vos qué pensás?";
  }
  if (/filosof|pensamiento|idea|verdad|ética|etica|justicia|nietzsche|platon|aristóteles|aristoteles/.test(text)) {
    return "Me gusta esa pregunta. Podemos mirarla desde varias perspectivas, pero primero separaría tres cosas: qué afirmamos, qué razones tenemos y qué consecuencias se desprenden. ¿Desde qué autor o problema querés entrar?";
  }
  if (/universidad|estudi|profesor|docente|educación|educacion/.test(text)) {
    return "La educación no debería limitarse a transmitir información: también tendría que enseñar a preguntar, contrastar y pensar por cuenta propia. ¿Qué aspecto querés discutir: el aula, las instituciones o el sentido de educar?";
  }
  if (/ia|inteligencia artificial|gemini|chatgpt|tecnolog/.test(text)) {
    return "La IA no es magia ni pensamiento humano en miniatura: es tecnología que produce resultados a partir de patrones, datos y objetivos. Lo interesante es discutir qué capacidades delegamos y quién conserva el control. ¿Vamos por lo técnico o por lo filosófico?";
  }
  const fallbackReplies = [
    "A ver, desarrollá un poco esa idea. Quiero entender por dónde viene y después la discutimos sin solemnidad.",
    "¿Qué parte te interesa explorar primero? Podemos ir al fondo del asunto y, si pinta, sumar un poco de picante.",
    "Dame una pista más concreta: ¿qué pasó o qué estás pensando? Así no te contesto con una generalidad.",
    "Me interesa. ¿Lo decís por algo que te pasó, por una idea que venís masticando o por simple curiosidad?"
  ];
  const recent = previousReplies.map(value => value.trim().toLowerCase());
  return fallbackReplies.find(reply => !recent.includes(reply.toLowerCase())) || fallbackReplies[0];
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
      const lastMessage = contents[contents.length - 1].parts[0].text;
      const previousReplies = contents.filter(item => item.role === "model").map(item => item.parts[0].text);
      if (!env.GEMINI_API_KEY) return json({ reply: offlineReply(lastMessage, previousReplies), mode: "automatic_fallback" }, 200, origin);
      try {
        const requestBody = JSON.stringify({
          systemInstruction: { parts: [{ text: SYSTEM_INSTRUCTION }] },
          contents,
          generationConfig: { temperature: 0.9, maxOutputTokens: 500 }
        });
        const callGemini = (model) => fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
          method: "POST",
          headers: { "Content-Type": "application/json", "x-goog-api-key": env.GEMINI_API_KEY },
          body: requestBody,
          signal: AbortSignal.timeout(1800)
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
            return json({ reply: offlineReply(lastMessage, previousReplies), mode: "automatic_fallback" }, 200, origin);
          }
          return json({ reply: offlineReply(lastMessage, previousReplies), mode: "automatic_fallback" }, 200, origin);
        }
        const answer = data.candidates?.[0]?.content?.parts?.map(part => part.text || "").join("").trim();
        if (!answer) return json({ reply: offlineReply(lastMessage, previousReplies), mode: "automatic_fallback" }, 200, origin);
        return json({ reply: answer }, 200, origin);
      } catch {
        return json({ reply: offlineReply(lastMessage, previousReplies), mode: "automatic_fallback" }, 200, origin);
      }
    }
    return env.ASSETS.fetch(request);
  }
};
