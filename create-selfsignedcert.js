const fs = require("fs");
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
/* var attrs = [
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
]; */

var attrs = [
  {
    name: "commonName",
    value: "Root Certificate",
  },
  {
    name: "countryName",
    value: "GT",
  },
  {
    shortName: "ST",
    value: "Guatemala City",
  },
  {
    name: "localityName",
    value: "Guatemala",
  },
  {
    name: "organizationName",
    value: "Tribunal Supremo Electoral",
  },
  {
    shortName: "OU",
    value: "Tribunal Supremo Electoral",
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

let tempDir = "./Certificates";
if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir);
}

let tempDir2 = "./Certificates/rootCertificate/";

if (!fs.existsSync(tempDir2)) {
  fs.mkdirSync(tempDir2);
}

fs.writeFile(
  "./Certificates/rootCertificate/rootCertificate.pem",
  pemCertificate,
  function (err) {
    if (err) throw err;
    console.log("rootCertificate.pem succesfully done writing.");
  }
);

fs.writeFile(
  "./Certificates/rootCertificate/privateKey.pem",
  pemPrivateKey,
  function (err) {
    if (err) throw err;
    console.log("privateKey.pem succesfully done writing.");
  }
);

fs.writeFile(
  "./Certificates/rootCertificate/publicKey.pem",
  pemPublicKey,
  function (err) {
    if (err) throw err;
    console.log("publicKey.pem succesfully done writing.");
  }
);

let readingCertificate = pki.certificateFromPem(pemCertificate);
/* console.log("readingCertificate:", readingCertificate);
console.log("readingCertificate.signature:", readingCertificate.signature);
console.log("readingCertificate.publicKey:", readingCertificate.publicKey);
console.log(
  "readingCertificate.issuer.attributes:",
  readingCertificate.issuer.attributes
);
console.log(
  "readingCertificate.subject.attributes:",
  readingCertificate.subject.attributes
); */

//Yo considero que lo que está ocurriendo acá es que se está firmando
//un certificado emitido con la firma de un certificado que lo emite.
// verifies an issued certificate using the certificates public key
//var verified = issuer.verify(issued);

let verified = readingCertificate.verify(readingCertificate);
console.log(
  "Certificado self-signed verificado con su propia llave pública:",
  verified
);

//console.log("readingCertificate:", readingCertificate.subject.attributes);
