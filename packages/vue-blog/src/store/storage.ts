import type { RootState } from '../types';

const STATE_KEY = 'vuex-state';

interface StorageOptions {
  storedKeys: Array<keyof RootState>;
  destroyOn?: string[];
}

type StoreLike = {
  state: RootState;
  replaceState: (state: RootState) => void;
  subscribe: (handler: (mutation: { type: string }, state: RootState) => void) => () => void;
};

export default (options: StorageOptions) => (store: StoreLike) => {
  const rawStoredState = localStorage.getItem(STATE_KEY);

  if (rawStoredState) {
    const storedState = JSON.parse(rawStoredState) as Partial<RootState>;
    store.replaceState(Object.assign({}, store.state, storedState));
  }

  return store.subscribe((mutation, state) => {
    if (options.destroyOn && options.destroyOn.includes(mutation.type)) {
      localStorage.removeItem(STATE_KEY);
      return;
    }

    const newState = options.storedKeys.reduce<Partial<RootState>>((map, key) => {
      Object.assign(map, { [key]: state[key] });
      return map;
    }, {});

    localStorage.setItem(STATE_KEY, JSON.stringify(newState));
  });
};
