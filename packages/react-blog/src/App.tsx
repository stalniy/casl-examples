import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AbilityContext } from './hooks/useAppAbility';
import { StoreContext, defaultStore } from './hooks/useAppStore';
import Routes from './components/AppRoutes';
import Header from './components/AppHeader';
import './App.css';

const AbilityProvider = (props: { children: React.ReactNode }) => (
  <StoreContext.Consumer>
    {store =>
      <AbilityContext.Provider value={store.ability}>
        {props.children}
      </AbilityContext.Provider>
    }
  </StoreContext.Consumer>
);

export default () => (
  <StoreContext.Provider value={defaultStore}>
    <AbilityProvider>
      <BrowserRouter>
        <div className="blog-app">
          <Header />
          <Routes />
        </div>
      </BrowserRouter>
    </AbilityProvider>
  </StoreContext.Provider>
);
