import type { App } from 'vue';
import { createVNode, render } from 'vue';
import Confirm from '../components/Confirm.vue';

export interface ConfirmOptions {
  color?: 'primary' | 'error';
  width?: number;
  yesLabel?: string;
  noLabel?: string;
}

declare module 'vue' {
  interface ComponentCustomProperties {
    $confirm: (message: string, title?: string, params?: ConfirmOptions) => Promise<boolean>;
  }
}

export const confirmPlugin = {
  install(app: App) {
    app.config.globalProperties.$confirm = (message, title, params = {}) => {
      const container = document.createElement('div');
      document.body.appendChild(container);

      return new Promise<boolean>((resolve) => {
        const cleanup = () => {
          render(null, container);
          document.body.removeChild(container);
        };

        const vnode = createVNode(Confirm, {
          message,
          title,
          params,
          onClose: (isAccepted: boolean) => {
            cleanup();
            resolve(isAccepted);
          },
        });

        render(vnode, container);
      });
    };
  },
};
