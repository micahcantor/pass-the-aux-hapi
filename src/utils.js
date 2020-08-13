const Axios = require('axios');
const Qs = require('qs');

const requestSpotify = (endpoint, method, query, accessToken) => {

    return Axios({
        method,
        url: 'https://api.spotify.com/v1/' + endpoint,
        headers: { 'Authorization': `Bearer ${accessToken}` },
        params: query
    });
};

const requestSpotifyPayload = (endpoint, method, data, query, accessToken) => {

    return Axios({
        method,
        url: 'https://api.spotify.com/v1/' + endpoint,
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
        },
        params: query,
        data
    });
};

const refreshAccessToken = async (db, id) => {

    const credsString = `${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`;
    const credsBase64 = Buffer.from(credsString).toString('base64');
    const sessionInfo = await db.collection('sessions').findOne({ _id: id });
    const userRefreshToken = sessionInfo.auth.artifacts.refresh_token;

    const response = await Axios({
        method: 'post',
        url: 'https://accounts.spotify.com/api/token',
        data: Qs.stringify({
            grant_type: 'refresh_token',
            refresh_token: userRefreshToken
        }),
        headers: {
            'content-type': 'application/x-www-form-urlencoded',
            'Authorization': `Basic ${credsBase64}`
        }
    });

    return response.data.access_token;
};

const shouldRefreshToken = async (db, id) => {

    const sessionInfo = await db.collection('sessions').findOne({ _id: id });
    const last_update = sessionInfo.last_update;
    const current_time = new Date().getTime();
    const ONE_HOUR = 3600 * 1000;

    if (current_time - last_update > ONE_HOUR) {
        return true;
    }

    return false;
};

module.exports = { requestSpotifyPayload, requestSpotify, refreshAccessToken, shouldRefreshToken }