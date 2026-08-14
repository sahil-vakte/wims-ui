import qz from "qz-tray";

class PrinterService {
  async connect() {
    if (!qz.websocket.isActive()) {
      await qz.websocket.connect();
    }
  }

  async getPrinters() {
    await this.connect();
    return await qz.printers.find();
  }

  async printPdf(pdfUrl, printerName) {
    try {
      await this.connect();

      const config = qz.configs.create(printerName, {
        copies: 1,

        // change these according to your label
        size: {
          width: 4,
          height: 6
        },

        units: "in",

        margins: 0,

        orientation: "portrait",

        scaleContent: true,

        rasterize: true
      });

      const data = [
        {
          type: "pixel",
          format: "pdf",
          flavor: "file",
          data: pdfUrl
        }
      ];

      await qz.print(config, data);

      return {
        success: true
      };
    } catch (error) {
      console.error("Printing failed:", error);

      return {
        success: false,
        error: error.message
      };
    }
  }
}

export default new PrinterService();