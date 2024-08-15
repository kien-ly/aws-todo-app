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

  const publicKey = `-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA7VpF9zYzwNztZ3HL/5uo
hn7vRcSdrMo6ZrRR7nH5uG+f3P7w7TbQGbk9XNRCafPhLxW8fRUEYfbo9Rb+UGMl
kHJjEB5v/Y6XPQu0GJdOEJodWhL+PmeADoY+7BLnFTxLgCBX1Zz1S2uWVezgZtm7
MEbMg5EcHQyFZRLgjsTWFi+BfnPpFo6kUiwR14kFPOQzduQ1nXnL5OXz+I6Ba8vg
Z7tY36Bu+gXVFHYxxkFepco/bsUC9RzBhPTHHq7lmkflL/+A7DgdpMk8jbFxz/oE
YZweGKhhn5ZK5XtTOsPyqrcFRH2sbGfL4GeT+4Wq5o3g9/xXkxUdWkmwIDAQAB
-----END PUBLIC KEY-----`;

  
  return jsonwebtoken.verify(token, publicKey, { algorithms: ['RS256'] });


function getToken(authHeader) {
  if (!authHeader) throw new Error('No authentication header')

  if (!authHeader.toLowerCase().startsWith('bearer '))
    throw new Error('Invalid authentication header')

  const split = authHeader.split(' ')
  const token = split[1]
  return token
}
