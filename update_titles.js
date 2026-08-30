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
    let changed = false;
    
    if (content.includes('Author, Chess Coach')) {
        content = content.replace(/Author, Chess Coach/g, 'Author, Founder of Vayu Mahesh, Chess Coach');
        changed = true;
    }
    if (content.includes("Author of 'Before I Became Fire', Chess Coach")) {
        content = content.replace(/Author of 'Before I Became Fire', Chess Coach/g, "Author of 'Before I Became Fire', Founder of Vayu Mahesh, Chess Coach");
        changed = true;
    }
    
    if (changed) {
        fs.writeFileSync(file, content);
        count++;
        console.log('Updated', file);
    }
}
console.log('Total files updated:', count);
