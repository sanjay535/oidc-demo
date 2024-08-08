import { Issuer, generators } from 'openid-client';
import express from 'express';
import session from 'express-session';
import { PROVIDER_PORT,CLIENT_ID,CLIENT_SECRET,REDIRECT_URI, CLIENT_PORT } from './constant.js';

const app = express();
const client_id = CLIENT_ID;
const client_secret = CLIENT_SECRET;
const redirect_uri = REDIRECT_URI;

app.use(session({
  secret: 'supersecret',
  resave: false,
  saveUninitialized: true,
}));

async function initializeClient() {
  const issuer = await Issuer.discover(`http://localhost:${PROVIDER_PORT}`);
  const client = new issuer.Client({
    client_id,
    redirect_uris: [redirect_uri],
    response_types: ['code'],
  });

  app.get('/login', (req, res) => {
    const code_verifier = generators.codeVerifier();
    const code_challenge = generators.codeChallenge(code_verifier);

    // Store the code_verifier in the session
    req.session.code_verifier = code_verifier;

    const url = client.authorizationUrl({
      scope: 'openid',
      response_type: 'code',
      code_challenge,
      code_challenge_method: 'S256',
    });
    res.redirect(url);
  });

  app.get('/callback', async (req, res) => {
    const params = client.callbackParams(req);
    const code_verifier = req.session.code_verifier;

    const tokenSet = await client.callback(redirect_uri, params, { code_verifier });
    res.json(tokenSet);
  });

  app.listen(CLIENT_PORT, () => {
    console.log(`OIDC client listening on port ${CLIENT_PORT}`);
  });
}

initializeClient();
