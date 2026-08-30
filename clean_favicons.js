const fs = require('fs');
const path = require('path');

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(function(file) {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory() && !file.includes('node_modules') && !file.includes('.git') && !file.includes('.wrangler')) {
            results = results.concat(walk(file));
        } else if (file.endsWith('.html')) {
            results.push(file);
        }
    });
    return results;
}

const files = walk('c:/Users/ADMIN/OneDrive/Desktop/ganesh');
let count = 0;
for (const file of files) {
    let content = fs.readFileSync(file, 'utf8');
    let lines = content.split('\n');
    let newLines = [];
    let changed = false;
    
    for (let line of lines) {
        if (line.includes('rel="icon"') && (line.includes('.png') || line.includes('.ico'))) {
            changed = true;
            // Skip this line
        } else {
            newLines.push(line);
        }
    }
    
    if (changed) {
        fs.writeFileSync(file, newLines.join('\n'));
        count++;
        console.log('Cleaned favicons in', file);
    }
}
console.log('Total files cleaned:', count);
