const fs = require('fs');
const https = require('https');
const path = require('path');
const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs } = require('firebase/firestore');

const envFile = fs.readFileSync('.env.local', 'utf8');
const env = {};
envFile.split('\n').forEach(line => {
  const [key, ...rest] = line.split('=');
  if (key && rest.length) env[key.trim()] = rest.join('=').trim();
});

const app = initializeApp({
  apiKey: env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: env.NEXT_PUBLIC_FIREBASE_PROJECT_ID
});

const db = getFirestore(app);
const BACKUP_DIR = 'D:\\Avira_Image_Backup';

if (!fs.existsSync(BACKUP_DIR)) {
  fs.mkdirSync(BACKUP_DIR, { recursive: true });
}

function downloadImage(url, dest) {
  return new Promise((resolve, reject) => {
    if (!url.startsWith('https://')) return resolve();
    
    let downloadUrl = url;
    if (url.includes('res.cloudinary.com')) {
      downloadUrl = url.replace(/\/upload\/(q_[^/]+|w_[^/]+|f_[^/]+|c_[^/]+)(,\w+_[^/]+)*\//, '/upload/');
    }

    const file = fs.createWriteStream(dest);
    https.get(downloadUrl, response => {
      if (response.statusCode !== 200) {
        file.close();
        fs.unlink(dest, () => {});
        return resolve();
      }
      response.pipe(file);
      file.on('finish', () => {
        file.close(resolve);
      });
    }).on('error', err => {
      fs.unlink(dest, () => {});
      resolve();
    });
  });
}

async function backup() {
  console.log('Fetching product data from database...');
  const snap = await getDocs(collection(db, 'products'));
  let totalImages = [];
  
  snap.forEach(doc => {
    const data = doc.data();
    if (data.imageUrl) totalImages.push(data.imageUrl);
    if (data.images) totalImages.push(...data.images);
    if (data.colors) {
      data.colors.forEach(c => {
        if (c.imageUrl) totalImages.push(c.imageUrl);
      });
    }
  });

  totalImages = [...new Set(totalImages)].filter(url => url && url.includes('http'));
  console.log(`Found ${totalImages.length} unique images. Starting download to ${BACKUP_DIR}...`);

  for (let i = 0; i < totalImages.length; i++) {
    const url = totalImages[i];
    const filename = `image_${i}_${path.basename(new URL(url).pathname)}`;
    const dest = path.join(BACKUP_DIR, filename);
    
    try {
      await downloadImage(url, dest);
      if (i % 50 === 0) console.log(`Progress: ${i} / ${totalImages.length} downloaded...`);
    } catch (e) {
      console.log('Error downloading', url);
    }
  }
  console.log('Backup Complete! All images saved to', BACKUP_DIR);
}

backup().catch(console.error);
