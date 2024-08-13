const express = require('express');
const axios = require('axios');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const port = 8888;

const client_id = process.env.CLIENT_ID;
const client_secret = process.env.CLIENT_SECRET;
const redirect_uri = process.env.REDIRECT_URI;

app.get('/login', (req, res) => {
    const scopes = 'user-top-read';
    res.redirect('https://accounts.spotify.com/authorize?' +
        new URLSearchParams({
            response_type: 'code',
            client_id: client_id,
            scope: scopes,
            redirect_uri: redirect_uri,
        }).toString());
});

app.get('/callback', async (req, res) => {
    const code = req.query.code || null;
    const tokenOptions = {
        url: 'https://accounts.spotify.com/api/token',
        method: 'post',
        headers: {
            'Authorization': 'Basic ' + Buffer.from(client_id + ':' + client_secret).toString('base64'),
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        data: new URLSearchParams({
            code: code,
            redirect_uri: redirect_uri,
            grant_type: 'authorization_code'
        }).toString()
    };

    try {
        const tokenResponse = await axios(tokenOptions);
        const access_token = tokenResponse.data.access_token;
        res.redirect('/?access_token=' + access_token);
    } catch (error) {
        console.error(error);
        res.send('Error during authentication');
    }
});

app.get('/user-top-tracks', async (req, res) => {
    const access_token = req.query.access_token;
    const options = {
        url: 'https://api.spotify.com/v1/me/top/tracks',
        method: 'get',
        headers: {
            'Authorization': 'Bearer ' + access_token
        }
    };

    try {
        const topTracksResponse = await axios(options);
        res.json(topTracksResponse.data);
    } catch (error) {
        console.error(error);
        res.send('Error fetching top tracks');
    }
});

app.listen(port, () => {
    console.log(`Listening on port ${port}. Go to http://localhost:${port}/login to log in to Spotify.`);
});
