const fs = require('fs');
const path = require('path');

const rootDir = path.join(__dirname, '..');

const faviconTags = `  <!-- Favicon Suite (Google Search Compliant) -->
  <link rel="shortcut icon" href="/favicon.ico">
  <link rel="icon" type="image/x-icon" href="/favicon.ico">
  <link rel="icon" type="image/svg+xml" href="/favicon.svg">
  <link rel="icon" type="image/png" sizes="48x48" href="/favicon-48x48.png">
  <link rel="icon" type="image/png" sizes="96x96" href="/favicon-96x96.png">
  <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png">
  <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png">
  <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">
  <link rel="manifest" href="/site.webmanifest">`;

function getAllHtmlFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    if (file === 'node_modules' || file === '.git' || file === '.wrangler' || file === 'scratch') continue;
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      getAllHtmlFiles(filePath, fileList);
    } else if (file.endsWith('.html')) {
      fileList.push(filePath);
    }
  }
  return fileList;
}

const htmlFiles = getAllHtmlFiles(rootDir);
let count = 0;

for (const filePath of htmlFiles) {
  let content = fs.readFileSync(filePath, 'utf8');

  // Replace existing Favicon Suite block if found
  const regex = /<!-- Favicon Suite[\s\S]*?<link rel="manifest" href="\/site\.webmanifest">/g;
  if (regex.test(content)) {
    content = content.replace(regex, faviconTags);
    fs.writeFileSync(filePath, content, 'utf8');
    count++;
    console.log(`Updated favicon suite in: ${path.relative(rootDir, filePath)}`);
  } else {
    // If no existing suite comment, insert before </head>
    if (content.includes('</head>')) {
      content = content.replace('</head>', `${faviconTags}\n</head>`);
      fs.writeFileSync(filePath, content, 'utf8');
      count++;
      console.log(`Inserted favicon suite in: ${path.relative(rootDir, filePath)}`);
    }
  }
}

console.log(`Total HTML files updated: ${count}`);
