declare module 'vuex' {
  import type { App, InjectionKey, WatchOptions } from 'vue';

  export interface DispatchOptions {
    root?: boolean;
  }

  export interface CommitOptions {
    silent?: boolean;
    root?: boolean;
  }

  export interface Payload {
    type: string;
  }

  export interface MutationPayload extends Payload {
    payload: any;
  }

  export interface Dispatch {
    (type: string, payload?: any, options?: DispatchOptions): Promise<any>;
    <P extends Payload>(payloadWithType: P, options?: DispatchOptions): Promise<unknown>;
  }

  export interface Commit {
    (type: string, payload?: any, options?: CommitOptions): void;
    <P extends Payload>(payloadWithType: P, options?: CommitOptions): void;
  }

  export interface ActionContext<S, R> {
    dispatch: Dispatch;
    commit: Commit;
    state: S;
    getters: any;
    rootState: R;
    rootGetters: any;
  }

  export type Getter<S, R> = (state: S, getters: any, rootState: R, rootGetters: any) => any;
  export type ActionHandler<S, R> = (injectee: ActionContext<S, R>, payload?: any) => any;
  export type Action<S, R> = ActionHandler<S, R>;
  export type Mutation<S> = (state: S, payload?: any) => any;
  export type Plugin<S> = (store: Store<S>) => any;

  export interface GetterTree<S, R> {
    [key: string]: Getter<S, R>;
  }

  export interface ActionTree<S, R> {
    [key: string]: Action<S, R>;
  }

  export interface MutationTree<S> {
    [key: string]: Mutation<S>;
  }

  export interface ModuleTree<R> {
    [key: string]: Module<any, R>;
  }

  export interface Module<S, R> {
    namespaced?: boolean;
    state?: S | (() => S);
    getters?: GetterTree<S, R>;
    actions?: ActionTree<S, R>;
    mutations?: MutationTree<S>;
    modules?: ModuleTree<R>;
  }

  export interface StoreOptions<S> {
    state?: S | (() => S);
    getters?: GetterTree<S, S>;
    actions?: ActionTree<S, S>;
    mutations?: MutationTree<S>;
    modules?: ModuleTree<S>;
    plugins?: Plugin<S>[];
    strict?: boolean;
    devtools?: boolean;
  }

  export class Store<S> {
    constructor(options: StoreOptions<S>);
    readonly state: S;
    readonly getters: any;
    install(app: App, injectKey?: InjectionKey<Store<any>> | string): void;
    replaceState(state: S): void;
    dispatch: Dispatch;
    commit: Commit;
    subscribe<P extends MutationPayload>(fn: (mutation: P, state: S) => any): () => void;
    watch<T>(getter: (state: S, getters: any) => T, cb: (value: T, oldValue: T) => void, options?: WatchOptions): () => void;
  }

  export function createStore<S>(options: StoreOptions<S>): Store<S>;
  export function useStore<S = any>(injectKey?: InjectionKey<Store<S>> | string): Store<S>;
}
