const fs = require('fs');

function replaceInFile(path, replacements) {
  let content = fs.readFileSync(path, 'utf8');
  for (const [search, replace] of replacements) {
    content = content.replace(search, replace);
  }
  fs.writeFileSync(path, content, 'utf8');
  console.log('Updated ' + path);
}

// 1. HomeClient.jsx
replaceInFile('src/app/HomeClient.jsx', [
  [/title: 'SUMMER VACATION'/g, "title: 'SUMMER'"]
]);

// 2. ShopYourLookClient.jsx
replaceInFile('src/app/shop-your-look/ShopYourLookClient.jsx', [
  [/'summer vacation'/g, "'summer'"]
]);

// 3. ProductManager.jsx
replaceInFile('src/components/admin/ProductManager.jsx', [
  [/'casual', 'summer vacation', 'festivals \/ concerts'/g, "'casual', 'summer', 'Summer vacation', 'festivals / concerts'"]
]);
