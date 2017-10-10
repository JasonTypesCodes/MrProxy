const https = require('https');
const fs = require('fs');

const port = 8484;

const options = {
  key: fs.readFileSync('certs/self-signed-key.pem'),
  passphrase: '1234',
  cert: fs.readFileSync('certs/self-signed-cert.pem')
};

const sslServer = https.createServer(options, (req, res) => {
  res.writeHead(200);
  res.end('Hello TLS World.');
});

console.log(`Starting simple SSL server on port ${port}`);

sslServer.listen(port);
