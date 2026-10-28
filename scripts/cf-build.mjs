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

let moved = false;

try {
  if (fs.existsSync(nextDevTypesDir)) {
    fs.rmSync(nextDevTypesDir, { recursive: true, force: true });
  }
  if (fs.existsSync(apiDir)) {
    if (fs.existsSync(backupDir)) {
      fs.rmSync(backupDir, { recursive: true, force: true });
    }
    moveDirSync(apiDir, backupDir);
    moved = true;
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
} finally {
  if (moved && fs.existsSync(backupDir)) {
    moveDirSync(backupDir, apiDir);
  }
}
