
function buildProxyServer(config, requestHandler) {
  if (config.proxySSL) {
    const https = require('https');

    const sslServerOptions = {
      key: config.proxyKey,
      passphrase: config.proxyKeyPassphrase,
      cert: config.proxyCert
    };

    return https.createServer(sslServerOptions, requestHandler);

  } else {
    const http = require('http');

    return http.createServer(requestHandler);
  }
}

module.exports = buildProxyServer;