import createApp from './app.ts';

createApp()
  .then((app) => {
    const server = app.listen(3000, () => {
      console.log('API is listening on http://localhost:3000');
    });
    server.on('close', () => app.emit('close'));
  })
  .catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  });
