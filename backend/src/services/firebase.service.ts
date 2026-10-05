import * as admin from 'firebase-admin';
import path from 'path';
import fs from 'fs';

const serviceAccountPath = path.resolve(__dirname, '../../firebase-service-key.json');

if (fs.existsSync(serviceAccountPath)) {
  const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
} else {
  // Mock initialize if key doesn't exist yet to prevent crashes in dev setup
  console.warn('⚠️  firebase-service-key.json non-existent. Using default/dummy initialization for dev mode.');
  admin.initializeApp({
    projectId: process.env.FIREBASE_PROJECT_ID || 'demo-project'
  });
}

export const firebaseAdmin = admin;
