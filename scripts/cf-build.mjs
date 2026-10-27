import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const rootDir = process.cwd();
const apiDir = path.join(rootDir, 'src', 'app', 'api');
const backupDir = path.join(rootDir, 'src', '_api_dev_only');
const nextDevTypesDir = path.join(rootDir, '.next', 'dev');

let moved = false;

try {
  if (fs.existsSync(nextDevTypesDir)) {
    fs.rmSync(nextDevTypesDir, { recursive: true, force: true });
  }
  if (fs.existsSync(apiDir)) {
    if (fs.existsSync(backupDir)) {
      fs.rmSync(backupDir, { recursive: true, force: true });
    }
    fs.renameSync(apiDir, backupDir);
    moved = true;
  }

  execSync('npx next build', {
    stdio: 'inherit',
    env: { ...process.env, CF_EXPORT: '1' }
  });
} finally {
  if (moved && fs.existsSync(backupDir)) {
    fs.renameSync(backupDir, apiDir);
  }
}
