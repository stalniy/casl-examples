const comments = require('./service');

module.exports = {
  configure(app, router) {
    router.get('/articles/:postId/comments', comments.findAll);
    router.post('/articles/:postId/comments', comments.create);

    router.patch('/articles/:postId/comments/:id', comments.update);
    router.delete('/articles/:postId/comments/:id', comments.destroy);
  }
};
