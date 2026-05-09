import React from 'react';
import { AbilityProvider as CaslAbilityProvider } from '@casl/react';
import { BrowserRouter } from 'react-router-dom';
import { StoreContext, defaultStore } from './hooks/useAppStore';
import Routes from './components/AppRoutes';
import Header from './components/AppHeader';
import './App.css';

const AppAbilityProvider = (props: { children: React.ReactNode }) => (
  <StoreContext.Consumer>
    {store =>
      <CaslAbilityProvider value={store.ability}>
        {props.children}
      </CaslAbilityProvider>
    }
  </StoreContext.Consumer>
);

export default () => (
  <StoreContext.Provider value={defaultStore}>
    <AppAbilityProvider>
      <BrowserRouter>
        <div className="blog-app">
          <Header />
          <Routes />
        </div>
      </BrowserRouter>
    </AppAbilityProvider>
  </StoreContext.Provider>
);
