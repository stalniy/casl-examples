import { createMongoAbility, MongoAbility } from '@casl/ability';
import { Article } from '../models/Article';

type Actions = 'manage' | 'create' | 'read' | 'update' | 'delete' | 'publish';
type Subjects = 'Article' | Article | 'all';

export type AppAbility = MongoAbility<[Actions, Subjects]>;

export function createAbility() {
  const ability = createMongoAbility<AppAbility>();
  ability.can = ability.can.bind(ability);
  ability.cannot = ability.cannot.bind(ability);

  return ability;
}
