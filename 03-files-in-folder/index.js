const { readdir, stat } = require('fs/promises');
const path = require('path');
const { stdout } = process;

async function readDirectory(dirPath) {
  try {
    const files = await readdir(dirPath, { withFileTypes: true });
    for (const dirent of files) {
      if (dirent.isFile()) {
        const stats = await stat(path.join(dirPath, dirent.name));
        stdout.write(`\n${path.parse(dirent.name).name} - ${path.extname(dirent.name).slice(1)} - ${stats.size}bytes`);
      }
    }
  } catch (error) {
    stdout.write(`Error: ${error.message}\n`);
  }
}

readDirectory(path.join(__dirname, 'secret-folder'));