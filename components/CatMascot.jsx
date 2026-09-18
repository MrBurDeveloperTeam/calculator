import { CalculatorCatMascot } from '@mrburdeveloperteam/pet-function/apps/calculator';
import { supabase } from '../lib/supabase';
export default function CatMascot(props) { return <CalculatorCatMascot {...props} supabase={supabase} />; }
