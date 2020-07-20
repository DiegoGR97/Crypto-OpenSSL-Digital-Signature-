const crypto = require("crypto");
const fs = require("fs");

// ---------- Lectura de llaves pública y privada ----------------
const private_key = fs.readFileSync("certs/private.pem", "utf-8");
const public_key = fs.readFileSync("certs/public.pem", "utf-8");

// ---------- Lectura de documento a firmarse. -------------------
//const message = fs.readFileSync('message.txt', 'utf-8')
const pdf_file = fs.readFileSync(
  "./samplepdfs/SAMPLE PDF FIRMADO.PDF",
  "utf-8"
);
const pdf_file2 = fs.readFileSync(
  "./samplepdfs/SAMPLE PDF FIRMADO 2.PDF",
  "utf-8"
);

// ---------- Creación de objeto de firma en SHA256 ---------------------
// --------- Se especifica documento a cifrarse y algoritmo de cifrado --
const signer = crypto.createSign("sha256");
signer.update(pdf_file);
signer.end();

const signer2 = crypto.createSign("sha256");
signer2.update(pdf_file2);
signer2.end();

// ---------- Creación de firma utilizando la llave privada -------------
const signature = signer.sign(private_key);
const signature_hex = signature.toString("hex");

const signature2 = signer2.sign(private_key);
const signature_hex2 = signature2.toString("hex");

// ---- VERIFICACIÓN DE UNA FIRMA UTILIZANDO LA LLAVE PÚBLICA -----------
// ---- DE QUIEN FIRMÓ Y EL DOCUMENTO AL QUE CORRESPONDE LA FIRMA. ------

// ---- Creación de objeto verificador, especificando algoritmo de ------
// ---- verificación y documento al que corresponde la firma.      ------

const verifier = crypto.createVerify("sha256");
verifier.update(pdf_file);
verifier.end();

// ---- Verificación de firma con la llave pública     -----
// ----         con el objeto verificador.             -----

const verified_pdf_file = verifier.verify(public_key, signature);
//const verified_pdf_file = verifier.verify(public_key, signature2);

console.log(
  JSON.stringify(
    {
      messageLength: pdf_file.length,
      signature: signature_hex,
      verified: verified_pdf_file,
    },
    null,
    2
  )
);

/* CONCLUSIONES:
1. Al verificar una firma de un documento B, usando un documento A, la verificación da resultado negativo.
2. Al verificar una firma de un documento B, exactamente igual a A en contenido pero creados en momentos
diferentes, usando el documento A, la verificación da resultado negativo.
3. Al verificar la firma de un documento B, que es la versión firmada de un documento A, usando el 
documento A, la verificación da resultado negativo.
4. Al verificar la firma de un documento B, que es la versión con una firma adicional del documento A,
usando el documento A, la verificación da como resultado negativo.


*/
