import React from 'react';
import { Route, Routes } from 'react-router-dom';

import HomePage from './HomePage';
import LoginPage from './LoginPage';
import ArticlePage from './ArticlePage';
import NewArticlePage from './NewArticlePage';
import EditArticlePage from './EditArticlePage';

export default () => (
  <Routes>
    <Route path="/" element={<HomePage />} />
    <Route path="/login" element={<LoginPage />} />
    <Route path="/articles/new" element={<NewArticlePage />} />
    <Route path="/articles/:id/edit" element={<EditArticlePage />} />
    <Route path="/articles/:id" element={<ArticlePage />} />
    {/* <Route path="*" element={<PageNotFound />} /> */}
  </Routes>
);
