/**
 * Pushes a single activity event to Odoo. Mirrors the same sync built for
 * the inventory, appointment, to-do, and e-learning apps — same
 * idempotency-key pattern, same best-effort fire-and-forget semantics, same
 * X-Snabbb-Api-Key + email auth model.
 *
 * This app ships its own `public/_worker.js` (Cloudflare Pages Advanced
 * Mode) with real `/api/wallet` and `/api/user/theme` logic already talking
 * to Odoo — same shape as the to-do app's worker.js, which turned out to be
 * genuinely live. UNLIKE the to-do app though, don't assume this one is
 * live without checking: the e-learning app looked the same way and turned
 * out to be intercepted by a separate Workers Route pointing at the shared
 * `snabbb-worker` instead. Test `/api/calculator/activity` in the Network
 * tab after deploying — if the response isn't `{ ok: true, ... }` JSON from
 * this worker, see SNABBB_WORKER_calculator_activity_route.js instead (not
 * included by default — ask for it if this turns out to be dead code too).
 *
 * This call is best-effort: activity logging must never block the UI or
 * fail the underlying Supabase write, so callers should fire-and-forget it
 * and swallow/log errors rather than await + throw.
 */

const ACTIVITY_ENDPOINT = '/api/calculator/activity';

export interface CalculatorActivityPayload {
  logId: string; // idempotency key so retries don't double-log in Odoo
  actorEmail: string | null; // used by the worker/Odoo to resolve the partner
  actorName: string | null;
  supabaseUserId: string | null;
  action: string; // e.g. "plan_saved", "procedure_deleted", "config_saved", ...
  details: string;
  occurredAt: string; // ISO timestamp
}

export async function logActivityToOdoo(params: CalculatorActivityPayload): Promise<boolean> {
  if (!params.actorEmail) {
    // Nothing to resolve the Odoo partner by — skip rather than send a
    // request we know the backend will reject.
    console.warn('Skipping Odoo activity sync: no actor email available.');
    return false;
  }

  const payload = {
    external_ref: `calculator-activity-${params.logId}`,
    actor_email: params.actorEmail,
    actor_name: params.actorName ?? null,
    supabase_user_id: params.supabaseUserId ?? null,
    action: params.action,
    details: params.details,
    occurred_at: params.occurredAt,
  };

  try {
    const res = await fetch(ACTIVITY_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const data = await res.json().catch(() => null);
    if (!res.ok || data?.ok === false) {
      console.error('Failed to sync activity to Odoo:', data?.error || res.status);
      return false;
    }
    return true;
  } catch (err: any) {
    // Best-effort: the worker/Odoo being unreachable should never break the local write.
    console.error('Failed to sync activity to Odoo:', err?.message || err);
    return false;
  }
}
