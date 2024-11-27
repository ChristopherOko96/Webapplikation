class User {
    constructor(userid, loginName, passwort, status = "offline") {
        this.userid = userid; // Integer
        this.loginName = loginName; // String
        this.passwort = passwort; // String
        this.status = status; // String ("online", "offline", "busy")
    }

    updateStatus(newStatus) {
        this.status = newStatus;
    }
}

module.exports = User;
