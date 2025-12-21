import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";

export function generateGRNPDF(po, grnNumber) {
  return new Promise((resolve, reject) => {
    const pdfDir = path.join(process.cwd(), "uploads", "grn_pdfs");
    if (!fs.existsSync(pdfDir)) fs.mkdirSync(pdfDir, { recursive: true });

    const filePath = path.join(pdfDir, `${grnNumber}.pdf`);

    const doc = new PDFDocument({
      size: "A4",
      margin: 50,
      bufferPages: true,
    });

    const stream = fs.createWriteStream(filePath);
    doc.pipe(stream);

    const pageWidth =
      doc.page.width - doc.page.margins.left - doc.page.margins.right;
    const left = doc.page.margins.left;
    const pageHeight = doc.page.height;
    const bottomMargin = doc.page.margins.bottom;

    const generatedDate = new Date().toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    /* =========================
       PAGE HEADER
    ========================= */
    doc
      .font("Helvetica-Bold")
      .fontSize(20)
      .fillColor("#000")
      .text("GOODS RECEIVED NOTE", left, 50, {
        align: "center",
        width: pageWidth,
      });

    doc
      .font("Helvetica")
      .fontSize(12)
      .fillColor("#333")
      .text("Fixed Asset Registry System", left, 75, {
        align: "center",
        width: pageWidth,
      });

    doc.fontSize(10).fillColor("#666").text("Colombo, Sri Lanka", left, 92, {
      align: "center",
      width: pageWidth,
    });

    doc
      .fontSize(9)
      .fillColor("#666")
      .text(`Generated on: ${generatedDate}`, left, 108, {
        align: "center",
        width: pageWidth,
      });

    /* =========================
       GRN META (RIGHT ALIGNED)
    ========================= */
    doc.moveDown(2);

    doc.font("Helvetica").fontSize(11).fillColor("#000");

    doc.text(`GRN Number: ${grnNumber}`, left, doc.y, {
      width: pageWidth,
      align: "right",
    });

    doc.text(`PO Number: ${po.po_number}`, left, doc.y + 4, {
      width: pageWidth,
      align: "right",
    });

    doc.text(`Received Date: ${generatedDate}`, left, doc.y + 4, {
      width: pageWidth,
      align: "right",
    });

    doc.moveDown(2);

    /* =========================
       VENDOR INFORMATION
    ========================= */
    doc.font("Helvetica-Bold").fontSize(14).text("Vendor Information");
    doc.moveDown(0.5);

    const vendorTop = doc.y;
    const vendorHeight = 70;

    doc
      .rect(left, vendorTop, pageWidth, vendorHeight)
      .strokeColor("#ccc")
      .stroke();

    doc.font("Helvetica").fontSize(11).fillColor("#000");

    doc.text(`Vendor Name: ${po.vendor_name}`, left + 12, vendorTop + 12);
    doc.text(`Vendor Email: ${po.vendor_email}`, left + 12, vendorTop + 32);

    doc.y = vendorTop + vendorHeight + 20;

    /* =========================
       RECEIVED ITEMS TABLE
    ========================= */
    doc.font("Helvetica-Bold").fontSize(14).text("Received Items");
    doc.moveDown(0.8);

    /* Column system (matches PO philosophy) */
    const col = {
      asset: { x: left, width: 260 },
      qty: { x: left + 260, width: 60 },
      condition: { x: left + 320, width: 175 },
    };

    const tableTop = doc.y;
    const rowHeight = 24;

    /* Table Header */
    doc
      .rect(left, tableTop, pageWidth, rowHeight)
      .fillAndStroke("#4a5568", "#4a5568");

    doc.font("Helvetica-Bold").fontSize(10).fillColor("#fff");

    doc.text("Asset", col.asset.x + 8, tableTop + 8, {
      width: col.asset.width - 16,
    });

    doc.text("Qty", col.qty.x + 8, tableTop + 8, {
      width: col.qty.width - 16,
      align: "center",
    });

    doc.text("Condition", col.condition.x + 8, tableTop + 8, {
      width: col.condition.width - 16,
    });

    /* Table Row */
    const rowTop = tableTop + rowHeight;

    doc.rect(left, rowTop, pageWidth, rowHeight).strokeColor("#ddd").stroke();

    doc.font("Helvetica").fontSize(11).fillColor("#000");

    doc.text(po.asset_name, col.asset.x + 8, rowTop + 7, {
      width: col.asset.width - 16,
      ellipsis: true,
    });

    doc.text(String(po.quantity), col.qty.x + 8, rowTop + 7, {
      width: col.qty.width - 16,
      align: "center",
    });

    doc.text("Good", col.condition.x + 8, rowTop + 7, {
      width: col.condition.width - 16,
    });

    doc.y = rowTop + rowHeight + 30;

    /* =========================
       FOOTER
    ========================= */
    const footerY = pageHeight - bottomMargin - 30;

    doc
      .moveTo(left, footerY - 10)
      .lineTo(left + pageWidth, footerY - 10)
      .strokeColor("#ddd")
      .stroke();

    doc
      .fontSize(8)
      .font("Helvetica-Oblique")
      .fillColor("#888")
      .text(
        "This is a system-generated Goods Received Note and does not require a physical signature.",
        left,
        footerY,
        { width: pageWidth, align: "center" }
      );

    doc.end();

    stream.on("finish", () => resolve(filePath));
    stream.on("error", reject);
  });
}
