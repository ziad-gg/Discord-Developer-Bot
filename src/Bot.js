const { default: axios } = require('axios');

class BotManager {
    static async createProfile(username, token) {
        const payload = {
            url: 'https://discord.com/api/applications',
            method: 'post',
            data: {
                name: username,
                bot_public: true,
                bot_require_code_grant: false,
                flags: 565248,
            },
            headers: {
                Authorization: `${token}`
            },
        };

        const response = await axios(payload).catch(_ => _.response);
        console.log(response.data);
        return response.data;
    }

    static async verifyProfile(id, token, mfa = '') {
        const payload = {
            url: `https://discord.com/api/applications/${id}/bot`,
            method: 'post',
            headers: {
                Authorization: `${token}`,
                'X-Discord-Mfa-Authorization': mfa
            }
        };

        const response = await axios(payload).catch(_ => _.response);
        console.log('bot: ', response.data);
        return response.data;
    }

   static async skus(id, token) {
     const payload = {
         url: `https://discord.com/api/v9/applications/${id}/skus?localize=false&with_bundled_skus=true`,
         method: 'get',
         headers: {
             Authorization: `${token}`
         },
     };

     const response = await axios(payload).catch(_ => _.response);
     console.log('skus: ', response.status);
     return response.data;
   }
}

module.exports = BotManager;