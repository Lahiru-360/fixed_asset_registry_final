import PDFDocument from "pdfkit";

export function generateSOFPPDF(sofpData) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      size: "A4",
      margin: 50,
      bufferPages: true,
    });

    // Store PDF chunks in memory instead of filesystem
    const chunks = [];
    doc.on("data", (chunk) => chunks.push(chunk));

    doc.on("end", () => {
      try {
        const pdfBuffer = Buffer.concat(chunks);
        resolve(pdfBuffer); // Return buffer instead of file path
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
       COLUMN SYSTEM (SINGLE SOURCE OF TRUTH)
    ========================= */
    const col = {
      category: { x: left, width: 180 },
      cost: { x: left + 180, width: 100 },
      acc: { x: left + 280, width: 120 },
      nbv: { x: left + 400, width: 95 },
    };

    /* =========================
       PAGE HEADER
    ========================= */
    function addPageHeader() {
      doc
        .font("Helvetica-Bold")
        .fontSize(20)
        .fillColor("#000")
        .text("Statement of Financial Position", left, 50, {
          align: "center",
          width: pageWidth,
        });

      doc
        .font("Helvetica")
        .fontSize(13)
        .fillColor("#333")
        .text(`As at ${sofpData.as_of}`, left, 75, {
          align: "center",
          width: pageWidth,
        });

      doc
        .fontSize(10)
        .fillColor("#666")
        .text(`Generated on: ${generatedDate}`, left, 92, {
          align: "center",
          width: pageWidth,
        });
    }

    /* =========================
       TABLE HEADER
    ========================= */
    function addTableHeader(y) {
      doc.rect(left, y, pageWidth, 24).fillAndStroke("#4a5568", "#4a5568");

      doc.font("Helvetica-Bold").fontSize(9).fillColor("#fff");

      doc.text("Asset Category", col.category.x + 8, y + 8, {
        width: col.category.width - 16,
      });

      doc.text("Cost", col.cost.x + 8, y + 8, {
        width: col.cost.width - 16,
        align: "right",
      });

      doc.text("Accumulated Dep.", col.acc.x + 8, y + 8, {
        width: col.acc.width - 16,
        align: "right",
      });

      doc.text("NBV", col.nbv.x + 8, y + 8, {
        width: col.nbv.width - 16,
        align: "right",
      });

      doc.font("Helvetica").fillColor("#000");

      return y + 24;
    }

    function checkPageBreak(y, space = 28) {
      if (y + space > pageHeight - bottomMargin - 40) {
        doc.addPage();
        addPageHeader();
        return addTableHeader(115);
      }
      return y;
    }

    /* =========================
       FIRST PAGE
    ========================= */
    addPageHeader();

    const summaryY = 115;
    doc.rect(left, summaryY, pageWidth, 30).fillAndStroke("#f0f0f0", "#ccc");

    doc
      .font("Helvetica-Bold")
      .fontSize(11)
      .fillColor("#000")
      .text(
        `Total Asset Categories: ${sofpData.categories.length}`,
        left + 10,
        summaryY + 10
      );

    doc.text(
      `Total NBV: Rs. ${sofpData.totals.nbv.toLocaleString()}`,
      left,
      summaryY + 10,
      { width: pageWidth - 20, align: "right" }
    );

    let y = addTableHeader(summaryY + 45);

    /* =========================
       TABLE ROWS
    ========================= */
    const rowHeight = 22;
    let i = 0;

    sofpData.categories.forEach((row) => {
      y = checkPageBreak(y, rowHeight);

      if (i % 2 === 0) {
        doc.rect(left, y, pageWidth, rowHeight).fill("#f9f9f9");
      }

      doc.fontSize(9).fillColor("#000");

      doc.text(row.category, col.category.x + 8, y + 7, {
        width: col.category.width - 16,
        ellipsis: true,
      });

      doc.text(row.total_cost.toLocaleString(), col.cost.x + 8, y + 7, {
        width: col.cost.width - 16,
        align: "right",
      });

      doc.text(
        row.accumulated_depreciation.toLocaleString(),
        col.acc.x + 8,
        y + 7,
        { width: col.acc.width - 16, align: "right" }
      );

      doc.text(row.nbv.toLocaleString(), col.nbv.x + 8, y + 7, {
        width: col.nbv.width - 16,
        align: "right",
      });

      y += rowHeight;
      i++;
    });

    /* =========================
       TOTALS (ALIGNED WITH COLUMNS)
    ========================= */
    y = checkPageBreak(y, 60);
    y += 15;

    doc
      .moveTo(left, y)
      .lineTo(left + pageWidth, y)
      .strokeColor("#ccc")
      .stroke();
    y += 15;

    doc.font("Helvetica-Bold").fontSize(12).fillColor("#2d3748");

    doc.text("TOTAL ASSETS", col.category.x + 8, y, {
      width: col.category.width - 16,
    });

    doc.text(sofpData.totals.total_cost.toLocaleString(), col.cost.x + 8, y, {
      width: col.cost.width - 16,
      align: "right",
    });

    doc.text(
      sofpData.totals.accumulated_depreciation.toLocaleString(),
      col.acc.x + 8,
      y,
      { width: col.acc.width - 16, align: "right" }
    );

    doc.text(sofpData.totals.nbv.toLocaleString(), col.nbv.x + 8, y, {
      width: col.nbv.width - 16,
      align: "right",
    });

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
        "This is a system-generated Statement of Financial Position. All amounts are in LKR.",
        left,
        footerY,
        { width: pageWidth, align: "center" }
      );

    doc.text(
      `Report ID: SOFP-${sofpData.as_of}-${Date.now()}`,
      left,
      footerY + 12,
      { width: pageWidth, align: "center" }
    );

    doc.end();
  });
}
