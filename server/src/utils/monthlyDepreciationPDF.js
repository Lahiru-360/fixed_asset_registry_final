import PDFDocument from "pdfkit";

/**
 * Generates a comprehensive Monthly Depreciation Schedule PDF document
 * Streams directly to response without saving to disk
 * @param {Object} data - The depreciation data payload
 * @param {string} data.period - The period in format "YYYY-MM" (e.g., "2024-12")
 * @param {number} data.total - Total monthly depreciation for all assets
 * @param {Array} data.assets - Array of asset depreciation details
 * @param {Object} res - Express response object to stream PDF to
 */
export function generateMonthlyDepreciationPDF(data, res) {
  const doc = new PDFDocument({
    size: "A4",
    margin: 50,
    bufferPages: true,
  });

  // Set response headers for PDF download
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader(
    "Content-Disposition",
    `attachment; filename=Monthly-Depreciation-${data.period}.pdf`
  );

  // Pipe PDF directly to response
  doc.pipe(res);

  const pageWidth =
    doc.page.width - doc.page.margins.left - doc.page.margins.right;
  const left = doc.page.margins.left;
  const bottomMargin = doc.page.margins.bottom;
  const pageHeight = doc.page.height;

  // Format period for display (e.g., "2024-12" -> "December 2024")
  const [year, month] = data.period.split("-");
  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  const formattedPeriod = `${monthNames[parseInt(month) - 1]} ${year}`;

  // Current date
  const generatedDate = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  // Helper function to add page header
  function addPageHeader() {
    doc
      .font("Helvetica-Bold")
      .fontSize(20)
      .fillColor("#000")
      .text("Monthly Depreciation Schedule", left, 50, {
        align: "center",
        width: pageWidth,
      });

    doc
      .font("Helvetica")
      .fontSize(13)
      .fillColor("#333")
      .text(`Period: ${formattedPeriod}`, left, 75, {
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

  // Helper function to add table header
  function addTableHeader(yPosition) {
    const colX = {
      assetNo: left + 5,
      asset: left + 85,
      purchaseCost: left + 180,
      monthly: left + 255,
      accumulated: left + 330,
      nbv: left + 410,
    };

    // Header background - make sure it covers the full width
    doc
      .rect(left, yPosition, pageWidth, 20)
      .fillAndStroke("#4a5568", "#4a5568");

    // Set font for headers
    doc.font("Helvetica-Bold").fontSize(7).fillColor("#fff");

    doc.text("Asset No.", colX.assetNo, yPosition + 6, {
      width: 75,
      lineBreak: false,
    });
    doc.text("Asset Name", colX.asset, yPosition + 6, {
      width: 90,
      lineBreak: false,
    });
    doc.text("Purchase Cost", colX.purchaseCost, yPosition + 6, {
      width: 70,
      align: "right",
      lineBreak: false,
    });
    doc.text("Monthly Dep.", colX.monthly, yPosition + 6, {
      width: 70,
      align: "right",
      lineBreak: false,
    });
    doc.text("Accumulated", colX.accumulated, yPosition + 6, {
      width: 75,
      align: "right",
      lineBreak: false,
    });
    doc.text("NBV", colX.nbv, yPosition + 6, {
      width: 85,
      align: "right",
      lineBreak: false,
    });

    // Reset to regular font for body text
    doc.font("Helvetica").fontSize(7).fillColor("#000");

    return yPosition + 20;
  }

  // Helper function to check if we need a new page
  function checkPageBreak(currentY, requiredSpace = 30) {
    if (currentY + requiredSpace > pageHeight - bottomMargin - 50) {
      doc.addPage();
      addPageHeader();
      return addTableHeader(115);
    }
    return currentY;
  }

  // ===== FIRST PAGE HEADER =====
  addPageHeader();

  // ===== SUMMARY BOX =====
  const summaryY = 115;
  doc.fillColor("#000");
  doc.rect(left, summaryY, pageWidth, 30).fillAndStroke("#f0f0f0", "#ccc");

  doc
    .fillColor("#000")
    .font("Helvetica-Bold")
    .fontSize(11)
    .text(`Total Assets: ${data.assets.length}`, left + 10, summaryY + 10, {
      width: 250,
    });

  doc.text(
    `Total Monthly Depreciation: Rs. ${data.total.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`,
    left + 10,
    summaryY + 10,
    { width: pageWidth - 20, align: "right" }
  );

  // ===== TABLE HEADER (FIRST PAGE) =====
  let currentY = addTableHeader(summaryY + 45);

  // ===== TABLE ROWS =====
  const colX = {
    assetNo: left + 5,
    asset: left + 85,
    purchaseCost: left + 180,
    monthly: left + 255,
    accumulated: left + 330,
    nbv: left + 410,
  };

  const rowHeight = 18;
  let rowCount = 0;

  data.assets.forEach((asset, index) => {
    // Check if we need a new page
    currentY = checkPageBreak(currentY, rowHeight);

    // Alternating row background
    if (rowCount % 2 === 0) {
      doc.rect(left, currentY, pageWidth, rowHeight).fill("#f9f9f9");
    }

    // Ensure regular font is set for each row
    doc.font("Helvetica").fontSize(7).fillColor("#000");

    // Asset Number (truncate with ellipsis)
    doc.text(asset.asset_number || "-", colX.assetNo, currentY + 5, {
      width: 75,
      height: rowHeight - 5,
      ellipsis: true,
      lineBreak: false,
    });

    // Asset name with fully depreciated indicator
    const assetDisplayName = asset.fully_depreciated
      ? `${asset.asset_name} ✓`
      : asset.asset_name;

    doc.text(assetDisplayName, colX.asset, currentY + 5, {
      width: 90,
      height: rowHeight - 5,
      ellipsis: true,
      lineBreak: false,
    });

    // Purchase cost
    doc.text(
      asset.purchase_cost.toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }),
      colX.purchaseCost,
      currentY + 5,
      { width: 70, align: "right", lineBreak: false }
    );

    // Monthly depreciation
    doc.text(
      asset.monthly_depreciation.toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }),
      colX.monthly,
      currentY + 5,
      { width: 70, align: "right", lineBreak: false }
    );

    // Accumulated depreciation
    doc.text(
      asset.accumulated_depreciation.toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }),
      colX.accumulated,
      currentY + 5,
      { width: 75, align: "right", lineBreak: false }
    );

    // Net Book Value (highlight if zero)
    if (asset.nbv === 0) {
      doc.fillColor("#999");
    }
    doc.text(
      asset.nbv.toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }),
      colX.nbv,
      currentY + 5,
      { width: 85, align: "right", lineBreak: false }
    );

    doc.fillColor("#000");
    currentY += rowHeight;
    rowCount++;
  });

  // ===== TOTAL SECTION =====
  // Ensure enough space for total section
  currentY = checkPageBreak(currentY, 80);

  currentY += 10;

  // Draw separator line before total
  doc
    .strokeColor("#ccc")
    .lineWidth(1)
    .moveTo(left, currentY)
    .lineTo(left + pageWidth, currentY)
    .stroke();

  currentY += 15;

  // Total text
  doc.font("Helvetica-Bold").fontSize(12).fillColor("#2d3748");
  doc.text("Total Monthly Depreciation:", left, currentY, {
    width: pageWidth,
    align: "left",
  });

  currentY += 20;

  doc.fontSize(14);
  doc.text(
    `Rs. ${data.total.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`,
    left,
    currentY,
    { width: pageWidth, align: "left" }
  );

  // ===== LEGEND =====
  currentY += 30;
  doc.font("Helvetica").fontSize(8).fillColor("#666");
  doc.text("✓ = Fully Depreciated Asset", left, currentY, { align: "left" });

  // ===== DOCUMENT FOOTER =====
  const footerY = pageHeight - bottomMargin - 30;

  doc
    .moveTo(left, footerY - 10)
    .lineTo(left + pageWidth, footerY - 10)
    .strokeColor("#ddd")
    .lineWidth(0.5)
    .stroke();

  doc
    .fontSize(8)
    .font("Helvetica-Oblique")
    .fillColor("#888")
    .text(
      "This is a system-generated depreciation report. All amounts are in LKR.",
      left,
      footerY,
      { width: pageWidth, align: "center" }
    );

  doc.text(`Report ID: DEP-${data.period}-${Date.now()}`, left, footerY + 12, {
    width: pageWidth,
    align: "center",
  });

  // Finalize PDF
  doc.end();
}
