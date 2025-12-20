const fs = require('fs');
const path = require('path');

const buildId = Date.now().toString();
const content = `export const BUILD_ID = '${buildId}';\n`;
const libDir = path.join(__dirname, '..', 'lib');

if (!fs.existsSync(libDir)) {
    fs.mkdirSync(libDir, { recursive: true });
}

fs.writeFileSync(path.join(libDir, 'build-id.ts'), content);
console.log('Build ID generated:', buildId);
