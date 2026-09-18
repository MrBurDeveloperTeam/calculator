import { createCalculatorPetRepository } from '@mrburdeveloperteam/pet-function/apps';
import { supabase } from '../lib/supabase';
export const calculatorPetRepository = createCalculatorPetRepository(supabase);
