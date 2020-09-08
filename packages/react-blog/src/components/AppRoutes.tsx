import React from 'react';
import { Route, Switch } from 'react-router-dom';

import HomePage from './HomePage';
import LoginPage from './LoginPage';
import ArticlePage from './ArticlePage';
import NewArticlePage from './NewArticlePage';
import EditArticlePage from './EditArticlePage';

export default () => (
  <Switch>
    <Route exact path="/" component={HomePage} />
    <Route path="/login" component={LoginPage} />
    <Route path="/articles/new" component={NewArticlePage} />
    <Route path="/articles/:id/edit" component={EditArticlePage} />
    <Route path="/articles/:id" component={ArticlePage} />
    {/* <Route path="*" component={PageNotFound} /> */}
  </Switch>
);
