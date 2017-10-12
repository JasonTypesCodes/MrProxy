
const ERROR_RESPONSES = {
  500: 'Internal Server Error',
  502: 'Bad Gateway',
  504: 'Gateway Timeout',
  526: 'Invalid Remote SSL Certificate'
};

const ERROR_CODE_MAP = {
  ECONNRESET: 502,
  ECONNREFUSED: 502,
  ETIMEDOUT: 504,
  MRPROXY_TIMEOUT: 504,
  DEPTH_ZERO_SELF_SIGNED_CERT: 526,
  UNABLE_TO_GET_ISSUER_CERT_LOCALLY: 526
};

const DEFAULT_ERROR_STATUS = 500;
const TIMEOUT_STATUS = 504;

function handleError(error, response) {
  console.log('A remote error occurred! : ' + error + ' :: ' + error.code);
  
  const responseStatus = ERROR_CODE_MAP[error.code] ? ERROR_CODE_MAP[error.code] : DEFAULT_ERROR_STATUS;
  response.writeHead(responseStatus, ERROR_RESPONSES[responseStatus]);
  response.end(error.code + ' :: ' + error);
}

module.exports = handleError;