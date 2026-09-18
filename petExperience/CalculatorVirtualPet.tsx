import { createCalculatorVirtualPet } from '@mrburdeveloperteam/pet-function/apps/calculator';
import { supabase } from '../lib/supabase';
import { calculatorPetRepository } from './calculatorPetRepository';
const CalculatorVirtualPet = createCalculatorVirtualPet(supabase, calculatorPetRepository);
export default CalculatorVirtualPet;
