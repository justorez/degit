import os from 'node:os';
import fs from 'node:fs';
import path from 'node:path';
import https from 'node:https';
import child_process from 'node:child_process';
import { HttpsProxyAgent } from 'https-proxy-agent';
import { rimrafSync, copydirSync } from 'sander';

const tmpDirName = 'tmp';
const degitConfigName = 'degit.json';
const homeOrTmp = os.homedir() || os.tmpdir();

export { degitConfigName };

export class DegitError extends Error {
  constructor(message, opts) {
    super(message);
    Object.assign(this, opts);
  }
}

export function readJson(file, opts) {
  try {
    if (opts && opts.clearCache === true) {
      // delete require.cache[require.resolve(file)];
    }
    // return require(file);
		return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch (err) {
    return null;
  }
}

export function exec(command) {
  return new Promise((resolve, reject) => {
    child_process.exec(command, (err, stdout, stderr) => {
      if (err) {
        reject(err);
        return;
      }

      resolve({ stdout, stderr });
    });
  });
}

export function mkdirp(dir) {
  const parent = path.dirname(dir);
  if (parent === dir) return;

  mkdirp(parent);

  try {
    fs.mkdirSync(dir);
  } catch (err) {
    if (err.code !== 'EEXIST') throw err;
  }
}

export function fetch(url, dest, proxy) {
  return new Promise((resolve, reject) => {
    let options = {};

    if (proxy) {
      proxy = proxy.includes('://') ? proxy : `http://${proxy}`
      options = {
        agent: new HttpsProxyAgent(proxy)
      }
    }

    https
      .get(url, options, response => {
        const code = response.statusCode;
        if (code >= 400) {
          reject({ code, message: response.statusMessage });
        } else if (code >= 300) {
          fetch(response.headers.location, dest, proxy).then(resolve, reject);
        } else {
          response
            .pipe(fs.createWriteStream(dest))
            .on('finish', () => resolve())
            .on('error', reject);
        }
      })
      .on('error', reject);
  });
}

export function stashFiles(dir, dest) {
  const tmpDir = path.join(dir, tmpDirName);
  rimrafSync(tmpDir);
  mkdirp(tmpDir);
  fs.readdirSync(dest).forEach(file => {
    const filePath = path.join(dest, file);
    const targetPath = path.join(tmpDir, file);
    const isDir = fs.lstatSync(filePath).isDirectory();
    if (isDir) {
      copydirSync(filePath).to(targetPath);
      rimrafSync(filePath);
    } else {
      fs.copyFileSync(filePath, targetPath);
      fs.unlinkSync(filePath);
    }
  });
}

export function unstashFiles(dir, dest) {
  const tmpDir = path.join(dir, tmpDirName);
  fs.readdirSync(tmpDir).forEach(filename => {
    const tmpFile = path.join(tmpDir, filename);
    const targetPath = path.join(dest, filename);
    const isDir = fs.lstatSync(tmpFile).isDirectory();
    if (isDir) {
      copydirSync(tmpFile).to(targetPath);
      rimrafSync(tmpFile);
    } else {
      if (filename !== 'degit.json') {
        fs.copyFileSync(tmpFile, targetPath);
      }
      fs.unlinkSync(tmpFile);
    }
  });
  rimrafSync(tmpDir);
}

export const base = path.join(homeOrTmp, '.degit');
