const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
  });
}

const targetDir = path.join(__dirname, 'src');
let replacedCount = 0;

walkDir(targetDir, function(filePath) {
  if (filePath.endsWith('.tsx') || filePath.endsWith('.ts')) {
    let content = fs.readFileSync(filePath, 'utf8');
    const oldStr = "const API_BASE = 'http://localhost:5000/api';";
    const newStr = "const API_BASE = import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api` : 'http://localhost:5000/api';";
    if (content.includes(oldStr)) {
      content = content.replace(oldStr, newStr);
      fs.writeFileSync(filePath, content, 'utf8');
      replacedCount++;
      console.log('Updated', filePath);
    }
  }
});
console.log('Replaced in ' + replacedCount + ' files.');
