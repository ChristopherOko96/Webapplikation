const express = require("express");
const { v4: uuidv4 } = require("uuid");
const Sitzung = require("./classes/Sitzung");
const User = require("./classes/User");
const Moderator = require("./classes/Moderator");

const app = express();
app.use(express.json());
app.use(express.static("public")); // Statische Dateien bereitstellen

const users = {}; // Nutzer-Objekte
const sessions = {}; // Sitzungen-Objekte

// Routen für Benutzerregistrierung
app.post("/api/users/register", (req, res) => {
    const { loginName, passwort, isModerator } = req.body;
    const userid = uuidv4();

    let user;
    if (isModerator) {
        user = new Moderator(userid, loginName, passwort);
    } else {
        user = new User(userid, loginName, passwort);
    }

    users[userid] = user;
    res.status(201).json(user);
});

// Routen für Benutzeranmeldung
app.post("/api/users/login", (req, res) => {
    const { loginName, passwort } = req.body;

    const user = Object.values(users).find(
        (u) => u.loginName === loginName && u.passwort === passwort
    );

    if (!user) {
        return res.status(401).json({ error: "Ungültige Anmeldedaten" });
    }

    user.updateStatus("online");
    res.status(200).json(user);
});

// Routen für Sitzungserstellung
app.post("/api/sessions/create", (req, res) => {
    const { userID, name, passwort } = req.body;

    if (!users[userID]) {
        return res.status(404).json({ error: "Benutzer nicht gefunden" });
    }

    const user = users[userID];
    const sessionID = uuidv4();

    let session;
    if (user instanceof Moderator) {
        session = user.createSitzung(new Sitzung(sessionID, name, passwort));
    } else {
        session = new Sitzung(sessionID, name, passwort);
    }

    sessions[sessionID] = session;
    res.status(201).json(session);
});

// Routen für Sitzungbeitritt
app.post("/api/sessions/join", (req, res) => {
    const { sessionID, userID } = req.body;

    const session = sessions[sessionID];
    const user = users[userID];

    if (!session || !user) {
        return res.status(404).json({ error: "Sitzung oder Benutzer nicht gefunden" });
    }

    session.addTeilnehmer(user);
    res.status(200).json(session);
});

// Starte den Server
const PORT = 3000;
app.listen(PORT, () => console.log(`Server läuft auf http://localhost:${PORT}`));
