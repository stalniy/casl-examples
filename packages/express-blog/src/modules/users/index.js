const users = require('./service');

module.exports = {
  configure(app, router) {
    router.get('/users/:id', users.find);
    router.patch('/users/:id', users.update);
    router.post('/users', users.create);
  }
};
