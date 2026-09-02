// Structured grounded-conversation memory for follow-up questions (see
// SNABBB-CROSS-APP-MOLAR-AI-CONVERSATIONAL-CONTINUITY-ENHANCEMENT). Same
// design as the Todo/Inventory/Appointment reference implementations.
//
// SCOPE: only `profit_latest_saved_plan` currently has a follow-up
// handler (see resolveProfitFollowUp.ts) — "why" is answerable from that
// intent's own already-resolved facts. `profit_cost_summary` has no
// safe analytical follow-up yet: this repo has no authoritative
// category-level cost breakdown Data Chat can read (see
// groundedDataResult.ts's own header on the three divergent profit/cost
// formula implementations), so "what affected it most?" stays an honest
// no_match/limitation rather than an invented answer.

import type { ProfitDataIntent } from '../contracts/groundedDataResult';

export interface GroundedConversationContext {
  appId: 'calculator';
  lastIntent: ProfitDataIntent;
  lastUserQuestion: string;
  generation: number;
  createdAt: string;
}
