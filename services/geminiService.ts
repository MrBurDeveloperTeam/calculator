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
