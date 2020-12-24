import { Ability, AbilityClass } from '@casl/ability';
import { Article } from '../models/Article';

type Actions = 'manage' | 'create' | 'read' | 'update' | 'delete' | 'publish';
type Subjects = 'Article' | Article | 'all';

export type AppAbility = Ability<[Actions, Subjects]>;
export const AppAbility = Ability as AbilityClass<AppAbility>;

export function createAbility() {
  const ability = new AppAbility();
  ability.can = ability.can.bind(ability);
  ability.cannot = ability.cannot.bind(ability);

  return ability;
}
