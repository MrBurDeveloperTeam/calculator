import { createCalculatorMolarAIFloat } from '@mrburdeveloperteam/pet-function/apps/calculator';
import { supabase } from '../lib/supabase';
import { useCalculator } from '../context/CalculatorContext';
import { useAuth } from '../context/AuthContext';
import { chatWithMolarAI, chatWithGroundedProfitFacts, routeCalculatorCapability } from '../services/geminiService';
const MolarAIFloat = createCalculatorMolarAIFloat({ supabase, useCalculator, useAuth, chatWithMolarAI, chatWithGroundedProfitFacts, routeCalculatorCapability });
export default MolarAIFloat;
