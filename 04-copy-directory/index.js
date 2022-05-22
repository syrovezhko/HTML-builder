const { readdir, copyFile, rm, mkdir } = require('fs/promises');
const path = require('path');
const { stdout } = process;

const sourcePath = path.join(__dirname, 'files');
const targetPath = path.join(__dirname, 'files-copy');

async function copyDir(source, target) {
  try {
    const files = await readdir(source, { withFileTypes: true });
    for (const file of files) {
      if (file.isFile()) {
        await copyFile(path.join(source, file.name), path.join(target, file.name));
      } else if (file.isDirectory()) {
        await mkdir(path.join(target, file.name));
        await copyDir(path.join(source, file.name), path.join(target, file.name));
      }
    }
  } catch (err) {
    stdout.write(`\nError: ${err.message}\n`);
  }
}

(async function () {
  await rm(targetPath, { recursive: true, force: true });
  await mkdir(targetPath, { recursive: true });
  await copyDir(sourcePath, targetPath);
})();