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

cert.serialNumber = "02";
cert.validity.notBefore = new Date();
cert.validity.notAfter = new Date();
cert.validity.notAfter.setFullYear(cert.validity.notBefore.getFullYear() + 1);

var attrs = [
  {
    name: "commonName",
    value: "Child Certificate",
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

const rootCertificatePEM = fs.readFileSync(
  "./Certificates/rootCertificate/rootCertificate.pem",
  "utf-8"
);
console.log("rootCertificatePEM: \n", rootCertificatePEM, "\n");

let rootCertificate = pki.certificateFromPem(rootCertificatePEM);

const rootPrivateKeyPEM = fs.readFileSync(
  "./Certificates/rootCertificate/privateKey.pem",
  "utf-8"
);

console.log("rootPrivateKeyPEM: \n", rootPrivateKeyPEM);
let rootPrivateKey = pki.privateKeyFromPem(rootPrivateKeyPEM);

cert.setSubject(attrs);

/* console.log(
  "rootCertificate.subject.attributes:",
  rootCertificate.subject.attributes
); */

cert.setIssuer(rootCertificate.subject.attributes);
//cert.setIssuer(attrs);

// the actual certificate signing
cert.sign(rootPrivateKey);

// now convert the Forge certificate to PEM format
var pemCertificate = pki.certificateToPem(cert);

console.log("Certificate on pem format: \n", pemCertificate);
console.log("pemPrivateKey: \n", pemPrivateKey);
console.log("pemPublicKey: \n", pemPublicKey);

let verified;
try {
  //Cambiar cert por rootCertificate y viceversa para probar el rechazo de una validación.
  verified = rootCertificate.verify(cert, function (err) {
    if (err) return err;
  });
} catch {
  console.log("No ha podido ser verificado el certificado.");
  verified = false;
}

console.log(
  "Certificado root ha verificado con su propia llave pública al certificado hijo:",
  verified
);

if (verified) {
  let tempDir = "./Certificates";
  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir);
  }

  let tempDir2 = "./Certificates/01/";

  if (!fs.existsSync(tempDir2)) {
    fs.mkdirSync(tempDir2);
  }

  fs.writeFile("./Certificates/01/cert.pem", pemCertificate, function (err) {
    if (err) throw err;
    console.log("cert.pem succesfully done writing.");
  });

  fs.writeFile("./Certificates/01/privateKey.pem", pemPrivateKey, function (
    err
  ) {
    if (err) throw err;
    console.log("privateKey.pem succesfully done writing.");
  });

  fs.writeFile("./Certificates/01/publicKey.pem", pemPublicKey, function (err) {
    if (err) throw err;
    console.log("publicKey.pem succesfully done writing.");
  });
} else {
  console.log(
    "No se ha escrito el certificado ni sus llaves en el directorio porque" +
      " no pudo ser verificado con el Root Certificate."
  );
}
