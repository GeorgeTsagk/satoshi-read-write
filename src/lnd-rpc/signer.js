const fs = require('fs');
const grpc = require('@grpc/grpc-js');
const configLoader = require('../config/config-loader')
const protoLoader = require('@grpc/proto-loader');
const loaderOptions = {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true
};

const config = configLoader.getConfig()

const packageDefinition = protoLoader.loadSync(
  [__dirname + '/protofiles/lightning.proto', __dirname + '/protofiles/signer.proto'],
  loaderOptions
);
const signerrpc = grpc.loadPackageDefinition(packageDefinition).signrpc;
const macaroon = fs.readFileSync(config.lightning?.macaroon_path).toString('hex');
process.env.GRPC_SSL_CIPHER_SUITES = 'HIGH+ECDSA';
const lndCert = fs.readFileSync(config.lightning?.tls_path);
const sslCreds = grpc.credentials.createSsl(lndCert);
const macaroonCreds = grpc.credentials.createFromMetadataGenerator(function (args, callback) {
  let metadata = new grpc.Metadata();
  metadata.add('macaroon', macaroon);
  callback(null, metadata);
});
let creds = grpc.credentials.combineChannelCredentials(sslCreds, macaroonCreds);
let signer = new signerrpc.Signer(config.lightning?.url, creds);

module.exports = {
  signer
}