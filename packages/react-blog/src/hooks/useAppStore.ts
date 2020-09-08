import { createContext, useContext, useEffect, useState } from 'react';
import AppStore from '../services/AppStore';
import { createHttp } from '../services/http';

type StoreEffect<T> = (store: AppStore) => Promise<T>;

export const defaultStore = new AppStore(createHttp());
export const StoreContext = createContext(defaultStore);
export const useAppStore = () => useContext(StoreContext);
export const useAppStoreEffect = <T>(fn: StoreEffect<T>, deps: any[] = []) => {
  const store = useAppStore();
  const accessor = useState<T>();

  useEffect(() => {
    fn(store).then(accessor[1]);
  }, [store, store.isLoggedIn, ...deps]); // eslint-disable-line react-hooks/exhaustive-deps

  return accessor;
};
