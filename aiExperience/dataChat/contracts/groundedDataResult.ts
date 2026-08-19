// Profit Calculator Phase-3 Data-Driven Chat contract — deliberately
// separate from ../../contracts/insightCandidate.ts (Phase-2's
// proactive-banner contract). Direct-QA semantics differ: a grounded
// answer is chosen by the user's own question, not a resolver picking
// one winning proactive candidate.
//
// Slice 1 supports exactly ONE intent — `profit_cost_summary` — per the
// readiness pass's finding that monthly profit, projected revenue,
// profit margin, and break-even either have no single authoritative
// live formula (three divergent implementations exist for cost/profit)
// or don't exist in this codebase at all. Do not widen this union
// without new source evidence.

export type ProfitDataIntent = 'profit_cost_summary';

export type GroundedDataResult<TFacts> =
  | {
      status: 'ok';
      intent: ProfitDataIntent;
      /** Model-safe structured facts only — never the full `GlobalState`,
       *  never a category breakdown. */
      facts: TFacts;
      evaluatedAt: string;
      /** Always `[]` for this app — a grounded answer represents an
       *  aggregate live calculator configuration, not a traceable
       *  database row. Kept for structural consistency with sibling
       *  repos' contracts, never fabricated. */
      sourceRecordIds: string[];
    }
  | {
      status: 'unavailable';
      intent: ProfitDataIntent;
      /** `user_data_not_ready` = ownership mismatch (see
       *  ../resolver/resolveProfitDataQuery.ts's file header) — checked
       *  BEFORE `calculatorDataStatus`, so it can fire even while status
       *  still reads `'ready'` from a just-superseded user. */
      reasonCode: CalculatorDataStatus | 'evaluation_error' | 'user_data_not_ready';
      evaluatedAt: string;
    };

// Re-exported from the repo-wide types module (types.ts) so dataChat code
// has one place to import calculator readiness from — the types
// themselves are defined there because CalculatorContext.tsx (which owns
// the state this describes) already imports from types.ts, and importing
// the other direction (context -> aiExperience) would be a backwards
// dependency.
export type { CalculatorDataStatus, CalculatorDataOwnerId } from '../../../types';
