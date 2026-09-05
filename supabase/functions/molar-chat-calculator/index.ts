// Server-only Gemini boundary for Molar AI (Profit Calculator). This is
// the ONLY place in this project that imports @google/genai, constructs
// a Gemini client, reads the Gemini provider credential, or calls
// generateContent — see ../../../services/geminiService.ts, which now
// only forwards requests here via
// supabase.functions.invoke('molar-chat-calculator', ...) (using the
// browser's already-authenticated Supabase session) and never touches
// the SDK/credential itself.
//
// Namespaced as "molar-chat-calculator", NOT the generic "molar-chat"
// slug: this shared Supabase project (opdotszsldcgwjqtvgul) also hosts
// separate, differently-prompted molar-chat functions for Appointment
// ("molar-chat-appointment"), Todo ("molar-chat-todo"), and App Gallery
// ("molar-chat-app-gallery"). Function slugs are unique per project — a
// shared generic name would let one app's deploy silently overwrite
// another's system prompt (confirmed to have actually happened: the old
// shared "molar-chat" slug was serving Appointment's own prompt to every
// other app's invocations before this namespacing, including this one —
// this app's real deployed content had been invisibly replaced).
//
// Requires a real authenticated Supabase user for every request — this
// is NOT an anonymous public provider endpoint. Rejects with 401 if the
// caller's bearer token does not resolve to a valid user.
//
// THREE request modes:
//   - "general": free-form General Chat (chatWithMolarAI's prior body).
//   - "grounded": grounded Data-Chat phrasing over host-selected,
//     already-minimized facts (chatWithGroundedProfitFacts's prior
//     body). This function never queries calculator tables, never
//     selects a saved plan, never chooses intent, and never
//     recalculates fixed costs/ROI — it only performs language
//     generation over facts the client already resolved
//     deterministically before calling here.
//   - "capability_route" (SNABBB-CROSS-APP-MOLAR-AI-INTELLIGENCE-ENHANCEMENT):
//     semantic capability SELECTION only — this mode NEVER sees
//     calculator state. It receives the user's message, a small set of
//     capability {id, description} pairs (only the 2 genuinely
//     supported ones — cost summary and latest saved plan; live
//     profit/margin/break-even/cost-driver are NEVER offered as
//     capabilities here, see groundedDataResult.ts's own header on the
//     divergent-formula correctness risk), a few recent model-safe
//     conversation turns, and the previously-selected capability id (if
//     any). Returns STRUCTURED JSON only, validated server-side against
//     the caller-supplied allowlist. The client re-validates
//     independently before executing anything (see
//     dataChat/semantic/matchCalculatorCapabilityLLM.ts).
import { createClient } from "npm:@supabase/supabase-js@2";
import { GoogleGenAI } from "npm:@google/genai";

const modelId = "gemini-3-flash-preview";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, apikey, content-type, x-client-info",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
  });
}

type ChatMessage = { role: "user" | "model"; parts: { text: string }[] };

function isValidHistory(history: unknown): history is ChatMessage[] {
  if (!Array.isArray(history)) return false;
  return history.every(
    (entry) =>
      entry &&
      typeof entry === "object" &&
      (entry.role === "user" || entry.role === "model") &&
      Array.isArray(entry.parts) &&
      entry.parts.every((p: unknown) => typeof (p as { text?: unknown })?.text === "string")
  );
}

function buildGeneralSystemInstruction(userContext: string): string {
  const hasContext = userContext.trim().length > 30;
  return `
You are SNAI (Snabbb Assistant Intelligent), the AI assistant for the Snabbb Dental Profit Calculator.

Your role:
- Help users understand dental procedure pricing, fixed costs, variable costs, margins, ROI, forecasts, and profitability.
- Use the calculator context when available.
- Give concise, operational guidance.
- Do not invent saved plans, exact costs, or database records that are not present in the context.
- If a user asks to change data, guide them to the relevant calculator section instead of claiming you changed it.

Useful UI guidance:
- Clinic assumptions are in Settings.
- Fixed costs are in Overhead, Staff, Depreciation, Regulatory, Financial, and Owner sections.
- Variable costs are in Consumables, Sterilization, Lab, and Marketing sections.
- Procedure pricing is in Procedure Builder.
- Forecast and ROI planning are available from the dashboard/planning modals.

${hasContext ? `--- CALCULATOR CONTEXT ---\n${userContext}\n--- END CONTEXT ---` : ""}

Current date: ${new Date().toISOString().split("T")[0]}
`;
}

function buildGroundedSystemInstruction(intent: string, facts: unknown): string {
  return `
You are answering ONE specific Profit Calculator data question using ONLY the structured facts provided below.

Approved intent: ${intent}
Facts (JSON, already computed by deterministic code — do not recompute or second-guess any number):
${JSON.stringify(facts)}

Rules — follow ALL of these exactly:
- Only state facts present in the JSON above. Never recompute, sum, or estimate any number yourself.
- Never invent missing categories, currencies, or figures not present in the facts.
- Never infer or guess a currency symbol — use exactly the one provided, or omit it if none was provided.
- Describe the figure as the user's current monthly calculator configuration — never as actual historical accounting spend, a specific calendar month's actual expenses, or "this month" in a calendar sense.
- Never mention or invent profit, revenue, profit margin, or break-even — those are not part of the supplied facts and are not answered by this intent.
- Never offer tax, investment, valuation, or other financial advice.
- Never claim a calculator input was changed, saved, or reset — you cannot make changes, only report data.
- Do NOT output a \`\`\`json code block or any similar machine-readable tag under any circumstance.
- Be concise — a sentence or two at most.
`;
}

interface CapabilityDescriptor {
  id: string;
  description: string;
}

function isValidCapabilityList(value: unknown): value is CapabilityDescriptor[] {
  if (!Array.isArray(value) || value.length === 0) return false;
  return value.every(
    (c) =>
      c &&
      typeof c === "object" &&
      typeof (c as { id?: unknown }).id === "string" &&
      typeof (c as { description?: unknown }).description === "string"
  );
}

function buildCapabilityRouteSystemInstruction(
  capabilities: CapabilityDescriptor[],
  recentContext: string[],
  previousCapability: string | null
): string {
  const capabilityList = capabilities.map((c) => `- "${c.id}": ${c.description}`).join("\n");
  const contextBlock =
    recentContext.length > 0 ? `\nRecent conversation (most recent last):\n${recentContext.map((c) => `- ${c}`).join("\n")}\n` : "";
  const prevBlock = previousCapability ? `\nThe previous grounded capability in this conversation was "${previousCapability}".` : "";

  return `
You are a CAPABILITY ROUTER for a dental Profit Calculator assistant. You do NOT have access to any financial data — you only decide which safe, pre-approved capability (if any) best answers the user's CURRENT message.

Available capabilities:
${capabilityList}
${contextBlock}${prevBlock}

Respond with JSON ONLY, matching this exact shape:
{"route": "grounded" | "general_chat" | "clarification", "capability": <one of the capability ids above, or null>, "confidence": "high" | "low", "clarification": <a short natural clarifying question, or null>}

Rules:
- "route":"grounded" requires "capability" to be EXACTLY one of the ids listed above (copy it verbatim) and "confidence":"high".
- Use "route":"clarification" (with "capability":null) ONLY when the message could reasonably mean two clearly different capabilities and you cannot tell which — write ONE short natural clarifying question.
- Use "route":"general_chat" (with "capability":null) for anything that is not a request for one of the capabilities above — including general advice, conversation, questions about live profit/margin/break-even (those are NOT in the list and must never be selected), or requests to change calculator data.
- Never invent a capability id that is not in the list above.
- Output JSON only — no prose, no markdown code fence.
`;
}

const CAPABILITY_ROUTE_SCHEMA = {
  type: "object",
  properties: {
    route: { type: "string", enum: ["grounded", "general_chat", "clarification"] },
    capability: { type: "string", nullable: true },
    confidence: { type: "string", enum: ["high", "low"] },
    clarification: { type: "string", nullable: true },
  },
  required: ["route", "confidence"],
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: CORS_HEADERS });
  }

  if (req.method !== "POST") {
    return json({ ok: false, error: "Method not allowed" }, 405);
  }

  // --- Require a real authenticated Supabase user. Never treat the mere
  // presence of an Authorization header, or the anon key alone, as proof
  // of a real user. ---
  const authHeader = req.headers.get("Authorization");
  if (!authHeader) {
    return json({ ok: false, error: "Unauthorized" }, 401);
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY");
  if (!supabaseUrl || !supabaseAnonKey) {
    console.error("[molar-chat-calculator] Missing SUPABASE_URL/SUPABASE_ANON_KEY runtime configuration.");
    return json({ ok: false, error: "Server is not configured." }, 500);
  }

  const supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
    global: { headers: { Authorization: authHeader } },
  });

  const {
    data: { user },
    error: authError,
  } = await supabaseClient.auth.getUser();

  if (authError || !user) {
    return json({ ok: false, error: "Unauthorized" }, 401);
  }

  const apiKey = Deno.env.get("GEMINI_API_KEY");
  if (!apiKey) {
    console.error("[molar-chat-calculator] Missing server-side GEMINI_API_KEY configuration.");
    return json({ ok: false, error: "AI service is not configured." }, 500);
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return json({ ok: false, error: "Invalid request body." }, 400);
  }

  const { mode } = (body ?? {}) as { mode?: unknown };

  if (mode !== "general" && mode !== "grounded" && mode !== "capability_route") {
    return json({ ok: false, error: "Invalid or missing mode." }, 400);
  }

  const ai = new GoogleGenAI({ apiKey });

  if (mode === "general") {
    const { message, history, userContext } = body as {
      message?: unknown;
      history?: unknown;
      userContext?: unknown;
    };

    if (typeof message !== "string" || !message.trim()) {
      return json({ ok: false, error: "Message is required." }, 400);
    }
    if (history !== undefined && !isValidHistory(history)) {
      return json({ ok: false, error: "Invalid history." }, 400);
    }
    if (userContext !== undefined && typeof userContext !== "string") {
      return json({ ok: false, error: "Invalid context." }, 400);
    }

    try {
      const systemInstruction = buildGeneralSystemInstruction(
        typeof userContext === "string" ? userContext : ""
      );

      const contents = [
        { role: "user", parts: [{ text: systemInstruction }] },
        { role: "model", parts: [{ text: "I am SNAI, ready to help with calculator planning." }] },
        ...((history as ChatMessage[] | undefined) ?? []),
        { role: "user", parts: [{ text: message }] },
      ];

      const response = await ai.models.generateContent({
        model: modelId,
        contents,
        config: { responseMimeType: "text/plain" },
      });

      const text = response.text;
      if (!text) {
        return json({ ok: false, error: "No response from AI service." }, 502);
      }

      return json({ ok: true, text });
    } catch (error) {
      console.error("[molar-chat-calculator] General chat provider error:", error);
      return json({ ok: false, error: "AI service request failed." }, 502);
    }
  }

  if (mode === "capability_route") {
    const { message, capabilities, recentContext, previousCapability } = body as {
      message?: unknown;
      capabilities?: unknown;
      recentContext?: unknown;
      previousCapability?: unknown;
    };

    if (typeof message !== "string" || !message.trim()) {
      return json({ ok: false, error: "Message is required." }, 400);
    }
    if (!isValidCapabilityList(capabilities)) {
      return json({ ok: false, error: "Invalid capabilities list." }, 400);
    }
    const boundedContext =
      Array.isArray(recentContext) && recentContext.every((c) => typeof c === "string")
        ? (recentContext as string[]).slice(-6)
        : [];
    const prevCap = typeof previousCapability === "string" ? previousCapability : null;

    try {
      const systemInstruction = buildCapabilityRouteSystemInstruction(capabilities, boundedContext, prevCap);

      const response = await ai.models.generateContent({
        model: modelId,
        contents: [
          { role: "user", parts: [{ text: systemInstruction }] },
          { role: "model", parts: [{ text: '{"route":"general_chat","capability":null,"confidence":"high","clarification":null}' }] },
          { role: "user", parts: [{ text: message }] },
        ],
        config: {
          responseMimeType: "application/json",
          responseSchema: CAPABILITY_ROUTE_SCHEMA,
        },
      });

      const raw = response.text;
      if (!raw || !raw.trim()) {
        return json({ ok: false, error: "Empty response from AI service." }, 502);
      }

      let parsed: unknown;
      try {
        parsed = JSON.parse(raw);
      } catch {
        return json({ ok: false, error: "Router returned invalid JSON." }, 502);
      }

      const route = (parsed as { route?: unknown })?.route;
      const capability = (parsed as { capability?: unknown })?.capability;
      const confidence = (parsed as { confidence?: unknown })?.confidence;
      const clarification = (parsed as { clarification?: unknown })?.clarification;

      if (route !== "grounded" && route !== "general_chat" && route !== "clarification") {
        return json({ ok: false, error: "Router returned an unsupported route." }, 502);
      }
      if (confidence !== "high" && confidence !== "low") {
        return json({ ok: false, error: "Router returned an invalid confidence." }, 502);
      }
      const allowedIds = new Set(capabilities.map((c) => c.id));
      if (route === "grounded") {
        if (typeof capability !== "string" || !allowedIds.has(capability)) {
          return json({ ok: false, error: "Router returned an unknown capability." }, 502);
        }
      }

      return json({
        ok: true,
        route,
        capability: route === "grounded" ? capability : null,
        confidence,
        clarification: route === "clarification" && typeof clarification === "string" ? clarification : null,
      });
    } catch (error) {
      console.error("[molar-chat-calculator] Capability route provider error:", error);
      return json({ ok: false, error: "AI service request failed." }, 502);
    }
  }

  // mode === "grounded"
  const { question, intent, facts } = body as {
    question?: unknown;
    intent?: unknown;
    facts?: unknown;
  };

  if (typeof question !== "string" || !question.trim()) {
    return json({ ok: false, error: "Question is required." }, 400);
  }
  if (typeof intent !== "string" || !intent.trim()) {
    return json({ ok: false, error: "Intent is required." }, 400);
  }
  if (facts === undefined) {
    return json({ ok: false, error: "Facts are required." }, 400);
  }

  try {
    const systemInstruction = buildGroundedSystemInstruction(intent, facts);

    const contents = [
      { role: "user", parts: [{ text: systemInstruction }] },
      { role: "model", parts: [{ text: "Understood — I will use only the provided facts and invent nothing." }] },
      { role: "user", parts: [{ text: question }] },
    ];

    const response = await ai.models.generateContent({
      model: modelId,
      contents,
      config: { responseMimeType: "text/plain" },
    });

    const text = response.text;
    if (!text || !text.trim()) {
      return json({ ok: false, error: "Empty response from AI service." }, 502);
    }

    return json({ ok: true, text: text.trim() });
  } catch (error) {
    console.error("[molar-chat-calculator] Grounded chat provider error:", error);
    return json({ ok: false, error: "AI service request failed." }, 502);
  }
});
