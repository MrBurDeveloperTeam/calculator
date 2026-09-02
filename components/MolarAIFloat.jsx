import { useEffect, useMemo, useState } from 'react';
import { SharedMolarAI } from '@mrburdeveloperteam/molar-experience/ai';
import { supabase } from '../lib/supabase';
import { useCalculator } from '../context/CalculatorContext';
import { useAuth } from '../context/AuthContext';
import { createProfitCalculatorMolarAdapter } from '../aiExperience/profitCalculatorMolarAdapter';
import { MOLAR_LOGO_URL } from '../aiExperience/molarExperienceAssets';

// PHASE 4D NOTE (Molar AI extraction): this file is now a LOCAL adapter
// only — the floating button, chat panel, message rendering, markdown,
// input/loading/error UI, and generic send/scroll/clear lifecycle all
// live in @mrburdeveloperteam/molar-experience/ai's <SharedMolarAI>. This
// component's job is: (1) build the AIAdapter Profit Calculator's own
// business logic implements (see
// ../aiExperience/profitCalculatorMolarAdapter.ts — moved mechanically,
// not rewritten), and (2) fetch the empty-state welcome
// title/subtitle/prompt-suggestions data this app has always pulled from
// AIBoard, reactively feeding it to the shared component.
//
// KNOWN, ACCEPTED TIMING SEAM (same pattern as Content Studio's Phase 3C
// migration): the empty-state AIBoard config now fetches once on mount
// rather than only when the panel is first opened, because the shared
// component's open/closed state is intentionally internal to it, not
// exposed back to hosts. This is one cheap, harmless, read-only query
// per page load — it has no effect on anything the user sees.
export default function MolarAIFloat({ userContext, disabled = false, onPetToggle }) {
  const { state: calculatorState, getGlobalTotalMonthlyCost, calculatorDataStatus, calculatorDataUserId, savedPlans } = useCalculator();
  const { user } = useAuth();

  const [emptyState, setEmptyState] = useState(undefined);

  useEffect(() => {
    let cancelled = false;
    const fetchSimConfig = async () => {
      try {
        const { data: configs } = await supabase
          .from('aiboard_simulator_configs')
          .select('id, title, subtitle')
          .eq('module_name', 'Profit Calculator')
          .limit(1);

        const fallbackPrompts = [
          { label: 'Review my cost structure', iconName: 'Zap' },
          { label: 'Check procedure margins', iconName: 'ShieldCheck' },
          { label: 'Find pricing risks', iconName: 'AlertCircle' },
          { label: 'Forecast clinic profit', iconName: 'BarChart3' },
        ];

        if (configs && configs.length > 0) {
          const title = configs[0].title;
          const subtitle = configs[0].subtitle || 'Ready to assist with pricing, costs, margins, forecasts, and ROI planning.';

          const { data: promptData } = await supabase
            .from('aiboard_simulator_prompts')
            .select('text, icon_name, sort_order')
            .eq('config_id', configs[0].id)
            .order('sort_order', { ascending: true });

          const prompts = promptData && promptData.length > 0
            ? promptData.map((p) => ({ label: p.text, iconName: p.icon_name }))
            : fallbackPrompts;

          if (!cancelled) setEmptyState({ title, subtitle, prompts });
        } else if (!cancelled) {
          setEmptyState({ prompts: fallbackPrompts });
        }
      } catch (err) {
        console.error('Error fetching sim configs:', err);
      }
    };

    fetchSimConfig();
    return () => { cancelled = true; };
  }, []);

  const adapter = useMemo(
    () => createProfitCalculatorMolarAdapter({
      calculatorState,
      getGlobalTotalMonthlyCost,
      calculatorDataStatus,
      calculatorDataUserId,
      userId: user?.id ?? null,
      userContext: userContext || '',
      savedPlans,
    }),
    [calculatorState, getGlobalTotalMonthlyCost, calculatorDataStatus, calculatorDataUserId, user?.id, userContext, savedPlans]
  );

  return (
    <SharedMolarAI
      adapter={adapter}
      disabled={disabled}
      onPetToggle={onPetToggle}
      emptyState={emptyState}
      logoUrl={MOLAR_LOGO_URL}
    />
  );
}
