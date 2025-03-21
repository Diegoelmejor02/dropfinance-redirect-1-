const express = require('express');
const axios = require('axios');
const dotenv = require('dotenv');
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

const { APP_ID, APP_SECRET, REDIRECT_URI } = process.env;

// Ruta para iniciar el flujo de OAuth
app.get('/login', (req, res) => {
    const authUrl = `https://www.facebook.com/v12.0/dialog/oauth?client_id=${APP_ID}&redirect_uri=${REDIRECT_URI}&scope=email`;
    res.redirect(authUrl);
});

// Ruta de redireccionamiento
app.get('/oauth_callback', async (req, res) => {
    const { code, error, error_reason } = req.query;

    if (error) {
        console.error(`Error de Meta: ${error_reason} - ${error}`);
        return res.status(400).send(`Error de autenticación: ${error_reason}`);
    }

    if (!code) {
        return res.status(400).send('Código de autorización no proporcionado.');
    }

    try {
        // Intercambia el código por un token de acceso
        const tokenResponse = await axios.get(`https://graph.facebook.com/v12.0/oauth/access_token?client_id=${APP_ID}&client_secret=${APP_SECRET}&code=${code}&redirect_uri=${REDIRECT_URI}`);
        const accessToken = tokenResponse.data.access_token;

        // Aquí puedes guardar el token de acceso en tu base de datos
        console.log(`Token de acceso: ${accessToken}`);

        // Redirige al usuario a una página de éxito
        res.redirect('/success');
    } catch (error) {
        console.error('Error en el flujo de OAuth:', error.response ? error.response.data : error.message);
        res.status(500).send('Error en el servidor');
    }
});

// Ruta de éxito
app.get('/success', (req, res) => {
    res.send('Autenticación exitosa. Ahora puedes integrar con Google Sheets.');
});

// Inicia el servidor
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});