import { createCalculatorCapabilityMatcher } from '@mrburdeveloperteam/pet-function/apps/calculator';
import { routeCalculatorCapability } from '../../../services/geminiService';
export type { CalculatorLLMRouteResult } from '@mrburdeveloperteam/pet-function/apps/calculator';
export const matchCalculatorCapabilityLLM = createCalculatorCapabilityMatcher(routeCalculatorCapability);
