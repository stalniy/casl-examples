const posts = require('./service');

module.exports = {
  configure(app, router) {
    router.get('/articles', posts.findAll);
    router.post('/articles', posts.create);

    router.get('/articles/:id', posts.find);
    router.patch('/articles/:id', posts.update);
    router.delete('/articles/:id', posts.destroy);
  }
};
