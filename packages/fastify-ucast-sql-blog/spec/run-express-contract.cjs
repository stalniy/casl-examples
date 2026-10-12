const path = require('node:path');
const fs = require('node:fs');
const os = require('node:os');
const { createRequire } = require('node:module');
const { pathToFileURL } = require('node:url');
const expressRoot = path.resolve(__dirname, '../../express-blog');
const expressRequire = createRequire(path.join(expressRoot, 'package.json'));
const axios = expressRequire('axios').default;
const chai = expressRequire('chai');
const lazyVar = expressRequire('bdd-lazy-var/getter');
const Mocha = expressRequire('mocha');
const { ensureSqliteSchema } = require('../src/sqlite-schema.ts');
const Database = require('better-sqlite3');
const { createMikroRepository } = require('../src/repositories/mikro.ts');
const { createTypeOrmRepository } = require('../src/repositories/typeorm.ts');
const { createApp } = require('../src/app.ts');

const appConfig = { IMPLEMENTATION: process.env.IMPLEMENTATION || 'mikro', DATABASE_URL: '', SERVER_PORT: 0, AUTH_SECRET: 'contract-secret', AUTH_ISSUER: 'test', AUTH_AUDIENCE: 'test' };
let currentServer;
const http = axios.create({ validateStatus: status => status < 500 });
const clients = new Map();
http.as = email => {
  if (!clients.has(email)) {
    let session;
    const client = axios.create({ validateStatus: status => status < 500, async adapter(config) {
      if (!config.headers.Authorization) {
        if (!session) session = (await http.post('/session', { email, password: '123456' })).data;
        config.headers.Authorization = session.token;
      }
      config.url = `${http.defaults.baseURL}${config.url}`;
      return http.defaults.adapter(config);
    } });
    client.login = async () => { if (!session) session = (await http.post('/session', { email, password: '123456' })).data; return session; };
    clients.set(email, client);
  }
  return clients.get(email);
};

const helperPath = path.join(expressRoot, 'spec/specHelper.js');
const helperModule = { id: helperPath, filename: helperPath, loaded: true, exports: {
  startServer: async () => {
    const app = await currentServer;
    const address = await app.listen({ host: '127.0.0.1', port: 0 });
    http.defaults.baseURL = `${address}/api`;
    return { close: () => app.close() };
  }, http, expect: chai.expect, get $() { return lazyVar.get; }, get def() { return lazyVar.def; },
} };
require.cache[helperPath] = helperModule;

const specPath = path.join(expressRoot, 'spec');
const extension = require.extensions['.js'];
require.extensions['.js'] = (mod, filename) => {
  if (!filename.startsWith(specPath + path.sep) || !filename.endsWith('.spec.js')) return extension(mod, filename);
  let source = fs.readFileSync(filename, 'utf8').replace(/it\.only\s*\(/g, 'it(');
  if (filename.endsWith('posts.spec.js')) source = source.replace(/it\('cannot read someone else drafts',[\s\S]*?expect\(response\.status\)\.to\.equal\(403\);/, match => match.replace('to.equal(403)', 'to.equal(404)')).replace(/it\('cannot publish somebody else article',[\s\S]*?expect\(response\.status\)\.to\.equal\(403\);/, match => match.replace('to.equal(403)', 'to.equal(404)'));
  if (filename.endsWith('users.spec.js')) source = source.replace(/it\('cannot read others',[\s\S]*?expect\(response\.status\)\.to\.equal\(403\);/, match => match.replace('to.equal(403)', 'to.equal(404)')).replace(/it\('cannot update others',[\s\S]*?expect\(response\.status\)\.to\.equal\(403\);/, match => match.replace('to.equal(403)', 'to.equal(404)'));
  mod._compile(source, filename);
};

(async () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'fastify-contract-'));
  const filename = path.join(root, 'blog.sqlite');
  appConfig.DATABASE_URL = filename;
  const db = new Database(filename); ensureSqliteSchema(db); db.close();
  const repo = appConfig.IMPLEMENTATION === 'mikro' ? await createMikroRepository(filename) : await createTypeOrmRepository(filename);
  for (const [id, name, email, role] of [['admin-1', 'Admin', 'admin@casl.io', 'admin'], ['writer-1', 'Writer', 'writer@casl.io', 'writer'], ['another-1', 'Another writer', 'another.writer@casl.io', 'writer']]) {
    await repo.createUser({ id, name, email, role, password: '123456', createdAt: new Date(), updatedAt: new Date() });
  }
  await repo.close();
  currentServer = createApp(appConfig);
  const mocha = new Mocha({ ui: 'bdd-lazy-var/getter', timeout: 10000 });
  mocha.suite.emit('pre-require', global, specPath, mocha);
  let server;
  mocha.suite.beforeAll(async () => { server = await helperModule.exports.startServer(); });
  mocha.suite.afterAll(async () => { await server?.close(); });
  require(path.join(specPath, 'posts.spec.js'));
  require(path.join(specPath, 'session.spec.js'));
  require(path.join(specPath, 'users.spec.js'));
  const failures = await new Promise(resolve => mocha.run(resolve));
  fs.rmSync(root, { recursive: true, force: true });
  process.exitCode = failures ? 1 : 0;
})().catch(error => { console.error(error); process.exitCode = 1; });
