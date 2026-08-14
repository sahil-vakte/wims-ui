// import qz from "qz-tray";

// class PrinterService {
//   async connect() {
//     if (!qz.websocket.isActive()) {
//       await qz.websocket.connect();
//     }
//   }

//   async getPrinters() {
//     await this.connect();
//     return await qz.printers.find();
//   }

//   async printPdf(pdfUrl, printerName) {
//     try {
//       await this.connect();

//       const config = qz.configs.create(printerName, {
//         copies: 1,

//         // change these according to your label
//         size: {
//           width: 4,
//           height: 6
//         },

//         units: "in",

//         margins: 0,

//         orientation: "portrait",

//         scaleContent: true,

//         rasterize: true
//       });

//       const data = [
//         {
//           type: "pixel",
//           format: "pdf",
//           flavor: "file",
//           data: pdfUrl
//         }
//       ];

//       await qz.print(config, data);

//       return {
//         success: true
//       };
//     } catch (error) {
//       console.error("Printing failed:", error);

//       return {
//         success: false,
//         error: error.message
//       };
//     }
//   }
// }

// export default new PrinterService();



import qz from "qz-tray";

import certificateText from "./digital-certificate.txt";
import privateKeyText from "./private-key.pem";

class PrinterService {
  initialized = false;

  selectedPrinter = null;

  // ---------------------------------------------------------
  // READ LOCAL TEXT FILE
  // ---------------------------------------------------------

  async loadTextFile(fileUrl) {
    const response = await fetch(fileUrl);

    if (!response.ok) {
      throw new Error(
        `Unable to load local QZ security file: ${response.status}`
      );
    }

    return await response.text();
  }

  // ---------------------------------------------------------
  // CONVERT PEM PRIVATE KEY
  // ---------------------------------------------------------

  pemToArrayBuffer(pem) {
    const cleaned = pem
      .replace(/-----BEGIN PRIVATE KEY-----/g, "")
      .replace(/-----END PRIVATE KEY-----/g, "")
      .replace(/\s/g, "");

    const binary = window.atob(cleaned);

    const bytes = new Uint8Array(binary.length);

    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }

    return bytes.buffer;
  }

  // ---------------------------------------------------------
  // SIGN QZ REQUEST
  // ---------------------------------------------------------

  async signMessage(message, privateKeyPem) {
    const privateKeyBuffer =
      this.pemToArrayBuffer(privateKeyPem);

    const cryptoKey =
      await window.crypto.subtle.importKey(
        "pkcs8",
        privateKeyBuffer,
        {
          name: "RSASSA-PKCS1-v1_5",
          hash: "SHA-512"
        },
        false,
        ["sign"]
      );

    const encodedMessage =
      new TextEncoder().encode(message);

    const signature =
      await window.crypto.subtle.sign(
        "RSASSA-PKCS1-v1_5",
        cryptoKey,
        encodedMessage
      );

    const bytes = new Uint8Array(signature);

    let binary = "";

    bytes.forEach((byte) => {
      binary += String.fromCharCode(byte);
    });

    return window.btoa(binary);
  }

  // ---------------------------------------------------------
  // INITIALIZE QZ SECURITY
  // ---------------------------------------------------------

  async initializeSecurity() {
    if (this.initialized) {
      return;
    }

    const certificate =
      await this.loadTextFile(certificateText);

    const privateKey =
      await this.loadTextFile(privateKeyText);

    qz.security.setCertificatePromise(
      (resolve, reject) => {
        try {
          resolve(certificate);
        } catch (error) {
          reject(error);
        }
      }
    );

    qz.security.setSignatureAlgorithm(
      "SHA512"
    );

    qz.security.setSignaturePromise(
      (toSign) => {
        return async (
          resolve,
          reject
        ) => {
          try {
            const signature =
              await this.signMessage(
                toSign,
                privateKey
              );

            resolve(signature);
          } catch (error) {
            console.error(
              "QZ signing error:",
              error
            );

            reject(error);
          }
        };
      }
    );

    this.initialized = true;
  }

  // ---------------------------------------------------------
  // CONNECT TO QZ
  // ---------------------------------------------------------

  async connect() {
    await this.initializeSecurity();

    if (
      qz.websocket.isActive()
    ) {
      return true;
    }

    try {
      await qz.websocket.connect({
        host: [
          "localhost",
          "localhost.qz.io"
        ],

        retries: 3,

        delay: 1
      });

      console.log(
        "QZ Tray connected",
        qz.websocket.getConnectionInfo()
      );

      return true;
    } catch (error) {
      console.error(
        "QZ connection failed:",
        error
      );

      throw new Error(
        "Unable to connect to QZ Tray. Make sure QZ Tray is running."
      );
    }
  }

  // ---------------------------------------------------------
  // GET ALL PRINTERS
  // ---------------------------------------------------------

  async getPrinters() {
    await this.connect();

    const printers =
      await qz.printers.find();

    console.log(
      "Available printers:",
      printers
    );

    return printers;
  }

  // ---------------------------------------------------------
  // FIND TSC PRINTER
  // ---------------------------------------------------------

  async findTscPrinter() {
    if (this.selectedPrinter) {
      return this.selectedPrinter;
    }

    const printers =
      await this.getPrinters();

    const tscPrinters =
      printers.filter(
        (printerName) => {
          const name =
            printerName.toLowerCase();

          return (
            name.includes("tsc") ||
            name.includes("da210") ||
            name.includes("da220") ||
            name.includes("da310") ||
            name.includes("da320")
          );
        }
      );

    if (
      tscPrinters.length === 0
    ) {
      throw new Error(
        `TSC printer not found.

Installed printers:

${printers.join("\n")}`
      );
    }

    this.selectedPrinter =
      tscPrinters[0];

    console.log(
      "Selected TSC printer:",
      this.selectedPrinter
    );

    return this.selectedPrinter;
  }

  // ---------------------------------------------------------
  // PRINT PDF
  // ---------------------------------------------------------

  async printPdf({
    pdfUrl,
    printerName = null,
    width = 4,
    height = 6,
    copies = 1
  }) {
    try {
      await this.connect();

      const printer =
        printerName ||
        (await this.findTscPrinter());

      console.log(
        "Printing PDF using:",
        printer
      );

      const config =
        qz.configs.create(
          printer,
          {
            copies,

            units: "in",

            size: {
              width,
              height
            },

            margins: 0,

            orientation:
              "portrait",

            scaleContent: true,

            rasterize: true,

            colorType:
              "blackwhite"
          }
        );

      const printData = [
        {
          type: "pixel",

          format: "pdf",

          flavor: "file",

          data: pdfUrl
        }
      ];

      await qz.print(
        config,
        printData
      );

      console.log(
        "Print request completed"
      );

      return {
        success: true,
        printer
      };
    } catch (error) {
      console.error(
        "PDF printing failed:",
        error
      );

      return {
        success: false,

        error:
          error?.message ||
          "Unable to print PDF"
      };
    }
  }

  // ---------------------------------------------------------
  // TEST PRINTER
  // ---------------------------------------------------------

  async testPrinter() {
    await this.connect();

    return await this.findTscPrinter();
  }

  // ---------------------------------------------------------
  // DISCONNECT
  // ---------------------------------------------------------

  async disconnect() {
    if (
      qz.websocket.isActive()
    ) {
      await qz.websocket.disconnect();
    }

    this.selectedPrinter =
      null;
  }
}

const printerService =
  new PrinterService();

export default printerService;