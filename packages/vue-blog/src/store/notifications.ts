import type { ActionContext, Module } from 'vuex';
import type { NotificationMessage, RootState } from '../types';

interface NotificationsState {
  stack: NotificationMessage[];
}

let counter = 0;

type NotificationsModule = Module<NotificationsState, RootState>;
type NotificationsContext = ActionContext<NotificationsState, RootState>;

const notifications: NotificationsModule = {
  namespaced: true,

  state: () => ({
    stack: [],
  }),

  mutations: {
    add(state: NotificationsState, message: NotificationMessage) {
      message.id = message.id || ++counter;
      state.stack.push(message);
    },

    remove(state: NotificationsState, message: NotificationMessage) {
      state.stack = state.stack.filter((item: NotificationMessage) => item !== message);
    },
  },

  actions: {
    info({ commit }: NotificationsContext, message: string) {
      commit('add', {
        timeout: 3000,
        type: 'info',
        message,
      });
    },

    error({ commit }: NotificationsContext, message: string) {
      commit('add', {
        timeout: 4000,
        type: 'error',
        message,
      });
    },

    remove({ commit }: NotificationsContext, message: NotificationMessage) {
      commit('remove', message);
    },
  },
};

export default notifications;
