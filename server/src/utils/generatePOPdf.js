import PDFDocument from "pdfkit";
import { uploadPDFToStorage } from "./supabaseStorage.js";

export function generatePurchaseOrderPDF(po) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      size: "A4",
      margin: 50,
      bufferPages: true,
    });

    // Store PDF chunks in memory
    const chunks = [];
    doc.on("data", (chunk) => chunks.push(chunk));

    doc.on("end", async () => {
      try {
        const pdfBuffer = Buffer.concat(chunks);
        const fileName = `${po.po_number}.pdf`;

        // Upload to Supabase Storage
        const fileUrl = await uploadPDFToStorage(
          pdfBuffer,
          fileName,
          "po-pdfs"
        );

        resolve(fileUrl); // Return Supabase Storage URL
      } catch (error) {
        reject(error);
      }
    });

    doc.on("error", reject);

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
      .text("PURCHASE ORDER", left, 50, {
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
       PO META (RIGHT ALIGNED)
    ========================= */
    doc.moveDown(2);

    doc.font("Helvetica").fontSize(11).fillColor("#000");

    doc.text(`PO Number: ${po.po_number}`, left, doc.y, {
      width: pageWidth,
      align: "right",
    });

    doc.text(`PO Date: ${generatedDate}`, left, doc.y + 4, {
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
       DELIVERY INFORMATION
    ========================= */
    doc.font("Helvetica-Bold").fontSize(14).text("Delivery Information");
    doc.moveDown(0.5);

    doc.font("Helvetica").fontSize(11);
    doc.text("Delivery Address: To be confirmed", left);
    doc.text(
      "Delivery Timeline: Within 14 working days of PO acceptance",
      left
    );

    doc.moveDown(1.5);

    /* =========================
       ORDER DETAILS TABLE
    ========================= */
    doc.font("Helvetica-Bold").fontSize(14).text("Order Details");
    doc.moveDown(0.8);

    /* Column system */
    const col = {
      asset: { x: left, width: 230 },
      qty: { x: left + 230, width: 50 },
      unit: { x: left + 280, width: 105 },
      total: { x: left + 385, width: 110 },
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

    doc.text("Unit Price (LKR)", col.unit.x + 8, tableTop + 8, {
      width: col.unit.width - 16,
      align: "right",
    });

    doc.text("Total (LKR)", col.total.x + 8, tableTop + 8, {
      width: col.total.width - 16,
      align: "right",
    });

    /* Table Row */
    const rowTop = tableTop + rowHeight;

    doc.rect(left, rowTop, pageWidth, rowHeight).strokeColor("#ddd").stroke();

    const rowTotal = po.vendor_price * po.quantity;

    doc.font("Helvetica").fontSize(11).fillColor("#000");

    doc.text(po.asset_name, col.asset.x + 8, rowTop + 7, {
      width: col.asset.width - 16,
      ellipsis: true,
    });

    doc.text(String(po.quantity), col.qty.x + 8, rowTop + 7, {
      width: col.qty.width - 16,
      align: "center",
    });

    doc.text(po.vendor_price.toLocaleString(), col.unit.x + 8, rowTop + 7, {
      width: col.unit.width - 16,
      align: "right",
    });

    doc.text(rowTotal.toLocaleString(), col.total.x + 8, rowTop + 7, {
      width: col.total.width - 16,
      align: "right",
    });

    doc.y = rowTop + rowHeight + 20;

    /* =========================
       GRAND TOTAL
    ========================= */
    doc.font("Helvetica-Bold").fontSize(13).fillColor("#2d3748");

    doc.text(`Grand Total: LKR ${rowTotal.toLocaleString()}`, left, doc.y, {
      width: pageWidth,
      align: "right",
    });

    doc.moveDown(2);

    /* =========================
       TERMS & CONDITIONS
    ========================= */
    doc
      .font("Helvetica-Bold")
      .fontSize(14)
      .fillColor("#000")
      .text("Terms & Conditions");
    doc.moveDown(0.6);

    doc.font("Helvetica").fontSize(10).fillColor("#333");
    doc.text("• All goods must be delivered in original condition.");
    doc.text("• Payment will be processed within 30 days after delivery.");
    doc.text("• Vendor must provide a valid invoice with this PO number.");

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
        "This is a system-generated purchase order and does not require a physical signature.",
        left,
        footerY,
        { width: pageWidth, align: "center" }
      );

    doc.end();
  });
}
