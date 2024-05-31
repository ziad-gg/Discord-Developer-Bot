const { bot } = require('@/prisma');
const { default: axios } = require('axios');

const { getRandomAvatar } = require('./Utils');

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
    };

    /**
     * @param {string} botId  
     * @param {string} token 
     * @returns {Promise<DiscordBot>}
     */
    static async getBotById(botId, token) {
        const response = await axios.get(`https://discord.com/api/v9/applications/${botId}`, {
            headers: {
                Authorization: `${token}`
            }
        }).catch(e => null);

        if (!response) return null;
        return response.data;
    };

    /**
     * 
     * @param {string} botId 
     * @param {string} token 
     * @param {string} mfa 
     * @returns {Promise<{ type: 'verfication' | 'done', token: string | undefined }>}
     */
    static async deleteBotById(botId, token, mfa) {
        const response = await axios.post(`https://discord.com/api/v9/applications/${botId}/delete`, undefined, {
            headers: {
                Authorization: `${token}`,
                'X-Discord-Mfa-Authorization': mfa
            }
        }).catch(e => e.response);

        if (response.data.code == 60003) {
            return { type: 'verfication', token: response.data.mfa.ticket }
        } else {
            return { type: 'done' }
        }
    };

    /**
     * 
     * @param {string} url 
     * @param {string} auth 
     * @param {{}} body 
     * @param {{}} moreHeaders 
     * @returns {Promise<import('axios').AxiosResponse>}
     */
    static async post(url, auth, body = {}, moreHeaders = {}) {
        return await axios.post(url, body, {
            headers: auth ? {
                'Authorization': auth,
                ...moreHeaders
            } : null
        }).catch(e => e.response)
    };

    /**
     * @param {string} name 
     * @param {string} token 
     * @returns {Promise<DiscordBot>}
     */
    static async CreateBot(name, token) {
        const icon = await getRandomAvatar();

        const payload = {
            url: 'https://discord.com/api/applications',
            method: 'post',
            dats: {
                name,
                flags: 565248,
                public_bot: true,
                bot_require_code_grant: false,
                icon: icon
            },
            headers: {
                Authorization: `${token}`
            },
        };

        const response = await axios(payload).catch(e => e.response);

        console.log(response.data.responses[0]);

        return response.data;
    };

    static async EditBot(id, token, data) {

        const response = await axios.patch(`https://discord.com/api/v9/applications/${id}/bot`, data, {
            headers: {
                Authorization: `${token}`,
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
                'X-Track': 'eyJvcyI6IldpbmRvd3MiLCJicm93c2VyIjoiQ2hyb21lIiwiZGV2aWNlIjoiIiwic3lzdGVtX2xvY2FsZSI6ImVuLVVTIiwiYnJvd3Nlcl91c2VyX2FnZW50IjoiTW96aWxsYS81LjAgKFdpbmRvd3MgTlQgMTAuMDsgV2luNjQ7IHg2NCkgQXBwbGVXZWJLaXQvNTM3LjM2IChLSFRNTCwgbGlrZSBHZWNrbykgQ2hyb21lLzEyNS4wLjAuMCBTYWZhcmkvNTM3LjM2IiwiYnJvd3Nlcl92ZXJzaW9uIjoiMTI1LjAuMC4wIiwib3NfdmVyc2lvbiI6IjEwIiwicmVmZXJyZXIiOiIiLCJyZWZlcnJpbmdfZG9tYWluIjoiIiwicmVmZXJyZXJfY3VycmVudCI6IiIsInJlZmVycmluZ19kb21haW5fY3VycmVudCI6IiIsInJlbGVhc2VfY2hhbm5lbCI6InN0YWJsZSIsImNsaWVudF9idWlsZF9udW1iZXIiOjQwNjAyLCJjbGllbnRfZXZlbnRfc291cmNlIjpudWxsfQ== '
            }
        }).catch(e => e);

        // console.log(response.response.data.errors.username);
        if (response.response) return null;
        return response.data;
    };

    static async ReportBotCreated(botid, token) {
        const response = await axios.post(`https://discord.com/api/v9/users/@me/applications/${botid}/entitlements`, {
            headers: {
                Authorization: `${token}`
            }
        }).catch(e => null);

        if (!response) return null;
        return response.data;
    }

};

module.exports = Manager;