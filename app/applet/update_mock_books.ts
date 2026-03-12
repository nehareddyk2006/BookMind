import fs from 'fs';

const path = './src/data/mockBooks.ts';
let content = fs.readFileSync(path, 'utf8');

const lines = content.split('\n');
for (let i = 0; i < lines.length; i++) {
  let line = lines[i];
  if (line.includes('id:') && line.includes('available:')) {
    const isAvailable = line.includes('available: true');
    const isUnavailable = line.includes('available: false');
    
    if (isAvailable) {
      line = line.replace(/status:\s*'[^']+'/, "status: 'none'");
    } else if (isUnavailable) {
      if (!line.includes("status: 'wishlist'")) {
        line = line.replace(/status:\s*'[^']+'/, "status: 'borrowed'");
      }
    }
    lines[i] = line;
  }
}

fs.writeFileSync(path, lines.join('\n'), 'utf8');
console.log('Updated mockBooks.ts');
