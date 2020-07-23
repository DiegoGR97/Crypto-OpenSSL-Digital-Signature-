const fs = require("fs");
var forge = require("node-forge");
var pki = forge.pki;

let rootCertificateCertAndKeyPairExist = true;
let tempDir = "./Certificates";
if (!fs.existsSync(tempDir)) {
  console.log("No existe el folder ./Certificates");
  rootCertificateCertAndKeyPairExist = false;
  //fs.mkdirSync(tempDir);
}

let rootPrivateKey = "";
let rootCertificate = "";
if (!fs.existsSync("./Certificates/rootCertificate/rootCertificate.pem")) {
  console.log("No existe ./Certificates/rootCertificate/rootCertificate.pem.");
  rootCertificateCertAndKeyPairExist = false;
} else {
  const rootCertificatePEM = fs.readFileSync(
    "./Certificates/rootCertificate/rootCertificate.pem",
    "utf-8"
  );
  console.log("rootCertificatePEM: \n", rootCertificatePEM, "\n");
  rootCertificate = pki.certificateFromPem(rootCertificatePEM);
}

if (!fs.existsSync("./Certificates/rootCertificate/privateKey.pem")) {
  console.log("No existe ./Certificates/rootCertificate/privateKey.pem");
  rootCertificateCertAndKeyPairExist = false;
} else {
  const rootPrivateKeyPEM = fs.readFileSync(
    "./Certificates/rootCertificate/privateKey.pem",
    "utf-8"
  );

  console.log("rootPrivateKeyPEM: \n", rootPrivateKeyPEM);
  rootPrivateKey = pki.privateKeyFromPem(rootPrivateKeyPEM);
}

if (rootCertificateCertAndKeyPairExist) {
  // generate a keypair or use one you have already
  var keys = pki.rsa.generateKeyPair(2048);

  // create a new certificate
  var cert = pki.createCertificate();

  // fill the required fields
  cert.publicKey = keys.publicKey;
  let pemPublicKey = pki.publicKeyToPem(cert.publicKey);
  let pemPrivateKey = pki.privateKeyToPem(keys.privateKey);

  let serialNumber = "0001";
  let certificateRoute = tempDir + "/" + serialNumber;
  // console.log("certificateRoute:", certificateRoute);

  let serialNumberDetermined = false;

  while (serialNumberDetermined === false) {
    if (!fs.existsSync(certificateRoute)) {
      //fs.mkdirSync(certificateRoute);
      serialNumberDetermined = true;
    } else {
      serialNumber = Number(serialNumber) + 1;
      serialNumber = serialNumber.toString();
      switch (serialNumber.length) {
        case 1:
          serialNumber = "000" + serialNumber;
          console.log("new serialNumber:", serialNumber);
          break;
        case 2:
          serialNumber = "00" + serialNumber;
          console.log("new serialNumber:", serialNumber);
          break;
        case 3:
          serialNumber = "0" + serialNumber;
          console.log("new serialNumber:", serialNumber);
          break;
        case 4:
          console.log("new serialNumber:", serialNumber);
          break;

        default:
        // code block
      }
      certificateRoute = tempDir + "/" + serialNumber;
    }
  }

  cert.serialNumber = serialNumber;
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

  //console.log("Certificate on pem format: \n", pemCertificate);
  //console.log("pemPrivateKey: \n", pemPrivateKey);
  //console.log("pemPublicKey: \n", pemPublicKey);

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

    if (!fs.existsSync(certificateRoute)) {
      fs.mkdirSync(certificateRoute);
    }

    fs.writeFile(certificateRoute + "/cert.pem", pemCertificate, function (
      err
    ) {
      if (err) throw err;
      console.log(
        "cert.pem succesfully done writing on " +
          certificateRoute +
          "/cert.pem."
      );
    });

    fs.writeFile(certificateRoute + "/privateKey.pem", pemPrivateKey, function (
      err
    ) {
      if (err) throw err;
      console.log(
        "privateKey.pem succesfully done writing on " +
          certificateRoute +
          "/privateKey.pem."
      );
    });

    fs.writeFile(certificateRoute + "/publicKey.pem", pemPublicKey, function (
      err
    ) {
      if (err) throw err;
      console.log(
        "publicKey.pem succesfully done writing on " +
          certificateRoute +
          "/publicKey.pem."
      );
    });
  } else {
    console.log(
      "No se ha escrito el certificado ni sus llaves en el directorio porque" +
        " no pudo ser verificado con el Root Certificate."
    );
  }
} else {
  console.log(
    "No se pudo crear el nuevo certificado debido a que no se ha ubicado un certificado root."
  );
}
