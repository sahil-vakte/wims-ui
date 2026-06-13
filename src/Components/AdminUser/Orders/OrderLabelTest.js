import ExcelJS from "exceljs";
import QRCode from "qrcode";
import { saveAs } from "file-saver";

const OrderLabelTest = () => {

  const orders = [
  {
    id: 336,
    external_order_id: "WEB235285",
    order_source: "XML",
    order_date: "2026-06-10T10:37:26Z",
    items: [
      { id: 981, sku: "Q54 FLYL", product_name: "Shiny Lycra 4 Way Stretch Material- Flo Yellow Q54 FLYL", quantity: 1 },
      { id: 982, sku: "Q300 YL (NEW)", product_name: "Viscose Cotton Stretch Lycra Fabric- Yellow Q300 YL", quantity: 1 },
      { id: 983, sku: "Q36 YL", product_name: "Soft Touch Stretchy Fabric- Yellow Q36 YL", quantity: 1 },
      { id: 984, sku: "Q35AA BTYL", product_name: 'Cotton Lycra 70" Wide Jersey 4 Way Stretch Fabric- Bright Yellow Q35AA BTYL', quantity: 1 },
    ],
  },
  {
    id: 331,
    external_order_id: "WEB235276",
    order_source: "XML",
    order_date: "2026-06-09T23:20:54Z",
    items: [
      { id: 969, sku: "109T", product_name: "Power Mesh 4 Way Stretch Dressmaking Material- 109T Colour: Turquoise", quantity: 1 },
      { id: 970, sku: "109 P TQ", product_name: "Power Mesh 4 Way Stretch Dressmaking Material- 109 P Colour: Turquoise", quantity: 1 },
      { id: 971, sku: "109T", product_name: "Power Mesh 4 Way Stretch Dressmaking Material- 109T Colour: Purple", quantity: 1 },
      { id: 972, sku: "SQ898 AUB", product_name: "Sequins Beaded Floral Detail Sheer Net Fabric Saree Dress Material SQ898 Colour: Aubergine", quantity: 1 },
      { id: 973, sku: "EM141 DKPPL", product_name: "Sequin Flower Embellishment- Dark Purple EM141 DKPPL", quantity: 1 },
      { id: 974, sku: "TS15 BLBR", product_name: "Beaded Fringe Trimming- Aqua Blue/Brown TS15 BLBR", quantity: 1 },
    ],
  },
  {
    id: 328,
    external_order_id: "WEB235271",
    order_source: "XML",
    order_date: "2026-06-09T22:00:44Z",
    items: [
      { id: 932, sku: "PF PPL", product_name: "Polar Fleece Anti Pill Washable Soft Fabric- Purple PF PPL", quantity: 1 },
      { id: 933, sku: "PF OR", product_name: "Polar Fleece Anti Pill Washable Soft Fabric- Orange PF OR", quantity: 1 },
      { id: 934, sku: "PF MNT", product_name: "Polar Fleece Anti Pill Washable Soft Fabric- Mint PF MNT", quantity: 1 },
      { id: 935, sku: "SQ806 NYMLT", product_name: "Polar Fleece Anti Pill Washable Soft Fabric- Space Astronauts SQ806 NYMLT", quantity: 1 },
      { id: 936, sku: "SQ750 BBL", product_name: "Polar Fleece Anti Pill Washable Soft Fabric- Hearts SQ750 Colour: Baby Blue", quantity: 2 },
      { id: 937, sku: "SQ810 MNTMLT", product_name: "Polar Fleece Anti Pill Washable Soft Fabric- Pandas & Bunnies SQ810 Colour: Mint/Multi", quantity: 2 },
      { id: 938, sku: "SQ810 PNMLT", product_name: "Polar Fleece Anti Pill Washable Soft Fabric- Pandas & Bunnies SQ810 Colour: Pink/ Multi", quantity: 2 },
      { id: 939, sku: "SQ810 BBLMLT", product_name: "Polar Fleece Anti Pill Washable Soft Fabric- Pandas & Bunnies SQ810 Colour: Baby Blue/Multi", quantity: 2 },
      { id: 940, sku: "PF BK", product_name: "Polar Fleece Anti Pill Washable Soft Fabric- Black PF BK", quantity: 2 },
      { id: 941, sku: "SQ524 BKMLT", product_name: "Polar Fleece Anti Pill Washable Soft Fabric- Mini Dinosaurs SQ524 BKMLT", quantity: 2 },
      { id: 942, sku: "PF RD", product_name: "Polar Fleece Anti Pill Washable Soft Fabric- Red PF RD", quantity: 2 },
      { id: 943, sku: "SQ351 PNMLT", product_name: "Polar Fleece Anti Pill Washable Soft Fabric- Twinkle Stars Print- SQ351 Colour: Pink/ Multi", quantity: 3 },
      { id: 944, sku: "SQ351 PPLWHT", product_name: "Polar Fleece Anti Pill Washable Soft Fabric- Twinkle Stars Print- SQ351 Colour: Purple", quantity: 3 },
      { id: 945, sku: "SQ351 ORWHT", product_name: "Polar Fleece Anti Pill Washable Soft Fabric- Twinkle Stars Print- SQ351 Colour: Orange", quantity: 3 },
      { id: 946, sku: "SQ611 PNBL", product_name: "Polar Fleece Anti Pill Washable Soft Fabric- Pink Fishes SQ611 PNBL", quantity: 3 },
      { id: 947, sku: "SQ653 STNMLT", product_name: "Polar Fleece Anti Pill Washable Soft Fabric- Autumn Spice SQ653 STNMLT", quantity: 3 },
      { id: 948, sku: "SQ820 BBL", product_name: "Polar Fleece Anti Pill Washable Soft Fabric- Patch Hearts SQ820 Colour: Baby Blue", quantity: 3 },
      { id: 949, sku: "SQ820 BPN", product_name: "Polar Fleece Anti Pill Washable Soft Fabric- Patch Hearts SQ820 Colour: Baby Pink", quantity: 3 },
      { id: 950, sku: "SQ978 BPN", product_name: "Polar Fleece Anti Pill Washable Soft Fabric- Love Sweethearts SQ978 BPN", quantity: 3 },
      { id: 951, sku: "Q1095 RDBL", product_name: "Polar Fleece Anti Pill Washable Soft Fabric- Red/Blue Tartan Q1095 RDBL", quantity: 3 },
      { id: 952, sku: "Q1381 BGBK", product_name: "Polar Fleece Anti Pill Washable Soft Fabric- Classic Tartan Q1381 BGBK", quantity: 3 },
      { id: 953, sku: "SQ961 BK", product_name: "Polar Fleece Anti Pill Washable Soft Fabric- Celestial Black SQ961 BK", quantity: 3 },
      { id: 954, sku: "Q1127 BLBK", product_name: "Polar Fleece Anti Pill Washable Soft Fabric- Blue/Black/Green Tartan Q1127 BLBK", quantity: 3 },
      { id: 955, sku: "SQ610 TQ", product_name: "Polar Fleece Anti Pill Washable Soft Fabric- Baby Elephants SQ610 Colour: Turquoise Blue", quantity: 3 },
      { id: 956, sku: "SQ801 PN", product_name: "Polar Fleece Anti Pill Washable Soft Fabric- Guinea Pigs SQ801 Colour: Pink", quantity: 4 },
      { id: 957, sku: "SQ962 BPN", product_name: "Polar Fleece Anti Pill Washable Soft Fabric- Watermelons SQ962 BPN", quantity: 4 },
      { id: 958, sku: "SQ755 NYMLT", product_name: "Polar Fleece Anti Pill Washable Soft Fabric- Night Garden SQ755 NYMLT", quantity: 5 },
      { id: 959, sku: "SQ540 BLPN", product_name: "Polar Fleece Anti Pill Washable Soft Fabric- Galaxy SQ540 BLPN", quantity: 6 },
      { id: 960, sku: "SQ351 GRMLT", product_name: "Polar Fleece Anti Pill Washable Soft Fabric- Twinkle Stars Print- SQ351 Colour: Grey/Multi", quantity: 6 },
      { id: 961, sku: "PF BPN", product_name: "Polar Fleece Anti Pill Washable Soft Fabric- Baby Pink PF BPN", quantity: 6 },
    ],
  },
];

  const downloadOrderLabels = async () => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Order Labels");

    worksheet.columns = [
      { header: "QR", key: "qr", width: 70 },
      { header: "SKU", key: "sku", width: 20 },
      { header: "Product Name", key: "product", width: 60 },
      { header: "Qty", key: "qty", width: 10 },
      { header: "External Order ID", key: "externalOrderId", width: 20 },
      { header: "Order ID", key: "orderId", width: 12 },
      { header: "Item ID", key: "itemId", width: 12 },
      { header: "Source", key: "source", width: 15 },
      { header: "Date", key: "date", width: 25 },
    ];

    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).height = 25;



    for (const order of orders) {
  for (const item of order.items) {
    const qrUrl = `https://wims.cloud/employee-user/order-process-item/${order.id}/${item.id}`;

    const row = worksheet.addRow({
      qr: qrUrl,
      sku: item.sku,
      product: item.product_name,
      qty: item.quantity,
      externalOrderId: order.external_order_id,
      orderId: order.id,
      itemId: item.id,
      source: order.order_source,
      date: new Date(order.order_date).toLocaleString(),
    });

    row.height = 35;
  }
}

    worksheet.eachRow((row) => {
      row.eachCell((cell) => {
        cell.alignment = {
          vertical: "middle",
          horizontal: "center",
          wrapText: true,
        };

        cell.border = {
          top: { style: "thin" },
          left: { style: "thin" },
          bottom: { style: "thin" },
          right: { style: "thin" },
        };
      });
    });

    const buffer = await workbook.xlsx.writeBuffer();

    saveAs(
      new Blob([buffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      }),
      `Order_Labels_${Date.now()}.xlsx`
    );
  };

  return (
    <button type="button" onClick={downloadOrderLabels}>
      Download Order Labels
    </button>
  );
};

export default OrderLabelTest;