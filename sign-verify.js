const crypto = require("crypto");
const fs = require("fs");

// ---------- Lectura de llaves pública y privada ----------------
const private_key = fs.readFileSync(
  "./Certificates/rootCertificate/privateKey.pem",
  "utf-8"
);
const public_key = fs.readFileSync(
  "./Certificates/rootCertificate/publicKey.pem",
  "utf-8"
);

// ---------- Lectura de documento a firmarse. -------------------
//const pdf = fs.readFileSync('pdf.txt', 'utf-8')
const pdf = fs.readFileSync("./samplepdfs/SAMPLE PDF.PDF", "utf-8");
const pdf_hex = pdf.toString("hex");
//console.log("pdf_hex:", pdf_hex);

// ---------- Creación de objeto de firma en SHA256 ---------------------
// --------- Se especifica documento a cifrarse y algoritmo de cifrado --
const signer = crypto.createSign("sha256");
signer.update(pdf);
signer.end();

// ---------- Creación de firma utilizando la llave privada -------------
const signature = signer.sign(private_key);
const signature_hex = signature.toString("hex");

// ---- VERIFICACIÓN DE UNA FIRMA UTILIZANDO LA LLAVE PÚBLICA -----------
// ---- DE QUIEN FIRMÓ Y EL DOCUMENTO AL QUE CORRESPONDE LA FIRMA. ------

// ---- Creación de objeto verificador, especificando algoritmo de ------
// ---- verificación y documento al que corresponde la firma.      ------

const verifier = crypto.createVerify("sha256");
verifier.update(pdf);
verifier.end();

// ---- Verificación de firma con la llave pública     -----
// ----         con el objeto verificador.             -----
const verified = verifier.verify(public_key, signature);

console.log(
  JSON.stringify(
    {
      pdf: pdf,
      signature: signature_hex,
      verified: verified,
    },
    null,
    2
  )
);
