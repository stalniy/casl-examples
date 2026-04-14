import ky from 'ky';

export type Http = typeof ky;
export function createHttp() {
  return ky.create({
    prefix: import.meta.env.VITE_API_URL,
    hooks: {
      beforeRequest: [(state) => {
        if (state.request.method === 'POST' || state.request.method === 'PUT' || state.request.method === 'PATCH') {
          state.request.headers.set('Content-Type', 'application/json');
        }
      }]
    }
  });
}
