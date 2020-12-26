import { observable, computed, action, reaction } from 'mobx';
import { RawRuleOf, subject } from '@casl/ability';
import { User } from '../models/User';
import { Article } from '../models/Article';
import { createAbility, AppAbility } from './ability';
import { Http } from './http';

interface Session {
  email: string
  token: string
  rules: RawRuleOf<AppAbility>[]
}

interface Storage {
  getItem(key: string): string | null
}

export class BadCredentialsError extends Error {
}

const STORE_KEY = 'store.v1';

export default class AppStore {
  @observable user?: User;
  @observable token: string = '';
  @observable pageTitle: string = '';
  @observable rules: RawRuleOf<AppAbility>[] = [];

  @computed get isLoggedIn() {
    return this.token !== '';
  }

  public readonly ability = createAbility();

  constructor(
    private _http: Http
  ) {
    reaction(() => this.token, (token) => {
      if (token) {
        this._http.defaults.headers.Authorization = token;
      } else {
        delete this._http.defaults.headers.Authorization;
      }
    });

    reaction(() => this.rules, (rules) => this.ability.update(rules));
  }

  login(email: string, password: string) {
    return this._http.post<Session>('/session', { email, password })
      .then(response => this._setSession(response.data))
      .catch((error) => {
        if (error.response && error.response.status === 400) {
          throw new BadCredentialsError();
        }

        throw error;
      });
  }

  @action
  logout() {
    this.token = '';
    this.user = undefined;
    this.rules = [{ action: 'read', subject: 'Article' }];
  }

  @action
  private _setSession(session: Session) {
    this.token = session.token;
    this.user = { email: session.email };
    this.rules = session.rules;
  }

  findArticles() {
    return this._http.get<{ items: Article[] }>('/articles')
      .then(response => response.data.items.map(item => subject('Article', item)));
  }

  findArticleById(id: string) {
    return this._http.get<{ item: Article }>(`/articles/${id}`)
      .then(response => subject('Article', response.data.item));
  }

  saveArticle({ id, ...article }: Partial<Pick<Article, 'title' | 'body' | 'id' | 'published'>>) {
    const save = id
      ? this._http.patch<{ item: Article }>(`/articles/${id}`, article)
      : this._http.post<{ item: Article }>('/articles', article);

    return save.then(response => subject('Article', response.data.item));
  }

  deleteArticle(article: Article) {
    return this._http.delete(`/articles/${article.id}`);
  }

  extract() {
    if (!this.token) {
      return [STORE_KEY, null] as const;
    }

    return [STORE_KEY, {
      token: this.token,
      user: this.user,
      rules: this.rules,
    }] as const;
  }

  @action
  hydrateFrom(storage: Storage) {
    const state = storage.getItem(STORE_KEY);

    if (state) {
      Object.assign(this, JSON.parse(state));
    }

    return this;
  }
}
