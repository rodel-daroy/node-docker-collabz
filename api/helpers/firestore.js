const admin = require('firebase-admin');

admin.initializeApp({
  credential: admin.credential.cert({
    "type": "service_account",
    "project_id": "collabz-a9f09",
    "private_key_id": "53fabe85dfa867859818982b954d7fcd12d9c392",
    "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQDX4uNQknEg5nvg\n4RXm2boxrPz3aBQAJI46hOnVF8ZIrgEnMLhOzz4N0yXUL3HlHH4lIGx/hGhJHD/D\nBZeChDWeVtsK2zOZwmzIxxbOKHjEjpOo6ky/dYUcKgakSCrNT4Q58im/sAudCsBs\nYOBrEovygGgM6uhX7ARYH66a1lqtD7VjdTa0F3kmq/+CYjng2WsTE9NJEna9nmcy\nPTE/MuVKldazck7l2+JZaqSPJwTbBbpsGTC8pILPHEDsPgSqjdwxgLOTiFI1YJQ8\ngWdtTtaODN7fsfPDB7oO2RXxh6O/RGoJlsAMFp2khRbS4EEDCEVOtwFW570sA2uB\nZyxQLDkDAgMBAAECggEAHkqAAaCije65B/sdExiOpwSyM9afI8v9Rtm6Y4Nj93Ou\nxrxvx+MNPmxXfPexP+fpDTWI87V02nlDuw3wTchWK6LdNh8+lL7ye5NvsDp+g3nL\n3yIM5bpMFIETEH7tvoP/NhAz6mj9oCnPiQVox61BBKQetV1Kf3emvmSnn6Me8vQk\nmLZad2sdzH0er6Atg5VphuzC4Ro90SwptgC7CgPewM4shStZ1r/Zz07YqNgPQpBJ\nHZDcLeWV9p2G6uHzz8qbFsPNaCeWQ584L204igtDruayRQjLTnwylM6bzfaDnnek\npxWd9BDnx2vbnFtr/OMD11y/ahpXg2U91PCYHmIHaQKBgQD/dWVHrznbjESXxVx8\n8/ub/IlUnrCQ3ujEoi+itJjoCaLEDTSDLn9FKss2ET8CuB0YH/UV/V0AkLB1oXMf\nIFpUcpKnGurMb6qNtpUBhLxdM0lbobwrCnG/lpzq1reD87us6LLn3qip2LShQRdT\nFGTb41GJHJnQQc7mGAc8TmzwOQKBgQDYWAWEQpWBN7bligYcJMjXse8nmcXNjetT\nvm9+5w9Izkege62V+5sD2bw0cNRWMeYt2Ruph6Xx5z3GL6N4X6L9ZmcTuX708cD/\n68qhJN1QlCULWAtLb0GGWaJIA6fIPV0G8GngrWmdGB5+OL0aE83jirMbW9D2tTSH\nWvhCxl/7GwKBgQDrozo9GWDhJ03OQXrCt7uLczKqH4b22ucTGheemb/BqcG93gBm\nUOmMv6CayuW4eGQ98Jx+ICs9bjmXB8nNGGa6JsUn5yhWU1qbRaPEts+ZmMk+AL41\nZXjvJNqxtEWrLZQcNrlwMG6b3Q0hAY2mUNWIDvMS6pLnCwzyKY/jDORn4QKBgHJj\nuCcCfcJhDxe3LxvaZ0eFEYrCx8+z5mXVH2beDTrVtxGn01SmQIR8sAKaVettXuOH\nFBVDX/7T4dnUfn67MpcBeib3waUJ3p5ysiUaNNrSOfQRjYdJQEAlTKT/Kcu6hmGQ\n5KqjhmBFzHm4zmPnbMmPILyqg4ausSOQegv0j/NZAoGBAIFfRGGfyPHkLxVh2sL/\nln0hayhp9prg/o5LE/pNkNkbch4VIaEEPaU1nxBR7T/plzJMyYPJGuumuRCLbsBo\nCVazaTJLAlUB+ffEapR6a/RPxrPfeOhFns5lh+K+A+H4VLHeA0AvLqKtxeG17uCJ\nBR6PnPQI0nHAuTl/btG9YqTg\n-----END PRIVATE KEY-----\n",
    "client_email": "firebase-adminsdk-xbv3a@collabz-a9f09.iam.gserviceaccount.com",
    "client_id": "110805713039214983057",
    "auth_uri": "https://accounts.google.com/o/oauth2/auth",
    "token_uri": "https://oauth2.googleapis.com/token",
    "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
    "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-xbv3a%40collabz-a9f09.iam.gserviceaccount.com"
  })
});

exports.firestore = admin.firestore();
exports.firestoreRef = admin.firestore;

