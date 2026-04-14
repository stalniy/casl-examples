import { observable, computed, action, makeObservable, reaction } from 'mobx';
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
  private readonly _http: Http;

  constructor(http: Http) {
    makeObservable(this);

    this._http = http.extend({
      hooks: {
        beforeRequest: [(options) => {
          if (this.token) {
            options.request.headers.set('Authorization', this.token);
          }
        }]
      }
    });
    reaction(() => this.rules, (rules) => {
      this.ability.update(rules);
    });
  }

  login(email: string, password: string) {
    return this._http.post<Session>('/session', {
      body: JSON.stringify({ email, password }),
    })
      .json()
      .then(response => this._setSession(response))
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
      .json()
      .then(response => response.items.map(item => subject('Article', item)));
  }

  findArticleById(id: string) {
    return this._http.get<{ item: Article }>(`/articles/${id}`)
      .json()
      .then(response => subject('Article', response.item));
  }

  saveArticle({ id, ...article }: Partial<Pick<Article, 'title' | 'body' | 'id' | 'published'>>) {
    const payload = { body: JSON.stringify(article) };
    const save = id
      ? this._http.patch<{ item: Article }>(`/articles/${id}`, payload)
      : this._http.post<{ item: Article }>('/articles', payload);

    return save.json().then(response => subject('Article', response.item));
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
