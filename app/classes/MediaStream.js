class MediaStream {
    constructor(streamID, type, sessionID) {
        this.streamID = streamID; // Integer
        this.type = type; // String (e.g., "audio", "video", "screen-share")
        this.sessionID = sessionID; // Associated session ID
    }
}

module.exports = MediaStream;
