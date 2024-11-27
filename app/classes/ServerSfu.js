class ServerSfu {
    constructor(sfuID) {
        this.sfuID = sfuID; // ID des Servers
        this.streams = []; // Liste aller verwalteten MediaStreams
    }

    addStream(stream) {
        this.streams.push(stream);
    }

    removeStream(streamID) {
        this.streams = this.streams.filter((s) => s.streamID !== streamID);
    }

    distributeStream(stream) {
        console.log(`Distributing stream ${stream.streamID} of type ${stream.type}`);
        // Distribution-Logik könnte hier implementiert werden
    }
}

module.exports = ServerSfu;
