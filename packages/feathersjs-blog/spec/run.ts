import { spawn } from 'node:child_process';
import createApp from '../src/app.ts';

// Run the original contract files without maintaining a second copy.
const app = await createApp();
try {
  await app.listen(3000);
  const child = spawn('pnpm', ['--dir', '../express-blog', 'test:server'], { stdio: 'inherit' });
  process.exitCode = await new Promise<number>((resolve, reject) => {
    child.once('error', reject);
    child.once('exit', code => resolve(code ?? 1));
  });
} finally {
  await app.teardown();
}
