const admin = require("firebase-admin");
const serviceAccount = require("./config/prototypconnectnow-firebase-adminsdk-p6sqx-c2f280b6a7.json");

// Initialisiere Firebase Admin SDK
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
});

// Zugriff auf Firestore
const db = admin.firestore();

// Export von DB-Instanz
module.exports = db;
