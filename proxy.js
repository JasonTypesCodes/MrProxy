const { URL } = require('url');

const conf = require('./config.js').buildConfig();
const handleError = require('./default-error-handler.js');
const proxyServerBuilder = require('./proxy-server-builder.js');

const remoteHttp = conf.remoteSSL ? require('https') : require('http');

const TIMEOUT_ERROR = {
  code: 'MRPROXY_TIMEOUT',
  toString: function toString() {
    return 'Call timed out.';
  }
};

function proxyRequestHandler(req, res) {
  console.log('Issuing request... : ' + req.url);

  req.headers['x-forwarded-host'] = req.headers.host;
  req.headers.host = `${conf.remoteHost}:${conf.remotePort}`;
  
  const options = {
    host: conf.remoteHost,
    port: conf.remotePort,
    path: req.url,
    method: req.method,
    headers: req.headers,
    ca: conf.trustedRemoteCas
  };

  const remoteReq = remoteHttp.request(options, (remoteResponse) => {
    console.log('Response received from server... : ' + options.path);
      
      const headers = remoteResponse.headers;

      if(headers.location) {
        const locationUrl = new URL(headers.location);
        locationUrl.hostname = conf.proxyHost;
        locationUrl.port = conf.proxyPort;
        locationUrl.protocol = conf.proxySSL ? 'https:' : 'http:';

        headers.location = locationUrl.toString();
      }

      res.writeHead(
        remoteResponse.statusCode,
        remoteResponse.statusMessage,
        remoteResponse.headers
      );

      remoteResponse.on('data', (chunk) => {
        console.log('Got data from server... : ' + options.path);
        res.write(chunk);
      });

      remoteResponse.on('end', () => {
        console.log('Response from server ended : ' + options.path);
        res.end();
      });
  });

  remoteReq.setTimeout(conf.remoteTimeout, () => {
    handleError(TIMEOUT_ERROR, res);
    remoteReq.abort();
  });
  
  remoteReq.on('error', (error) => {
    handleError(error, res);
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

const proxyServer = proxyServerBuilder(conf, proxyRequestHandler);

console.log(`Starting a proxy for ${conf.remoteHost}:${conf.remotePort} on ${conf.proxyHost}:${conf.proxyPort}`);

proxyServer.listen(conf.proxyPort, conf.proxyHost);
