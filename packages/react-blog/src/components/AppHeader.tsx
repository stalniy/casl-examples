import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Button,
  Menu,
  MenuItem,
  createStyles,
  makeStyles,
} from '@material-ui/core';
import { Link } from 'react-router-dom';
import { observer } from 'mobx-react';
import MoreIcon from '@material-ui/icons/MoreVert';
import { useHistory } from 'react-router-dom';
import { useAppTitle } from '../hooks/useAppTitle';
import { useAppStore } from '../hooks/useAppStore';
import { useAppAbility } from '../hooks/useAppAbility';

const useStyles = makeStyles(theme => createStyles({
  menuButton: {
    padding: theme.spacing(2)
  },
  root: {
    flexGrow: 1
  },
  title: {
    flexGrow: 1
  },
  menuLink: {
    color: 'inherit',
    textDecoration: 'none',
  }
}))

export default observer(() => {
  const styles = useStyles();
  const title = useAppTitle();
  const history = useHistory();
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
      history.replace('/');
    } else {
      history.push('/login');
    }
  };

  return (
    <>
      <AppBar position="fixed">
        <Toolbar>
          <Typography variant="h6" className={styles.title}>{title}</Typography>
          {store.isLoggedIn
            ? (
              <>
                {store.user!.email}
                <IconButton edge="end" color="inherit" onClick={setAnchorFromClick}>
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
                      <Link to="/articles/new" className={styles.menuLink}>Add Article</Link>
                    </MenuItem>
                  )}
                  <MenuItem onClick={goToLoginOrLogout}>Logout</MenuItem>
                </Menu>
              </>
            )
            : (
              <Button color="inherit" onClick={goToLoginOrLogout}>
                Login
              </Button>
            )
          }
        </Toolbar>
      </AppBar>
      <Toolbar />
    </>
  );
});
