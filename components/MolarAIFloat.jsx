import { createCalculatorMolarAIFloat } from '@mrburdeveloperteam/pet-function/apps/calculator';
import { supabase } from '../lib/supabase';
import { useCalculator } from '../context/CalculatorContext';
import { useAuth } from '../context/AuthContext';
const MolarAIFloat = createCalculatorMolarAIFloat({ supabase, useCalculator, useAuth });
export default MolarAIFloat;
