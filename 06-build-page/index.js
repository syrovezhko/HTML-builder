const path = require('path');
const { stdout } = process;
const { readFile, writeFile, readdir, copyFile, rm, mkdir, stat } = require('fs/promises');
const fs = require('fs');

const distPath = path.join(__dirname, '/project-dist');
const indexHtmlPath = path.join(__dirname, '/template.html');
const componentsPath = path.join(__dirname, '/components');
const stylesPath = path.join(__dirname, '/styles');
const bundleCssPath = path.join(distPath, 'style.css');
const assetsPath = path.join(__dirname, '/assets');
const distAssetsPath = path.join(distPath, '/assets');

async function writeAndInjectHtmlTemplate(source, target, components) {
  try {
    let data = await readFile(source, 'utf8');
    const tempTags = data.match(/{{\w*}}/g);
    const replaceTags = await Promise.all(
      tempTags.map((tag) => {
        return readFile(path.join(components, `/${tag.slice(2, -2)}.html`), 'utf8');
      }));
    replaceTags.forEach((item) => {
      data = data.replace(/{{\w*}}/, item);
    });
    await writeFile(path.join(target, '/index.html'), data, 'utf8');
  } catch (err) {
    stdout.write(`\nError: ${err.message}\n`);
  }
}

async function createBundle(sourse, target) {
  try {
    const data = [];
    await writeFile(target, '', 'utf8');
    const files = await readdir(sourse, { withFileTypes: true });
    for await (const file of files) {
      const extFile = path.extname(path.join(sourse, file.name));
      if (file.isFile() && extFile === '.css') {
        const size = await stat(path.join(sourse, file.name));
        const input = fs.createReadStream(path.join(sourse, file.name), { highWaterMark: size.size }, 'utf-8');
        for await (const chunk of input) {
          data.push(chunk);
        }
      }
    }
    await writeFile(target, data.join('\n\n'), 'utf8');
  } catch (err) {
    stdout.write(`\nError: ${err.message}\n`);
  }
}

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
  await rm(distPath, { recursive: true, force: true });
  await mkdir(distPath, { recursive: true });
  await mkdir(distAssetsPath, { recursive: true });
  writeAndInjectHtmlTemplate(indexHtmlPath, distPath, componentsPath);
  createBundle(stylesPath, bundleCssPath);
  copyDir(assetsPath, distAssetsPath);
})();