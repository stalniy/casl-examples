const { default: axios } = require('axios');
const chai = require('chai');
const createApp = require('../src/app');

const isNotServerError = status => status < 500;
const http = axios.create({
  validateStatus: isNotServerError
});

const clients = {};
http.as = (email) => {
  if (!clients[email]) {
    clients[email] = createUserClient(email);
  }

  return clients[email];
};

function createUserClient(email) {
  const client = axios.create({
    baseURL: http.defaults.baseURL,
    validateStatus: isNotServerError,
    async adapter(config) {
      if (!config.headers.Authorization) {
        const newSession = await client.login();
        config.headers.Authorization = newSession.token;
      }

      return http.defaults.adapter(config);
    }
  });

  let currentSession;
  client.login = async () => {
    if (!currentSession) {
      const response = await http.post('/session', {
        email,
        password: '123456',
      });
      currentSession = response.data;
      client.defaults.headers.Authorization = currentSession.token;
    }

    return currentSession;
  };

  return client;
}

async function startServer() {
  const app = await createApp();

  return new Promise((resolve) => {
    const server = app.listen(0, () => {
      http.defaults.baseURL = `http://localhost:${server.address().port}/api`;
      resolve(server);
    });
    server.on('close', () => app.emit('close'));
  });
}

module.exports = {
  startServer,
  http,
  expect: chai.expect,
};
