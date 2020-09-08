import { useAbility } from '@casl/react';
import { createContext } from 'react';
import { AppAbility } from '../services/ability';

export const AbilityContext = createContext<AppAbility>(null as unknown as AppAbility);
export const useAppAbility = () => useAbility(AbilityContext);
