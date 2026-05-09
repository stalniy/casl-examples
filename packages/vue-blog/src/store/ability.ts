import { createMongoAbility } from '@casl/ability';
import type { MutationPayload, Store } from 'vuex';
import type { AppAbility, RootState, Session } from '../types';

export const ability = createMongoAbility<AppAbility>();

export default (store: Store<RootState>) => {
  ability.update(store.state.rules);

  return store.subscribe((mutation: MutationPayload) => {
    switch (mutation.type) {
    case 'createSession':
      ability.update((mutation.payload as Session).rules);
      break;
    case 'destroySession':
      ability.update([{ action: 'read', subject: 'all' }]);
      break;
    default:
      break;
    }
  });
};
