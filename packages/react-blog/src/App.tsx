import React from 'react';
import { ThemeProvider, createTheme } from '@material-ui/core/styles';
import { AbilityProvider as CaslAbilityProvider } from '@casl/react';
import { BrowserRouter } from 'react-router-dom';
import { StoreContext, defaultStore } from './hooks/useAppStore';
import Routes from './components/AppRoutes';
import Header from './components/AppHeader';
import './App.css';

const theme = createTheme({
  palette: {
    primary: { main: '#6850cb' },
    secondary: { main: '#6850cb' },
    text: { primary: '#242334', secondary: '#6c6a78' },
    background: { default: '#f8f7f3' },
  },
  typography: { fontFamily: '"Inter", "Segoe UI", sans-serif', button: { textTransform: 'none', fontWeight: 600 } },
  shape: { borderRadius: 12 },
  props: { MuiButton: { disableElevation: true } },
});

const AppAbilityProvider = (props: { children: React.ReactNode }) => (
  <StoreContext.Consumer>
    {store =>
      <CaslAbilityProvider value={store.ability}>
        {props.children}
      </CaslAbilityProvider>
    }
  </StoreContext.Consumer>
);

const Footer = () => (
  <footer className="site-footer">
    <a href="https://casl.js.org/" className="footer-brand">c. <strong>CASL</strong></a>
    <span>Good boundaries. Endless possibilities.</span>
    <a href="https://github.com/stalniy/casl-examples">Explore this example ↗</a>
  </footer>
);

export default () => (
  <ThemeProvider theme={theme}>
    <StoreContext.Provider value={defaultStore}>
      <AppAbilityProvider>
        <BrowserRouter>
          <div className="blog-app">
            <Header />
            <main id="main-content"><Routes /></main>
            <Footer />
          </div>
        </BrowserRouter>
      </AppAbilityProvider>
    </StoreContext.Provider>
  </ThemeProvider>
);
