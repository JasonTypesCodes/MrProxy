const http = require('http');
const https = require('https');
const fs = require('fs');

const remoteHost = 'jason.types.codes';
const remotePort = 80;
const remoteSSL = false;
const remoteTimeout = 12000;

const proxyPort = 8282;
const proxySSL = true;
const proxyCert = fs.readFileSync('certs/self-signed-cert.pem');
const proxyKey = fs.readFileSync('certs/self-signed-key.pem');
const proxyKeyPassphrase = '1234';

const trustedRemoteCas = [
  fs.readFileSync('certs/self-signed-cert.pem')
];

const remoteHttp = remoteSSL ? https : http;
const proxyHttp = proxySSL ? https : http;

const ERROR_RESPONSES = {
  500: 'Internal Server Error',
  502: 'Bad Gateway',
  504: 'Gateway Timeout',
  526: 'Invalid Remote SSL Certificate'
};

const ERROR_CODE_MAP = {
  ECONNRESET: 502,
  ECONNREFUSED: 502,
  DEPTH_ZERO_SELF_SIGNED_CERT: 526,
  UNABLE_TO_GET_ISSUER_CERT_LOCALLY: 526
};

const DEFAULT_ERROR_STATUS = 500;
const TIMEOUT_STATUS = 504;

function proxyRequestHandler(req, res) {
  console.log('Issuing request... : ' + req.url);

  req.headers.host = `${remoteHost}:${remotePort}`;
  
  const options = {
    host: remoteHost,
    port: remotePort,
    path: req.url,
    method: req.method,
    headers: req.headers,
    ca: trustedRemoteCas
  };

  const remoteReq = remoteHttp.request(options, (responseFromServer) => {
    console.log('Response received from server... : ' + options.path);
      res.writeHead(
        responseFromServer.statusCode,
        responseFromServer.statusMessage,
        responseFromServer.headers
      );

      responseFromServer.on('data', (chunk) => {
        console.log('Got data from server... : ' + options.path);
        res.write(chunk);
      });

      responseFromServer.on('end', () => {
        console.log('Response from server ended : ' + options.path);
        res.end();
      });
  });

  remoteReq.setTimeout(remoteTimeout, () => {
    console.log('looks like we timed out...');
    res.writeHead(TIMEOUT_STATUS, ERROR_RESPONSES[TIMEOUT_STATUS]);
    res.end();
    remoteReq.abort();
  });
  
  remoteReq.on('error', (error) => {
    console.log('A remote error occurred! : ' + error + ' :: ' + error.code);
    
    const responseStatus = ERROR_CODE_MAP[error.code] ? ERROR_CODE_MAP[error.code] : DEFAULT_ERROR_STATUS;
    res.writeHead(responseStatus, ERROR_RESPONSES[responseStatus]);
    res.end(error.code + ' :: ' + error);
  });

  req.on('end', () => {
    console.log('End from initial request called.. : ' + options.path);
    remoteReq.end();
  });

  req.on('data', (chunk) => {
    console.log('Got data from request... : ' + options.path);
    remoteReq.write(chunk);
  });
}

const sslServerOptions = {
  key: proxyKey,
  passphrase: proxyKeyPassphrase,
  cert: proxyCert
};

const proxyServer = proxySSL ? proxyHttp.createServer(sslServerOptions, proxyRequestHandler) : proxyHttp.createServer(proxyRequestHandler);

console.log(`Starting a proxy for ${remoteHost}:${remotePort} on port ${proxyPort}`);

proxyServer.listen(proxyPort);
