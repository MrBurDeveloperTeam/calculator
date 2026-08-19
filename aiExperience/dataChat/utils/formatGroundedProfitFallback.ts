// Mandatory deterministic fallback — used ONLY when a deterministic
// provider succeeded (`status: 'ok'`) but the grounded Gemini phrasing
// request itself failed. Renders the full answer directly from the same
// model-safe facts, zero LLM involvement — never falls through to
// legacy General Chat.
//
// Number formatting mirrors the existing UI convention (e.g.
// components/Dashboard.tsx: `` `${currencySymbol} ${value.toLocaleString(undefined,
// {minimumFractionDigits:2, maximumFractionDigits:2})}` `` ) rather than
// inventing a new rounding/separator rule — no authoritative shared
// formatter function exists in this repo to import instead.

import type { ProfitDataIntent } from '../contracts/groundedDataResult';
import type { CostSummaryDataFacts } from '../providers/costSummaryDataProvider';

function formatAmount(value: number, currencySymbol: string): string {
  const formatted = value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return currencySymbol ? `${currencySymbol} ${formatted}` : formatted;
}

function formatCostSummary(facts: CostSummaryDataFacts): string {
  return `Based on your current monthly calculator configuration, your total monthly cost is ${formatAmount(
    facts.totalMonthlyCost,
    facts.currencySymbol
  )}.`;
}

export function formatGroundedProfitFallback(intent: ProfitDataIntent, facts: unknown): string {
  switch (intent) {
    case 'profit_cost_summary':
      return formatCostSummary(facts as CostSummaryDataFacts);
    default:
      return "I couldn't format your answer right now.";
  }
}
