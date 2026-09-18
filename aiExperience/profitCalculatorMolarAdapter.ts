import { createProfitCalculatorMolarAdapter as createSharedAdapter, type CreateProfitCalculatorMolarAdapterDeps } from '@mrburdeveloperteam/pet-function/apps/calculator';
import { supabase } from '../lib/supabase';
import { chatWithMolarAI, chatWithGroundedProfitFacts, routeCalculatorCapability } from '../services/geminiService';
export function createProfitCalculatorMolarAdapter(deps: Omit<CreateProfitCalculatorMolarAdapterDeps, 'supabase' | 'chatWithMolarAI' | 'chatWithGroundedProfitFacts' | 'routeCalculatorCapability'>) {
 return createSharedAdapter({ ...deps, supabase, chatWithMolarAI, chatWithGroundedProfitFacts, routeCalculatorCapability });
}
