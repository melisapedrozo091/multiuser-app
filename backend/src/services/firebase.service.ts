import * as admin from 'firebase-admin';
import path from 'path';
import fs from 'fs';

const serviceAccountPath = path.resolve(__dirname, '../../firebase-service-key.json');

export const hasFirebaseKey = fs.existsSync(serviceAccountPath);

if (hasFirebaseKey) {
  const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
} else {
  console.warn('⚠️ firebase-service-key.json non-existent. Using local JWT authentication mode.');
  try {
    admin.initializeApp({
      projectId: process.env.FIREBASE_PROJECT_ID || 'demo-project'
    });
  } catch (e) {}
}

export const firebaseAdmin = admin;

