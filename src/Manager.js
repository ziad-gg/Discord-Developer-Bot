const { default: axios } = require('axios');

class Manager {
    /**
     * @param {string} token 
     * @returns {Promise<DiscordUser>}
     */
    static async CheckToken(token, bot = false) {
        const response = await axios.get('https://discord.com/api/v9/users/@me?with_analytics_token=true', {
            headers: {
                Authorization: bot ? `Bot ${token}` : `${token}`
            }
        }).catch(e => null);

        if (!response) return null;
        return response.data;
    };

    /**
     * @param {String} token
     * @returns {Promise<DiscordBot[]>} 
     */
    static async GetApplication(token) {
        const response = await axios.get('https://discord.com/api/v9/applications?with_team_applications=true', {
            headers: {
                Authorization: `${token}`
            }
        }).catch(e => null);

        if (!response) return null;
        return response.data;
    }

    /**
     * @param {string} botId 
     * @param {string} token 
     * @param {string} mfa 
     * @returns {Promise<{ type: 'verfication' | 'token', token: string }>}
     */
    static async ResetToken(botId, token, mfa) {
        const response = await axios.post(`https://discord.com/api/v9/applications/${botId}/bot/reset`, undefined, {
            headers: {
                Authorization: `${token}`,
                'X-Discord-Mfa-Authorization': mfa
            }
        }).catch(e => e.response);

        if (response.data.code == 60003) {
            return { type: 'verfication', token: response.data.mfa.ticket }
        } else {
            return { type: 'token', token: response.data.token }
        }
    };

    /**
     * 
     * @param {string} token 
     * @param {string} password 
     * @param {string} ticket 
     * @returns {Promise<{ token: string }>}
     */
    static async verificaiton(token, password, ticket) {
        const response = await axios.post('https://discord.com/api/v9/mfa/finish', {
            data: password,
            mfa_type: 'password',
            ticket,
        }, {
            headers: {
                Authorization: `${token}`
            }
        }).catch(e => e);

        // 60008 invalid password
        if (response.response) return null;
        return response.data;
    }
};

module.exports = Manager;