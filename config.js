const fs = require('fs');


function buildConfig() {
  return {
    remoteHost: 'localhost',
    remotePort: 8181,
    remoteSSL: false,
    remoteTimeout: 12000,

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