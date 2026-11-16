import createApp from './app.ts';

const app = await createApp();
await app.listen(Number(process.env.SERVER_PORT || 3000));
console.log('Feathers blog API listening on port', process.env.SERVER_PORT || 3000);

for (const signal of ['SIGINT', 'SIGTERM']) {
  process.once(signal, async () => {
    await app.teardown();
  });
}
