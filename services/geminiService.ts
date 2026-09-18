import { createCalculatorSNAIService } from '@mrburdeveloperteam/pet-function/apps/calculator';
import { supabase } from '../lib/supabase';
export const { chatWithMolarAI, chatWithGroundedProfitFacts, routeCalculatorCapability } = createCalculatorSNAIService(supabase);
export type CapabilityRouteResult = Awaited<ReturnType<typeof routeCalculatorCapability>>;
