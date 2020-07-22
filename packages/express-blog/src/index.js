const createApp = require('./app');

createApp()
  .then((app) => {
    app.listen(3000);
    console.log('API is listening on http://localhost:3000');
  });
