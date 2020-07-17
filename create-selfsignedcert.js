var forge = require("node-forge");
var pki = forge.pki;

// generate a keypair or use one you have already
var keys = pki.rsa.generateKeyPair(2048);

// create a new certificate
var cert = pki.createCertificate();

// fill the required fields
cert.publicKey = keys.publicKey;
let pemPublicKey = pki.publicKeyToPem(cert.publicKey);
let pemPrivateKey = pki.privateKeyToPem(keys.privateKey);

cert.serialNumber = "01";
cert.validity.notBefore = new Date();
cert.validity.notAfter = new Date();
cert.validity.notAfter.setFullYear(cert.validity.notBefore.getFullYear() + 1);

// use your own attributes here, or supply a csr (check the docs)
var attrs = [
  {
    name: "commonName",
    value: "example.org",
  },
  {
    name: "countryName",
    value: "US",
  },
  {
    shortName: "ST",
    value: "Virginia",
  },
  {
    name: "localityName",
    value: "Blacksburg",
  },
  {
    name: "organizationName",
    value: "Test",
  },
  {
    shortName: "OU",
    value: "Test",
  },
];

// here we set subject and issuer as the same one
cert.setSubject(attrs);
cert.setIssuer(attrs);

// the actual certificate signing
cert.sign(keys.privateKey);

// now convert the Forge certificate to PEM format
var pemCertificate = pki.certificateToPem(cert);
console.log("Certificate on pem format: \n", pemCertificate);
console.log("pemPrivateKey: \n", pemPrivateKey);
console.log("pemPublicKey: \n", pemPublicKey);
