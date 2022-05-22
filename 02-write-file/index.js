const fs = require('fs');
const path = require('path');
const { stdout, stdin, exit } = process;

const output = fs.createWriteStream(path.join(__dirname, 'text.txt'));

stdout.write('Привет! Введи текст ниже:\n');
stdin.on('data', data => {
  if (data.toString().trim() === 'exit') {
    exit();
  }
  output.write(data);
});

process.on('exit', () => stdout.write('Уже уходишь? Ок. Пока!'));
process.on('SIGINT', exit);