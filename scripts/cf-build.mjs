import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const rootDir = process.cwd();
const apiDir = path.join(rootDir, 'src', 'app', 'api');
const backupDir = path.join(rootDir, 'src', '_api_dev_only');
const nextDevTypesDir = path.join(rootDir, '.next', 'dev');

function moveDirSync(src, dest) {
  try {
    fs.renameSync(src, dest);
  } catch {
    fs.cpSync(src, dest, { recursive: true });
    fs.rmSync(src, { recursive: true, force: true });
  }
}

try {
  if (fs.existsSync(nextDevTypesDir)) {
    fs.rmSync(nextDevTypesDir, { recursive: true, force: true });
  }
  if (fs.existsSync(apiDir)) {
    if (fs.existsSync(backupDir)) {
      fs.rmSync(backupDir, { recursive: true, force: true });
    }
    moveDirSync(apiDir, backupDir);
  }

  try {
    execSync('npx next build', {
      stdio: 'inherit',
      env: { ...process.env, CF_EXPORT: '1' }
    });
  } catch {
    execSync('npx next build', {
      stdio: 'inherit',
      env: { ...process.env, CF_EXPORT: '1' }
    });
  }

  // next/og emits extensionless PNG files. Cloudflare otherwise sniffs them as
  // a generic type, which drops the image out of link previews.
  fs.writeFileSync(
    path.join(rootDir, 'out', '_headers'),
    `/opengraph-image
  Content-Type: image/png
  Cache-Control: public, max-age=86400

/twitter-image
  Content-Type: image/png
  Cache-Control: public, max-age=86400

/user/*/opengraph-image
  Content-Type: image/png
  Cache-Control: public, max-age=86400

/user/*/twitter-image
  Content-Type: image/png
  Cache-Control: public, max-age=86400
`
  );
} finally {
  // Always put the dev API routes back, including after a build that was
  // interrupted while `src/app/api` was parked in `src/_api_dev_only`.
  if (fs.existsSync(backupDir)) {
    if (fs.existsSync(apiDir)) {
      fs.rmSync(apiDir, { recursive: true, force: true });
    }
    moveDirSync(backupDir, apiDir);
  }
}
