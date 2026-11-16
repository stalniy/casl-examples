const { startServer } = require('./specHelper.cjs');

let server;

module.exports.mochaHooks = {
  async beforeAll() {
    server = await startServer();
  },

  afterAll() {
    server.close();
  }
};
