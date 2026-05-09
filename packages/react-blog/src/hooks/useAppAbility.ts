import { useAbility } from '@casl/react';
import type { AppAbility } from '../services/ability';

export const useAppAbility = () => useAbility<AppAbility>();
