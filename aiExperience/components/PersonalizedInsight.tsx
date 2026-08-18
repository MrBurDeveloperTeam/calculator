import React from 'react';
import { AlertTriangle, Info } from 'lucide-react';
import type { InsightCandidate } from '../contracts/insightCandidate';

// Small, presentation-only component. Deliberately contains NO
// deterministic business logic — it only renders whatever candidate
// useProfitCalculatorPersonalizedInsight already resolved. All
// eligibility/latest-selection/priority decisions live in ../providers,
// ../utils, and ../resolver, never here.
//
// Reuses this app's existing Tailwind utility-class visual language (see
// Dashboard.tsx's own "Financial Planning & Scenarios" note card for the
// closest existing precedent) rather than inventing new visual
// primitives — one style per `candidate.priority` (MEDIUM/INFO), still
// exactly ONE card ever rendered.

interface PersonalizedInsightProps {
  // `unknown` here (never `any`) — this component only ever reads
  // `.message`/`.action`, never `.facts`, so any concrete
  // `InsightCandidate<TFacts>` is structurally assignable.
  candidate: InsightCandidate<unknown> | null;
  onAction: () => void;
}

const PRIORITY_STYLES: Record<string, { border: string; bg: string; text: string; icon: string }> = {
  MEDIUM: {
    border: 'border-amber-200',
    bg: 'bg-amber-50',
    text: 'text-amber-800',
    icon: 'text-amber-600',
  },
  INFO: {
    border: 'border-blue-100',
    bg: 'bg-gradient-to-r from-blue-50 to-indigo-50',
    text: 'text-blue-800',
    icon: 'text-blue-600',
  },
};

export const PersonalizedInsight: React.FC<PersonalizedInsightProps> = ({ candidate, onAction }) => {
  if (!candidate) return null;

  const style = PRIORITY_STYLES[candidate.priority] || PRIORITY_STYLES.INFO;
  const Icon = candidate.priority === 'MEDIUM' ? AlertTriangle : Info;

  return (
    <div
      className={`w-full min-w-0 ${style!.bg} border ${style!.border} rounded-xl p-4 sm:p-6 flex flex-col md:flex-row gap-4 items-start md:items-center justify-between`}
    >
      <div className="flex min-w-0 gap-3 items-start">
        <Icon className={`w-5 h-5 ${style!.icon} flex-shrink-0 mt-0.5`} />
        <p className={`${style!.text} text-sm font-medium`}>{candidate.message}</p>
      </div>
      {candidate.action && (
        <button
          type="button"
          onClick={onAction}
          className="flex-shrink-0 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 px-4 py-2 rounded-lg shadow-sm text-sm font-semibold transition-all"
        >
          {candidate.action.label}
        </button>
      )}
    </div>
  );
};
