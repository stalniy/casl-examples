import { useEffect } from 'react';
import { useAppStore } from './useAppStore';

export function useAppTitle(title?: string) {
  const store = useAppStore();

  useEffect(() => {
    if (title) {
      document.title = title;
      store.pageTitle = title;
    }
  }, [title, store.pageTitle]);

  return store.pageTitle;
}
