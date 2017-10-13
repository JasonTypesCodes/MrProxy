const fs = require('fs');


function buildConfig() {
  return {
    remoteHost: 'objectcomputing.com',
    remotePort: 443,
    remoteSSL: true,
    remoteTimeout: 12000,

    proxyHost: 'localhost',
    proxyPort: 8282,
    proxySSL: true,
    proxyCert: fs.readFileSync('certs/self-signed-cert.pem'),
    proxyKey: fs.readFileSync('certs/self-signed-key.pem'),
    proxyKeyPassphrase: '1234',
    trustedRemoteCas: [
      fs.readFileSync('certs/DSTRootCAX3.crt')
    ]
  };
}

module.exports = { buildConfig };