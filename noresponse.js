const http = require('http');

const port = 8181;

const someJerk = http.createServer((req, res) => {
  console.log('Got a request but I\'m not going to respond...');
});

console.log(`Starting some jerk on port: ${port}`);

someJerk.listen(port);
