import { subject } from '@casl/ability';
import type { ActionContext, Module } from 'vuex';
import http from '../services/http';
import type { Article, RootState } from '../types';

interface ArticlesResponse {
  items: Article[];
}

interface ArticleResponse {
  item: Article;
}

type ArticlesModule = Module<Record<string, never>, RootState>;
type ArticlesContext = ActionContext<Record<string, never>, RootState>;

const articles: ArticlesModule = {
  namespaced: true,

  actions: {
    find(_context: ArticlesContext) {
      return http<ArticlesResponse>('/articles')
        .then((response) => response.body.items.map((item) => subject('Article', item)));
    },

    findById(_context: ArticlesContext, id: string) {
      return http<ArticleResponse>(`/articles/${id}`)
        .then((response) => subject('Article', response.body.item));
    },

    destroy(_context: ArticlesContext, article: Article) {
      return http<ArticleResponse>(`/articles/${article.id}`, { method: 'DELETE' })
        .then((response) => subject('Article', response.body.item));
    },

    save(_context: ArticlesContext, { id, ...data }: Partial<Article>) {
      const request = id
        ? http<ArticleResponse>(`/articles/${id}`, { method: 'PATCH', data })
        : http<ArticleResponse>('/articles', { method: 'POST', data });

      return request.then((response) => subject('Article', response.body.item));
    },
  },
};

export default articles;
