import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY });
const modelId = 'gemini-3-flash-preview';

type ChatPart = { text: string };
type ChatMessage = { role: 'user' | 'model'; parts: ChatPart[] };

export async function chatWithMolarAI(
  history: ChatMessage[],
  message: string,
  userContext = ''
) {
  try {
    const hasContext = userContext.trim().length > 30;
    const systemInstruction = `
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

${hasContext ? `--- CALCULATOR CONTEXT ---\n${userContext}\n--- END CONTEXT ---` : ''}

Current date: ${new Date().toISOString().split('T')[0]}
`;

    const contents = [
      { role: 'user' as const, parts: [{ text: systemInstruction }] },
      { role: 'model' as const, parts: [{ text: 'I am SNAI, ready to help with calculator planning.' }] },
      ...history,
      { role: 'user' as const, parts: [{ text: message }] },
    ];

    const response = await ai.models.generateContent({
      model: modelId,
      contents,
      config: { responseMimeType: 'text/plain' },
    });

    const text = response.text;
    if (!text) throw new Error('No response from Gemini');
    return text;
  } catch (error) {
    console.error('Gemini Chat Error:', error);
    return "I'm having trouble connecting to the Snabbb Assistant Intelligent servers right now. Please try again shortly.";
  }
}

// ─────────────────────────────────────────────────────────────
// DATA-DRIVEN CHAT — grounded response phrasing ONLY.
//
// Architecturally SEPARATE from `chatWithMolarAI` above: called only
// AFTER a deterministic local intent router + deterministic integrity
// gate + the EXISTING authoritative `getGlobalTotalMonthlyCost()` (see
// aiExperience/dataChat/) have already produced a minimized, model-safe
// facts object. Gemini here NEVER computes cost, sums categories, infers
// missing values, or recomputes the formula — it only phrases the
// already-computed number. It also never receives the full `aiContext`
// string `chatWithMolarAI` does (route/counts/etc.) — only the user's
// question, the approved intent name, and the already-computed facts.
//
// CRITICAL: unlike `chatWithMolarAI`, this function THROWS on failure
// (missing API key, network error, empty response) rather than
// swallowing it into a friendly fallback string — the caller needs to
// distinguish success from failure so it can render a deterministic
// facts-only fallback instead (see
// aiExperience/dataChat/utils/formatGroundedProfitFallback.ts) rather
// than ever falling through to the full legacy General Chat pipeline.
//
// The returned text is plain assistant text ONLY. It is never scanned
// for fenced ```json action blocks — this function has no path to
// `window.__MOLAR_ACTIONS__` or any calculator mutation.
export async function chatWithGroundedProfitFacts(
  question: string,
  intent: string,
  facts: unknown
): Promise<string> {
  const systemInstruction = `
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

  const contents = [
    { role: 'user' as const, parts: [{ text: systemInstruction }] },
    { role: 'model' as const, parts: [{ text: 'Understood — I will use only the provided facts and invent nothing.' }] },
    { role: 'user' as const, parts: [{ text: question }] },
  ];

  const response = await ai.models.generateContent({
    model: modelId,
    contents,
    config: { responseMimeType: 'text/plain' },
  });

  const text = response.text;
  if (!text || !text.trim()) throw new Error('Empty grounded response from Gemini');

  return text.trim();
}
