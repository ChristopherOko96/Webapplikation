const User = require("./User");

class Moderator extends User {
    constructor(userid, loginName, passwort, status = "offline") {
        super(userid, loginName, passwort, status);
        this.moderatorID = userid; // Integer, same as user ID
        this.erstellteSitzungen = []; // List of created sessions
    }

    createSitzung(sitzung) {
        this.erstellteSitzungen.push(sitzung);
        return sitzung;
    }
}

module.exports = Moderator;
