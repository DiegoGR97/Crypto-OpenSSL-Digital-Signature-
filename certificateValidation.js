const fs = require("fs");
var forge = require("node-forge");
var pki = forge.pki;

/* const rootCA_PEM = fs.readFileSync("./certs/rootCA.pem", "utf-8");
console.log("rootCA_PEM: \n", rootCA_PEM, "\n"); */

const rootCA_PEM = fs.readFileSync(
  "./Certificates/rootCertificate/rootCertificate.pem",
  "utf-8"
);
console.log("rootCA_PEM: \n", rootCA_PEM, "\n");

/* const certificatePEM = fs.readFileSync("./certs/cert.pem", "utf-8");
console.log("certificatePEM: \n", certificatePEM); */

const certificatePEM = fs.readFileSync("./Certificates/01/cert.pem", "utf-8");
console.log("certificatePEM: \n", certificatePEM);

let rootCA = pki.certificateFromPem(rootCA_PEM);
let certificate = pki.certificateFromPem(certificatePEM);

//Se está verificando un certificado emitido con la llave pública de un certificado que lo emitió
//var verified = issuer.verify(issued);

//let verified = rootCA.verify(certificate);
let verified = rootCA.verify(certificate, function (err) {
  if (err) return false;
});

console.log("Certificate validado con la llave pública de rootCA:", verified);
