import { getAllAssetsModel } from "../models/assets.model.js";
import { calculateDepreciation } from "../utils/depreciation.js";
import { generateSOFPPDF } from "../utils/generateSOFPPDF.js";

async function buildSOFP(year, month) {
  const assets = await getAllAssetsModel();

  const grouped = {};

  assets.forEach((asset) => {
    const dep = calculateDepreciation(asset, year, month);

    const category = asset.category_name || "Uncategorized";

    if (!grouped[category]) {
      grouped[category] = {
        category,
        total_cost: 0,
        accumulated_depreciation: 0,
        nbv: 0,
      };
    }

    grouped[category].total_cost += Number(asset.purchase_cost);
    grouped[category].accumulated_depreciation += dep.accumulatedDepreciation;
    grouped[category].nbv += dep.nbv;
  });

  const categories = Object.values(grouped).map((c) => ({
    category: c.category,
    total_cost: Number(c.total_cost.toFixed(2)),
    accumulated_depreciation: Number(c.accumulated_depreciation.toFixed(2)),
    nbv: Number(c.nbv.toFixed(2)),
  }));

  const totals = categories.reduce(
    (acc, c) => {
      acc.total_cost += c.total_cost;
      acc.accumulated_depreciation += c.accumulated_depreciation;
      acc.nbv += c.nbv;
      return acc;
    },
    { total_cost: 0, accumulated_depreciation: 0, nbv: 0 }
  );

  return {
    as_of: `${year}-${String(month).padStart(2, "0")}`,
    categories,
    totals: {
      total_cost: Number(totals.total_cost.toFixed(2)),
      accumulated_depreciation: Number(
        totals.accumulated_depreciation.toFixed(2)
      ),
      nbv: Number(totals.nbv.toFixed(2)),
    },
  };
}

export async function getSOFP(req, res) {
  const { year, month } = req.query;

  try {
    const payload = await buildSOFP(Number(year), Number(month));
    return res.json(payload);
  } catch (err) {
    console.error("SOFP error:", err);
    return res.status(500).json({ error: "Server error" });
  }
}

export async function downloadSOFPPDF(req, res) {
  const { year, month } = req.query;

  if (!year || !month) {
    return res.status(400).json({ error: "Year and month are required" });
  }

  try {
    const payload = await buildSOFP(Number(year), Number(month));
    const pdfBuffer = await generateSOFPPDF(payload);

    // Set headers for PDF download
    const fileName = `SOFP-${year}-${String(month).padStart(2, "0")}.pdf`;
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="${fileName}"`);

    // Send PDF buffer directly to client
    return res.send(pdfBuffer);
  } catch (err) {
    console.error("SOFP PDF error:", err);
    return res.status(500).json({ error: "Server error" });
  }
}
