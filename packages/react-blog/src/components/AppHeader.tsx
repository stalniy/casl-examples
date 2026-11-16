import React, { useState, useEffect } from 'react';
import {
  AppBar,
  Toolbar,
  IconButton,
  Button,
  Menu,
  MenuItem,
} from '@material-ui/core';
import { Link, useNavigate } from 'react-router-dom';
import { observer } from 'mobx-react';
import MoreIcon from '@material-ui/icons/MoreVert';
import { useAppTitle } from '../hooks/useAppTitle';
import { useAppStore } from '../hooks/useAppStore';
import { useAppAbility } from '../hooks/useAppAbility';

export default observer(() => {
  const title = useAppTitle();
  const navigate = useNavigate();
  const store = useAppStore();
  const { can } = useAppAbility();
  const [anchor, setAnchor] = useState<HTMLElement>();
  const setAnchorFromClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchor(event.currentTarget);
  };
  const clearAnchor = () => setAnchor(undefined);
  const goToLoginOrLogout = () => {
    if (store.isLoggedIn) {
      store.logout();
      navigate('/', { replace: true });
    } else {
      navigate('/login');
    }
  };
  useEffect(() => clearAnchor, []);

  return (
    <div className="app-header">
      <AppBar position="sticky" elevation={0}>
        <Toolbar className="header-inner">
          <Link to="/" className="brand" aria-label="CASL Journal home"><span className="brand-mark" aria-hidden="true">c.</span><span>CASL<span className="brand-divider">/</span><span className="brand-journal">journal</span></span></Link>
          <nav className="header-nav" aria-label="Main navigation"><Link to="/" aria-current={title === 'Articles' ? 'page' : undefined}>Journal</Link><a href="https://casl.js.org/">Documentation <span aria-hidden="true">↗</span></a><a href="https://github.com/stalniy/casl">GitHub <span aria-hidden="true">↗</span></a></nav>
          {store.isLoggedIn
            ? (
              <>
                <div id="user-email">{store.user!.email}</div>
                <IconButton edge="end" color="inherit" onClick={setAnchorFromClick} name="menu" aria-label="Account menu">
                  <MoreIcon />
                </IconButton>
                <Menu
                  anchorEl={anchor}
                  keepMounted
                  open={!!anchor}
                  onClose={clearAnchor}
                >
                  {can('create', 'Article') && (
                    <MenuItem onClick={clearAnchor}>
                      <Link to="/articles/new" className="menu-link" id="create-article">Add Article</Link>
                    </MenuItem>
                  )}
                  <MenuItem onClick={goToLoginOrLogout} id="logout">Logout</MenuItem>
                </Menu>
              </>
            )
            : (
              <Button color="inherit" onClick={goToLoginOrLogout} name="goToLogin">
                Login
              </Button>
            )
          }
        </Toolbar>
      </AppBar>

    </div>
  );
});
