class MediaStream {
    constructor(streamID, type, sessionID, ownerID) {
        this.streamID = streamID; // UUID für den Stream
        this.type = type; // "audio", "video", "screen-share"
        this.sessionID = sessionID; // Zugehörige Sitzung
        this.ownerID = ownerID; // UserID des Stream-Eigentümers
    }
}

module.exports = MediaStream;