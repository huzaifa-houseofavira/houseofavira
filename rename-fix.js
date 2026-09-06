const fs = require('fs');

function replaceInFile(path, replacements) {
  let content = fs.readFileSync(path, 'utf8');
  for (const [search, replace] of replacements) {
    content = content.replace(search, replace);
  }
  fs.writeFileSync(path, content, 'utf8');
  console.log('Updated ' + path);
}

// 1. Footer.jsx
replaceInFile('src/components/Footer.jsx', [
  [/ORDERING GUIDE/g, 'Ordering Guide ']
]);

// 2. ProductManager.jsx
replaceInFile('src/components/admin/ProductManager.jsx', [
  [/'summer'/g, "'summer vacation'"],
  [/'opi.m'/g, "'grunge'"]
]);

// 3. HomeClient.jsx
replaceInFile('src/app/HomeClient.jsx', [
  [/title: 'SUMMER'/g, "title: 'SUMMER VACATION'"],
  [/title: "opi.m"/g, 'title: "grunge"'],
  [/'opi.m'/g, "'grunge'"]
]);

// 4. ShopAestheticClient.jsx
replaceInFile('src/app/shop-aesthetic/ShopAestheticClient.jsx', [
  [/'opi.m'/g, "'grunge'"]
]);

// 5. ShopYourLookClient.jsx
replaceInFile('src/app/shop-your-look/ShopYourLookClient.jsx', [
  [/'summer'/g, "'summer vacation'"]
]);
