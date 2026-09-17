import { SharedMeowdokuLauncher } from '@mrburdeveloperteam/pet-function/pet';
import { supabase } from '../lib/supabase';
import { calculatorPetRepository } from './calculatorPetRepository';

export default function MeowdokuLauncher(props: { isOpen: boolean; onClose: () => void; userId: string }) {
  return <SharedMeowdokuLauncher key={props.userId} {...props} repository={calculatorPetRepository} rpcClient={supabase} />;
}
