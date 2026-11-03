/**
 * Migration Script: Cloudinary → Firebase Storage
 * 
 * Uploads all backed-up images from D:\Avira_Image_Backup to Firebase Storage,
 * then updates every Firestore document to use the new URLs.
 * 
 * Usage: node migrate-to-firebase-storage.js
 */

const fs = require('fs');
const path = require('path');
const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const { getStorage } = require('firebase-admin/storage');

// ── Load env ──
const envFile = fs.readFileSync('.env.local', 'utf8');
const env = {};
envFile.split('\n').forEach(line => {
  const [key, ...rest] = line.split('=');
  if (key && rest.length) env[key.trim()] = rest.join('=').trim();
});

// ── Init Firebase Admin ──
let pk = env.FIREBASE_ADMIN_PRIVATE_KEY || '';
pk = pk.replace(/\\n/g, '\n').replace(/^"|"$/g, '');

const app = initializeApp({
  credential: cert({
    projectId: env.FIREBASE_ADMIN_PROJECT_ID,
    clientEmail: env.FIREBASE_ADMIN_CLIENT_EMAIL,
    privateKey: pk,
  }),
  storageBucket: 'houseofavirabyshamhitha.firebasestorage.app',
});

const db = getFirestore(app);
db.settings({ ignoreUndefinedProperties: true });
const bucket = getStorage(app).bucket();

const BACKUP_DIR = 'D:\\Avira_Image_Backup';
const CONCURRENCY = 10; // Upload 10 at a time

// ── Step 1: Build lookup map of backup files ──
// Backup filenames: image_{index}_{cloudinaryPublicId}.webp
// Cloudinary URLs: https://res.cloudinary.com/{cloud}/image/upload/.../{publicId}.webp
function buildBackupMap() {
  console.log('📂 Building backup file lookup map...');
  const files = fs.readdirSync(BACKUP_DIR);
  const map = {}; // cloudinaryPublicId → full file path

  for (const file of files) {
    // Extract the cloudinary public ID from filename: image_123_abc123xyz.webp
    const match = file.match(/^image_\d+_(.+)$/);
    if (match) {
      const key = match[1]; // e.g. "abc123xyz.webp"
      map[key] = path.join(BACKUP_DIR, file);
    }
  }

  console.log(`   Found ${Object.keys(map).length} backup files mapped.`);
  return map;
}

// Extract the filename (publicId + extension) from a Cloudinary URL
function extractCloudinaryFilename(url) {
  if (!url || typeof url !== 'string') return null;
  try {
    const parsed = new URL(url);
    return path.basename(parsed.pathname); // e.g. "abc123xyz.webp"
  } catch {
    return null;
  }
}

// ── Step 2: Upload file to Firebase Storage ──
const uploadCache = {}; // cloudinaryFilename → new Firebase Storage URL (avoid re-uploads)

async function uploadToFirebaseStorage(localPath, cloudinaryFilename) {
  // Check cache first
  if (uploadCache[cloudinaryFilename]) {
    return uploadCache[cloudinaryFilename];
  }

  const destination = `products/${cloudinaryFilename}`;

  try {
    const file = bucket.file(destination);
    
    // Check if already uploaded (in case of script restart)
    const [exists] = await file.exists();
    if (exists) {
      // Make it public and return URL
      await file.makePublic();
      const url = `https://storage.googleapis.com/${bucket.name}/${destination}`;
      uploadCache[cloudinaryFilename] = url;
      return url;
    }

    // Upload
    await bucket.upload(localPath, {
      destination,
      metadata: {
        contentType: 'image/webp',
        cacheControl: 'public, max-age=31536000', // 1 year cache
      },
    });

    // Make publicly readable
    await file.makePublic();

    const url = `https://storage.googleapis.com/${bucket.name}/${destination}`;
    uploadCache[cloudinaryFilename] = url;
    return url;
  } catch (error) {
    console.error(`   ❌ Failed to upload ${cloudinaryFilename}:`, error.message);
    return null;
  }
}

// ── Step 3: Process all Cloudinary URLs in an object ──
async function migrateUrl(url, backupMap) {
  if (!url || typeof url !== 'string') return url;
  if (!url.includes('cloudinary.com') && !url.includes('res.cloudinary.com')) return url;

  const filename = extractCloudinaryFilename(url);
  if (!filename) {
    console.log(`   ⚠️  Could not parse filename from: ${url}`);
    return url;
  }

  const localPath = backupMap[filename];
  if (!localPath) {
    console.log(`   ⚠️  No backup found for: ${filename}`);
    return url; // Keep old URL (won't work, but we can't fix it without the image)
  }

  const newUrl = await uploadToFirebaseStorage(localPath, filename);
  return newUrl || url;
}

// Batch-upload helper with concurrency
async function batchProcess(items, fn, concurrency = CONCURRENCY) {
  const results = [];
  for (let i = 0; i < items.length; i += concurrency) {
    const chunk = items.slice(i, i + concurrency);
    const chunkResults = await Promise.all(chunk.map(fn));
    results.push(...chunkResults);
  }
  return results;
}

// ── Step 4: Migrate each collection ──
async function migrateProducts(backupMap) {
  console.log('\n🛍️  Migrating PRODUCTS...');
  const snap = await db.collection('products').get();
  let updated = 0;
  let total = snap.size;

  for (const docSnap of snap.docs) {
    const data = docSnap.data();
    const updates = {};
    let changed = false;

    // imageUrl (main product image)
    if (data.imageUrl && data.imageUrl.includes('cloudinary')) {
      updates.imageUrl = await migrateUrl(data.imageUrl, backupMap);
      changed = true;
    }

    // images[] (additional images array)
    if (data.images && Array.isArray(data.images)) {
      const newImages = [];
      for (const imgUrl of data.images) {
        if (imgUrl && imgUrl.includes('cloudinary')) {
          const newUrl = await migrateUrl(imgUrl, backupMap);
          newImages.push(newUrl);
          changed = true;
        } else {
          newImages.push(imgUrl);
        }
      }
      if (changed) updates.images = newImages;
    }

    // colors[].imageUrl
    if (data.colors && Array.isArray(data.colors)) {
      const newColors = [...data.colors];
      for (let i = 0; i < newColors.length; i++) {
        if (newColors[i].imageUrl && newColors[i].imageUrl.includes('cloudinary')) {
          newColors[i] = { ...newColors[i] };
          newColors[i].imageUrl = await migrateUrl(newColors[i].imageUrl, backupMap);
          changed = true;
        }
      }
      if (changed) updates.colors = newColors;
    }

    if (changed) {
      await docSnap.ref.update(updates);
      updated++;
      if (updated % 10 === 0) console.log(`   Progress: ${updated}/${total} products updated...`);
    }
  }

  console.log(`   ✅ ${updated}/${total} products migrated.`);
}

async function migrateBanners(backupMap) {
  console.log('\n🖼️  Migrating BANNERS...');
  const snap = await db.collection('mobile_banners').get();
  let updated = 0;

  for (const docSnap of snap.docs) {
    const data = docSnap.data();
    const updates = {};
    let changed = false;

    for (const field of ['mobileImage', 'desktopImage', 'imageUrl', 'image']) {
      if (data[field] && typeof data[field] === 'string' && data[field].includes('cloudinary')) {
        updates[field] = await migrateUrl(data[field], backupMap);
        changed = true;
      }
    }

    if (changed) {
      await docSnap.ref.update(updates);
      updated++;
    }
  }

  console.log(`   ✅ ${updated}/${snap.size} banners migrated.`);
}

async function migrateReviews(backupMap) {
  console.log('\n⭐ Migrating REVIEWS...');
  const snap = await db.collection('reviews').get();
  let updated = 0;

  for (const docSnap of snap.docs) {
    const data = docSnap.data();
    let changed = false;
    const updates = {};

    if (data.images && Array.isArray(data.images)) {
      const newImages = [];
      for (const imgUrl of data.images) {
        if (imgUrl && imgUrl.includes('cloudinary')) {
          const newUrl = await migrateUrl(imgUrl, backupMap);
          newImages.push(newUrl);
          changed = true;
        } else {
          newImages.push(imgUrl);
        }
      }
      if (changed) updates.images = newImages;
    }

    if (changed) {
      await docSnap.ref.update(updates);
      updated++;
    }
  }

  console.log(`   ✅ ${updated}/${snap.size} reviews migrated.`);
}

async function migrateOrders(backupMap) {
  console.log('\n📦 Migrating ORDER item images...');
  const snap = await db.collection('orders').get();
  let updated = 0;

  for (const docSnap of snap.docs) {
    const data = docSnap.data();
    let changed = false;
    const updates = {};

    // Orders may have items[] with imageUrl
    if (data.items && Array.isArray(data.items)) {
      const newItems = [];
      for (const item of data.items) {
        const newItem = { ...item };
        if (item.imageUrl && item.imageUrl.includes('cloudinary')) {
          newItem.imageUrl = await migrateUrl(item.imageUrl, backupMap);
          changed = true;
        }
        if (item.image && item.image.includes('cloudinary')) {
          newItem.image = await migrateUrl(item.image, backupMap);
          changed = true;
        }
        newItems.push(newItem);
      }
      if (changed) updates.items = newItems;
    }

    if (changed) {
      await docSnap.ref.update(updates);
      updated++;
    }
  }

  console.log(`   ✅ ${updated}/${snap.size} orders migrated.`);
}

// ── Step 5: Run everything ──
async function main() {
  console.log('═══════════════════════════════════════════════════');
  console.log('  🚀 Cloudinary → Firebase Storage Migration');
  console.log('═══════════════════════════════════════════════════');

  // Build the mapping
  const backupMap = buildBackupMap();

  // First, upload ALL backup images to Firebase Storage
  console.log('\n📤 Uploading all backup images to Firebase Storage...');
  const allFiles = Object.entries(backupMap);
  let uploadCount = 0;

  for (let i = 0; i < allFiles.length; i += CONCURRENCY) {
    const chunk = allFiles.slice(i, i + CONCURRENCY);
    await Promise.all(
      chunk.map(async ([filename, localPath]) => {
        await uploadToFirebaseStorage(localPath, filename);
        uploadCount++;
      })
    );
    if (uploadCount % 100 === 0 || uploadCount === allFiles.length) {
      console.log(`   Uploaded: ${uploadCount}/${allFiles.length}`);
    }
  }

  console.log(`\n✅ All ${uploadCount} images uploaded to Firebase Storage!`);

  // Now update Firestore documents
  await migrateProducts(backupMap);
  await migrateBanners(backupMap);
  await migrateReviews(backupMap);
  await migrateOrders(backupMap);

  console.log('\n═══════════════════════════════════════════════════');
  console.log('  ✅ MIGRATION COMPLETE!');
  console.log(`  📊 ${Object.keys(uploadCache).length} unique images migrated`);
  console.log('  🔗 All Firestore URLs updated to Firebase Storage');
  console.log('═══════════════════════════════════════════════════');
}

main().catch(err => {
  console.error('Migration failed:', err);
  process.exit(1);
});
