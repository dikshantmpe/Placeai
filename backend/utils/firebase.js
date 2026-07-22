// backend/utils/firebase.js
const admin = require('firebase-admin');

// Only initialize if it hasn't been initialized yet
if (admin.apps.length === 0) {
  try {
    const configString = process.env.FIREBASE_CONFIG;
    
    if (!configString) {
      throw new Error("FIREBASE_CONFIG is missing from .env file");
    }

    const serviceAccount = JSON.parse(configString);
    
    // Safely fix the private key formatting
    if (serviceAccount.private_key) {
      serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, '\n');
    }

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
    console.log('✅ Firebase Admin Initialized Successfully');
  } catch (error) {
    console.error('❌ Firebase Admin Initialization Error:', error.message);
  }
}