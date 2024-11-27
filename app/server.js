const express = require("express");
const { v4: uuidv4 } = require("uuid");
const http = require("http");
const { Server } = require("socket.io");
const Sitzung = require("./classes/Sitzung");
const User = require("./classes/User");
const Moderator = require("./classes/Moderator");
const MediaStream = require("./classes/MediaStream");
const ServerSfu = require("./classes/ServerSfu");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.json());
app.use(express.static("public"));

const users = {};
const sessions = {};
const sfuServer = new ServerSfu("SFU-1");

// DB import
const db = require("./Firebase");

// Benutzerregistrierung
app.post("/api/users/register", async (req, res) => {
    const { loginName, passwort, isModerator } = req.body;

    console.log("Daten Empfangen :  " , req.body);

    try {
        // Überprüfen, ob ein Benutzer mit demselben loginName existiert
        const userSnapshot = await db
            .collection("users")
            .where("loginName", "==", loginName)
            .get();

        if (!userSnapshot.empty) {
            // Benutzer existiert bereits
            return res.status(400).json({ error: "Benutzername existiert bereits" });
        }

        const userid = uuidv4(); // Generiere eine UUID für den Benutzer

        // Nutzerobjekt erstellen
        const user = {
            userid,
            loginName,
            passwort, // In der Praxis: Passwörter verschlüsseln
            role: isModerator ? "Moderator" : "User",
            createdAt: new Date().toISOString(),
        };

        // Speichere den Benutzer in Firestore
        await db.collection("users").doc(userid).set(user);

        // Erfolgsantwort senden
        res.status(201).json(user);
    } catch (error) {
        console.error("Fehler bei der Registrierung:", error);
        res.status(500).json({ error: "Interner Serverfehler" });
    }
});


// Benutzeranmeldung
app.post("/api/users/login", async (req, res) => {
    const { loginName, passwort } = req.body;

    console.log("Req Body: ", req.body);

    try {
        // Suche nach dem Benutzer mit dem angegebenen loginName
        const userSnapshot = await db
            .collection("users")
            .where("loginName", "==", loginName)
            .get();

        if (userSnapshot.empty) {
            // Benutzer nicht gefunden
            return res.status(401).json({ error: "Ungültige Anmeldedaten" });
        }

        // Hole die Benutzerdaten aus der Datenbank
        const userData = userSnapshot.docs[0].data();

        // Überprüfe das Passwort
        if (userData.passwort !== passwort) {
            return res.status(401).json({ error: "Ungültige Anmeldedaten" });
        }

        // Erstelle eine Instanz der User-Klasse ist momentan nur temporär erzeugt und in die Firestore gespeichert
        const user = new User(
            userData.userid,
            userData.loginName,
            userData.passwort,
            "online" // Status wird beim Login auf "online" gesetzt
        );

        console.log("User Instanz: ", user);

        // Aktualisiere den Status in Firestore
        await db.collection("users").doc(userData.userid).update({
            status: "online",
        });

        // Sende den Benutzer als Antwort zurück
        res.status(200).json({
            userid: user.userid,
            loginName: user.loginName,
            status: user.status,
        });
    } catch (error) {
        console.error("Fehler bei der Anmeldung: ", error);
        res.status(500).json({ error: "Interner Serverfehler" });
    }
});


// Sitzung erstellen
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

// Sitzung beitreten
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

// Stream hinzufügen
app.post("/api/streams/add", (req, res) => {
    const { type, sessionID, ownerID } = req.body;

    if (!sessions[sessionID] || !users[ownerID]) {
        return res.status(404).json({ error: "Sitzung oder Benutzer nicht gefunden" });
    }

    const streamID = uuidv4();
    const stream = new MediaStream(streamID, type, sessionID, ownerID);

    sfuServer.addStream(stream);
    res.status(201).json(stream);
});

// Stream entfernen
app.post("/api/streams/remove", (req, res) => {
    const { streamID } = req.body;

    const stream = sfuServer.streams.find((s) => s.streamID === streamID);
    if (!stream) {
        return res.status(404).json({ error: "Stream nicht gefunden" });
    }

    sfuServer.removeStream(streamID);
    res.status(200).json({ message: `Stream ${streamID} entfernt` });
});

// WebSocket Signalisierung
io.on("connection", (socket) => {
    console.log("Benutzer verbunden:", socket.id);

    socket.on("signal", (data) => {
        io.to(data.to).emit("signal", data);
    });

    socket.on("join-session", (sessionID) => {
        socket.join(sessionID);
        console.log(`Benutzer ${socket.id} ist Sitzung ${sessionID} beigetreten`);
    });

    socket.on("disconnect", () => {
        console.log("Benutzer getrennt:", socket.id);
    });
});

// Starten des Servers
const PORT = 3000;
server.listen(PORT, () => console.log(`Server läuft auf http://localhost:${PORT}`));
