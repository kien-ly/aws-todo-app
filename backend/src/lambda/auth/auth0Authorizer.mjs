import Axios from 'axios'
import jsonwebtoken from 'jsonwebtoken'
import { createLogger } from '../../utils/logger.mjs'

const logger = createLogger('auth')

const jwksUrl = 'https://test-endpoint.auth0.com/.well-known/jwks.json'

export async function handler(event) {
  try {
    const jwtToken = await verifyToken(event.authorizationToken)

    return {
      principalId: jwtToken.sub,
      policyDocument: { 
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Allow',
            Resource: '*'
          }
        ]
      }
    }
  } catch (e) {
    logger.error('User not authorized', { error: e.message })

    return {
      principalId: 'user',
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Deny',
            Resource: '*'
          }
        ]
      }
    }
  }
}


async function verifyToken(authHeader) {
  const token = await getToken(authHeader);
  const jwt = jsonwebtoken.decode(token, { complete: true });

  if (!jwt) {
    throw new Error('Invalid token');
  }

  const { kid } = jwt.header;
  const jwks = await Axios.get(jwksUrl);
  const signingKeys = jwks.data.keys.filter(
    key => key.use === 'sig' && key.kid === kid && key.kty === 'RSA' && key.n && key.e
  );

  // if (!signingKeys.length) {
  //   throw new Error('The JWKS endpoint did not contain any signing keys');
  // }

  // const { x5c, n, e } = signingKeys[0];
  // const publicKey = x5c
  //   ? `-----BEGIN CERTIFICATE-----\n${x5c[0]}\n-----END CERTIFICATE-----`
  //   : jsonwebtoken.JWKToPEM({ kty: 'RSA', n, e });

  const publicKey = `-----BEGIN CERTIFICATE-----\nMIIDHTCCAgWgAwIBAgIJMyXjQrS7On73MA0GCSqGSIb3DQEBCwUAMCwxKjAoBgNVBAMTIWRldi12OHJ6djYxOHdwZnRkemtsLnVzLmF1dGgwLmNvbTAeFw0yNDA4MDQwMjUyNDNaFw0zODA0MTMwMjUyNDNaMCwxKjAoBgNVBAMTIWRldi12OHJ6djYxOHdwZnRkemtsLnVzLmF1dGgwLmNvbTCCASIwDQYJKoZIhvcNAQEBBQADggEPADCCAQoCggEBAOddZZaA8QKoHzcVi/bCCT2OFIvQyQg/8DAxyCbxE3xTyo8oCengb93sq9C/cX8+vDZfz/6TYyYVho7KYRv2wIKx+iKwYObWAomdNjupS9/yhD3zPPs+vRaRmG4tW4G3Zvhsd25XT93CehbG88nc1ST1rs7z5nGVuijyvFwVdqiOSA8Z1haByHdYBwakxwuYhMHmy6iTfQVubxE69wdufqDzWBMATslzDxx3yes9+3/pb1nq7FZAOoycCs/Oh87rx3RUZEVRhtfmsAymiFU0TDSJoDXXt1LE8D6vk6PadW1GAqkDoupGHwneEe1LeIpPVGJqHaiSBOH68J8DUyrNefsCAwEAAaNCMEAwDwYDVR0TAQH/BAUwAwEB/zAdBgNVHQ4EFgQU+So01yE8m8DeExF+bynGWfm8uqcwDgYDVR0PAQH/BAQDAgKEMA0GCSqGSIb3DQEBCwUAA4IBAQCUKekMDaFjPVuIMxFyfwD3SiCesOWORrd2KXl6Ffytpn2xBl2PrlXQxqE+upFcNDFI43VYtV2vdBb1pMDfeSMU+QVULGpE6owaG4G7diDqcK4f52U2P/9cyEfsxcpbqgh2s5HtgXI+ckVyWHBJbGTWMYHiu3qSH6WWkH9Glpm55zYBpRzvb2kLhiFJlpYDlrNmtJiRt7JN/OYb2iJjw0esQm5loGodKpu5Eyog6RQL+3PNPappLxsECuaDyXMGY/8ZKDqrpsWoiPKrvoUmngLLdE6FLK4S5yOgfRMXKk/SV8HJDdJrn8L/v76E6rfVHVcrfryGgG2oCu3lQE8C4MRC\n-----END CERTIFICATE-----`;
  return jsonwebtoken.verify(token, publicKey, { algorithms: ['RS256'] });
}


function getToken(authHeader) {
  if (!authHeader) throw new Error('No authentication header')

  if (!authHeader.toLowerCase().startsWith('bearer '))
    throw new Error('Invalid authentication header')

  const split = authHeader.split(' ')
  const token = split[1]
  return token
}
