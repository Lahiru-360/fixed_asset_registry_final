import { getPurchaseOrderByRequestIdModel } from "../models/purchaseOrders.model.js";
import { getCategoryByIdModel } from "../models/assetCategories.model.js";
import { createAssetModel } from "../models/assets.model.js";
import { getGRNByPOModel } from "../models/goodsReceived.model.js";
import { updateRequestStatus } from "../models/adminRequests.model.js";
import { getAllAssetsModel } from "../models/assets.model.js";
import { generateAssetId } from "../utils/generateAssetId.js";
import { getRequestById } from "../models/adminRequests.model.js";
import { calculateDepreciation } from "../utils/depreciation.js";
import { getAssetsPaginatedModel } from "../models/assets.model.js";

export async function getAllAssetsController(req, res) {
  try {
    const assets = await getAllAssetsModel();
    const asOfDate = new Date();

    const enrichedAssets = assets.map((asset) => {
      const year = asOfDate.getFullYear();
      const month = asOfDate.getMonth() + 1;

      const dep = calculateDepreciation(asset, year, month);

      return {
        ...asset,
        fullyDepreciated: dep.fullyDepreciated,
      };
    });

    return res.json({ assets: enrichedAssets });
  } catch (err) {
    console.error("Get assets error:", err);
    return res.status(500).json({ error: "Server error" });
  }
}

export async function getAssetsPaginatedController(req, res) {
  try {
    const {
      page = 1,
      limit = 10,
      search = "",
      category = "All",
      sort = "newest",
    } = req.query;

    const { assets, total } = await getAssetsPaginatedModel({
      page: Number(page),
      limit: Number(limit),
      search,
      category,
      sort,
    });

    const asOfDate = new Date();

    const enriched = assets.map((asset) => {
      const dep = calculateDepreciation(
        asset,
        asOfDate.getFullYear(),
        asOfDate.getMonth() + 1
      );

      return {
        ...asset,
        fullyDepreciated: dep.fullyDepreciated,
      };
    });

    res.json({
      assets: enriched,
      total,
      page: Number(page),
      totalPages: Math.ceil(total / limit),
    });
  } catch (err) {
    console.error("Paginated assets error:", err);
    res.status(500).json({ error: "Server error" });
  }
}

export async function registerAssetsController(req, res) {
  const { requestId } = req.params;
  const adminId = req.user.employee_id;
  const request = await getRequestById(requestId);

  if (request.status == "Completed") {
    return res.status(400).json({ error: "Request already completed" });
  }

  try {
    const po = await getPurchaseOrderByRequestIdModel(requestId);
    if (!po) return res.status(404).json({ error: "Purchase order not found" });

    const grn = await getGRNByPOModel(po.po_id);
    if (!grn)
      return res
        .status(400)
        .json({ error: "Cannot register assets before GRN." });

    const {
      category_id,
      asset_name,
      useful_life,
      residual_value = 0,
      department,
    } = req.body;

    const depreciation_rate = (1 / useful_life) * 100;

    const quantity = Number(po.quantity);
    const purchase_cost = Number(po.vendor_price);

    const category = await getCategoryByIdModel(category_id);
    if (!category) return res.status(400).json({ error: "Invalid category" });

    let created = [];

    for (let i = 0; i < quantity; i++) {
      const asset_number = await generateAssetId();
      const asset = await createAssetModel({
        asset_number,
        po_id: po.po_id,
        asset_name,
        category_id,
        purchase_cost,
        useful_life,
        depreciation_rate,
        residual_value,
        department,
      });

      created.push(asset);
    }

    await updateRequestStatus(requestId, "Completed", adminId);

    return res.json({
      message: "Assets registered successfully",
      assets: created,
    });
  } catch (err) {
    console.error("Asset registration error:", err);
    return res.status(500).json({ error: "Server error" });
  }
}
