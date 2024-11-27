let localStream;
const peerConnections = {}; // Speichere PeerConnections für jeden Teilnehmer
const configuration = {
    iceServers: [
        { urls: "stun:stun.l.google.com:19302" }, // STUN-Server
    ],
};

// Backend-URL
const API_URL = "http://localhost:3000/api";

// Benutzer registrieren
async function registerUser() {
    const loginName = document.getElementById("usernameInputFeldReg").value;
    const passwort = document.getElementById("registerPass").value;

    try {
        const response = await fetch(`${API_URL}/users/register`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ loginName, passwort, isModerator: false }),
        });
        const data = await response.json();
        if (response.ok) {
            localStorage.setItem("userID", data.userid);
            localStorage.setItem("username", data.loginName);
            alert("Registrierung erfolgreich!");
            window.location.href = "loginPage.html";
        } else {
            alert(data.error || "Registrierung fehlgeschlagen");
        }
    } catch (error) {
        console.error("Fehler bei der Registrierung:", error);
    }
}

// Benutzer anmelden
async function loginUser() {
    const loginName = document.getElementById("usernameInputFeld").value;
    const passwort = document.getElementById("loginPass").value;

    try {
        const response = await fetch(`${API_URL}/users/login`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ loginName, passwort }),
        });
        const data = await response.json();
        if (response.ok) {
            localStorage.setItem("userID", data.userid);
            localStorage.setItem("username", data.loginName);
            alert("Anmeldung erfolgreich!");
            window.location.href = "afterLogin.html";
        } else {
            alert(data.error || "Anmeldung fehlgeschlagen");
        }
    } catch (error) {
        console.error("Fehler bei der Anmeldung:", error);
    }
}

// Raum erstellen oder beitreten
async function enterRoom(action) {
    const userID = localStorage.getItem("userID");

    if (action === "create") {
        const passwort = document.getElementById("roomPassword").value;
        try {
            const response = await fetch(`${API_URL}/sessions/create`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    userID,
                    name: "Neuer Raum",
                    passwort,
                }),
            });
            const data = await response.json();
            if (response.ok) {
                localStorage.setItem("sessionID", data.sitzungID); // Speichere sessionID
                alert("Raum erfolgreich erstellt!");
                window.location.href = "roomPage.html";
            } else {
                alert(data.error || "Fehler beim Erstellen des Raums");
            }
        } catch (error) {
            console.error("Fehler beim Erstellen des Raums:", error);
        }
    }

    if (action === "join") {
    const sessionID = document.getElementById("joinRoomID").value;
    const passwort = document.getElementById("joinRoomPassword").value; // Passwort hinzufügen
    try {
        const response = await fetch(`${API_URL}/sessions/join`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ sessionID, userID, passwort }), // Passwort mitsenden
        });
        const data = await response.json();
        if (response.ok) {
            localStorage.setItem("sessionID", sessionID); // Speichere sessionID
            alert("Raum erfolgreich beigetreten!");
            window.location.href = "roomPage.html";
        } else {
            alert(data.error || "Fehler beim Beitreten des Raums");
        }
    } catch (error) {
        console.error("Fehler beim Beitreten des Raums:", error);
    }
}

}

// Logout
function logout() {
    localStorage.clear();
    alert("Abgemeldet!");
    window.location.href = "index.html";
}

// Stream hinzufügen
async function addStream(type) {
    const sessionID = localStorage.getItem("sessionID");
    const ownerID = localStorage.getItem("userID");

    try {
        const response = await fetch(`${API_URL}/streams/add`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ type, sessionID, ownerID }),
        });
        const data = await response.json();
        if (response.ok) {
            console.log("Stream hinzugefügt:", data);
        } else {
            alert(data.error || "Fehler beim Hinzufügen des Streams");
        }
    } catch (error) {
        console.error("Fehler beim Hinzufügen des Streams:", error);
    }
}

// Stream entfernen
async function removeStream(streamID) {
    try {
        const response = await fetch(`${API_URL}/streams/remove`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ streamID }),
        });
        const data = await response.json();
        if (response.ok) {
            console.log("Stream entfernt:", data);
        } else {
            alert(data.error || "Fehler beim Entfernen des Streams");
        }
    } catch (error) {
        console.error("Fehler beim Entfernen des Streams:", error);
    }
}

// Starte lokale Medien
async function startMedia() {
    try {
        localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        const videoElement = document.createElement("video");
        videoElement.srcObject = localStream;
        videoElement.autoplay = true;
        document.querySelector(".video-grid").appendChild(videoElement);
    } catch (error) {
        console.error("Fehler beim Starten der Medien:", error);
    }
}

// WebRTC Signalisierung
const socket = io("http://localhost:3000");

// Signal senden
function sendSignal(to, signalData) {
    socket.emit("signal", { to, signalData });
}

// Eingehende Signale verarbeiten
socket.on("signal", async (data) => {
    const { from, signalData } = data;

    // Erstelle PeerConnection, falls noch nicht vorhanden
    if (!peerConnections[from]) {
        peerConnections[from] = new RTCPeerConnection(configuration);

        // Lokale Tracks hinzufügen
        localStream.getTracks().forEach((track) => {
            peerConnections[from].addTrack(track, localStream);
        });

        // ICE-Kandidaten weiterleiten
        peerConnections[from].onicecandidate = (event) => {
            if (event.candidate) {
                sendSignal(from, { ice: event.candidate });
            }
        };

        // Remote-Stream empfangen
        peerConnections[from].ontrack = (event) => {
            const remoteVideo = document.createElement("video");
            remoteVideo.srcObject = event.streams[0];
            remoteVideo.autoplay = true;
            document.querySelector(".video-grid").appendChild(remoteVideo);
        };
    }

    // Verarbeite Signalisierungsdaten
    if (signalData.sdp) {
        await peerConnections[from].setRemoteDescription(
            new RTCSessionDescription(signalData.sdp)
        );

        if (signalData.sdp.type === "offer") {
            const answer = await peerConnections[from].createAnswer();
            await peerConnections[from].setLocalDescription(answer);
            sendSignal(from, { sdp: answer });
        }
    } else if (signalData.ice) {
        await peerConnections[from].addIceCandidate(new RTCIceCandidate(signalData.ice));
    }
});

// Einen neuen Anruf starten
async function startCall() {
    const sessionID = localStorage.getItem("sessionID");

    socket.emit("join-session", sessionID); // Trete der Session bei

    // Peer-Verbindungen initialisieren
    const userID = localStorage.getItem("userID");

    // Sende ein SDP-Angebot (Offer)
    for (const peerID of Object.keys(peerConnections)) {
        const offer = await peerConnections[peerID].createOffer();
        await peerConnections[peerID].setLocalDescription(offer);
        sendSignal(peerID, { sdp: offer });
    }
}
