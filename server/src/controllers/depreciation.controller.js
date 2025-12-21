import { getAllAssetsModel } from "../models/assets.model.js";
import { calculateDepreciation } from "../utils/depreciation.js";

export async function getDepreciationSummary(req, res) {
  try {
    const assets = await getAllAssetsModel();
    const asOfDate = req.query.date ? new Date(req.query.date) : new Date();

    const result = assets.map((asset) => {
      const dep = calculateDepreciation(asset, asOfDate, { mode: "SCHEDULE" });

      return {
        ...asset,
        ...dep,
      };
    });

    return res.json({ assets: result });
  } catch (err) {
    console.error("Depreciation error:", err);
    return res.status(500).json({ error: "Server error" });
  }
}
