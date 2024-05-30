
class Sessions {
    /** @type {Map<string, Session>} */
    static Sessions = new Map();

    /**
     * @param {string} userId
     * @param {string} credentialId 
     */
    static add(userId, credentialId) {
        this.Sessions.set(userId, { credentialId, at: new Date() + 300_000 });
        return true;
    };

    /**
     * @param {String} userId 
     */
    static getUserCredentials(userId) {
        const session = this.Sessions.get(userId);

        if (!session) {
            return null;
        }

        if ((Date.now() > session.at) && this.Sessions.delete(userId)) {
            return null;
        }

        return session.credentialId;
    };
}

module.exports = Sessions;