class Sitzung {
    constructor(sitzungID, name, passwort) {
        this.sitzungID = sitzungID; // String
        this.name = name; // String
        this.passwort = passwort; // String
        this.aktiveTeilnehmer = []; // List of User
    }

    addTeilnehmer(user) {
        this.aktiveTeilnehmer.push(user);
    }

    removeTeilnehmer(userID) {
        this.aktiveTeilnehmer = this.aktiveTeilnehmer.filter(user => user.userid !== userID);
    }
}

module.exports = Sitzung;
