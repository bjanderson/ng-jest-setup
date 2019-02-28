import fs from 'fs';
import path from 'path';

export function readFromFile(filePath) {
  return fs.readFileSync(filePath, 'utf8');
}

export function writeToFile(filePath, text) {
  fs.writeFileSync(filePath, text, function(err) {
    if(err) {
      return console.log(err);
    }
  });
}

export function removeFile(filePath) {
  try {
    fs.unlinkSync(filePath);
  } catch (err) { }
}

export function createFolder(folderPath) {
  if (!fs.existsSync(folderPath)) {
      fs.mkdirSync(folderPath);
  }
}

export function getFolderFromCliArgs() {
  let folder = null;

  if (process.argv && process.argv.length === 3) {
    const arg = process.argv[2];
    let parts = [];

    if (arg.indexOf(':') > -1) {
      parts = arg.split(':');
    } else if (arg.indexOf('=') > -1) {
      parts = arg.split('=');
    }

    if (parts.length > 0) {
      if (parts[0] === 'folder') {
        folder = parts[1];
      }
    } else {
      folder = arg;
    }
  }

  return folder;
}

export function getFolderPath() {
  const folder = getFolderFromCliArgs();
  let folderPath = null;
  if (folder != null) {
    const fPath = path.resolve('..', folder);
    if (fs.existsSync(fPath)) {
      folderPath = fPath;
    }
  }
  return folderPath;
}
