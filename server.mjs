import { Provider } from 'oidc-provider';
import express from 'express';
import bodyParser from 'body-parser';
import { PROVIDER_PORT,CLIENT_ID,CLIENT_SECRET,REDIRECT_URI } from './constant.js';

const app = express();


const clients = [
  {
    client_id: CLIENT_ID,
    grant_types: ['authorization_code'],
    redirect_uris: [REDIRECT_URI],
  },
];

const oidc = new Provider(`http://localhost:${PROVIDER_PORT}`, {
  clients,
  formats: {
    AccessToken: 'jwt',
  },
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

oidc.listen(PROVIDER_PORT, () => {
  console.log(`OIDC provider listening on port ${PROVIDER_PORT}, Configuration: http://localhost:${PROVIDER_PORT}/.well-known/openid-configuration`);
});
