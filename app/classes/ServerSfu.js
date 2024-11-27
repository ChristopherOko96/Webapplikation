class ServerSfu {
    constructor(sfuID) {
        this.sfuID = sfuID; // Integer
        this.streams = []; // List of MediaStreams
    }

    addStream(stream) {
        this.streams.push(stream);
    }

    distributeStream(stream) {
        console.log(`Distributing stream ${stream.streamID} of type ${stream.type}`);
        // Add distribution logic here
    }
}

module.exports = ServerSfu;
