const admin = require("firebase-admin");
const serviceAccount = require("./path/to/your-service-account-file.json");

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://<your-database-name>.firebaseio.com"
});

const db = admin.firestore();
module.exports = db;
