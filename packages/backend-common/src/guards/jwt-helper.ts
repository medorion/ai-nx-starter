import jwt from 'jsonwebtoken';
import jwksClient from 'jwks-rsa';

export class JwtHelper {
  private static readonly client = jwksClient({
    jwksUri: `https://${process.env['AUTH0_DOMAIN']}/.well-known/jwks.json`,
  });

  private static getKey(header: jwt.JwtHeader, callback: jwt.SigningKeyCallback) {
    JwtHelper.client.getSigningKey(header.kid!, function (err: Error | null, key?: jwksClient.SigningKey) {
      const signingKey = key?.getPublicKey();
      callback(null, signingKey);
    });
  }

  public static verifyToken(token: string): Promise<any> {
    return new Promise((resolve, reject) => {
      // Format the issuer URL correctly - Auth0 uses https://{domain}/ as issuer
      const issuer = `https://${process.env['AUTH0_DOMAIN']}/`;

      jwt.verify(
        token,
        JwtHelper.getKey,
        {
          audience: `https://${process.env['AUTH0_MANAGEMENT_DOMAIN']}/api/v2/`,
          issuer: issuer,
          algorithms: ['RS256'],
          // Ensure complete token is returned with all custom claims
          complete: false,
        },
        (err: jwt.VerifyErrors | null, decoded?: jwt.JwtPayload | string) => {
          if (err) {
            return reject(err);
          }
          resolve(decoded);
        },
      );
    });
  }
}
