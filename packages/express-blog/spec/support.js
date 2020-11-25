const { startServer } = require('./specHelper');

let server;

module.exports.mochaHooks = {
  async beforeAll() {
    server = await startServer();
  },

  afterAll() {
    console.log('close')
    server.close();
  }
};
