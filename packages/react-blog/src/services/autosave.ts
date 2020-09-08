import { reaction } from 'mobx';

interface Extractable {
  extract(): Readonly<[string, {} | null]>
}

export function autosave(store: Extractable) {
  return reaction(() => store.extract(), ([key, state]) => {
    if (state) {
      localStorage.setItem(key, JSON.stringify(state));
    } else {
      localStorage.removeItem(key);
    }
  });
}
