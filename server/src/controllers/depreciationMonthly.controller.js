import { getAllAssetsModel } from "../models/assets.model.js";
import { calculateDepreciation } from "../utils/depreciation.js";
import { generateMonthlyDepreciationPDF } from "../utils/monthlyDepreciationPDF.js";
import { getAssetsByAcquisitionPeriodModel } from "../models/assets.model.js";

async function buildMonthlyDepreciationFull(year, month) {
  // const assets = await getAllAssetsModel();
  const assets = await getAssetsByAcquisitionPeriodModel(year, month);

  const rows = assets.map((asset, index) => {
    const dep = calculateDepreciation(asset, year, month);

    return {
      asset_id: asset.asset_id,

      asset_number: asset.asset_number,

      asset_name: asset.asset_name,

      purchase_cost: Number(asset.purchase_cost),
      residual_value: Number(asset.residual_value || 0),

      monthly_depreciation: Number(dep.monthlyDepreciation.toFixed(2)),
      accumulated_depreciation: Number(dep.accumulatedDepreciation.toFixed(2)),
      nbv: Number(dep.nbv.toFixed(2)),
      fully_depreciated: dep.fullyDepreciated,
    };
  });

  const total = rows.reduce((sum, r) => sum + r.monthly_depreciation, 0);

  return {
    period: `${year}-${String(month).padStart(2, "0")}`,
    total: Number(total.toFixed(2)),
    assets: rows,
  };
}

async function buildMonthlyDepreciationPaginated({
  year,
  month,
  page = 1,
  limit = 10,
  search = "",
  status = "All",
}) {
  const full = await buildMonthlyDepreciationFull(year, month);

  let rows = full.assets;

  function startsWithWord(value, query) {
    if (!value || !query) return false;

    const text = String(value).toLowerCase();
    const q = query.toLowerCase();

    return (
      text.startsWith(q) || text.split(/\s+/).some((word) => word.startsWith(q))
    );
  }

  // SEARCH (beginning-of-word match)
  if (search) {
    const q = search.trim().toLowerCase();

    rows = rows.filter(
      (a) =>
        startsWithWord(a.asset_name, q) || startsWithWord(a.asset_number, q)
    );
  }

  // STATUS FILTER
  if (status !== "All") {
    rows = rows.filter((a) =>
      status === "Active" ? !a.fully_depreciated : a.fully_depreciated
    );
  }

  const totalRows = rows.length;
  const offset = (page - 1) * limit;

  return {
    period: full.period,
    total: full.total,
    assets: rows.slice(offset, offset + limit),
    totalRows,
  };
}

export async function getMonthlyDepreciation(req, res) {
  const { year, month, page, limit, search, status } = req.query;

  try {
    const payload = await buildMonthlyDepreciationPaginated({
      year: Number(year),
      month: Number(month),
      page: Number(page || 1),
      limit: Number(limit || 10),
      search: search || "",
      status: status || "All",
    });

    return res.json(payload);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
}

export async function downloadMonthlyDepreciationPDF(req, res) {
  const { year, month } = req.query;

  if (!year || !month) {
    return res.status(400).json({ error: "Year and month required" });
  }

  try {
    const payload = await buildMonthlyDepreciationFull(
      Number(year),
      Number(month)
    );
    return generateMonthlyDepreciationPDF(payload, res);
  } catch (err) {
    console.error("Monthly depreciation PDF error:", err);
    return res.status(500).json({ error: "Server error" });
  }
}
