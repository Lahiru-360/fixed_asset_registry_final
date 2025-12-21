import {
  getAllCategoriesModel,
  createCategoryModel,
  updateCategoryModel,
  deleteCategoryModel,
} from "../models/assetCategories.model.js";

export async function getCategories(req, res) {
  try {
    const categories = await getAllCategoriesModel();
    return res.json({ categories });
  } catch (err) {
    console.error("Get categories error:", err);
    return res.status(500).json({ error: "Server error" });
  }
}

export async function createCategory(req, res) {
  try {
    const { name, useful_life, depreciation_rate, residual_value } = req.body;

    const newCategory = await createCategoryModel({
      name,
      useful_life,
      depreciation_rate,
      residual_value: residual_value ?? 0,
    });

    return res.json({ category: newCategory });
  } catch (err) {
    console.error("Create category error:", err);
    return res.status(500).json({ error: "Server error" });
  }
}

export async function updateCategory(req, res) {
  try {
    const { id } = req.params;
    const { useful_life, depreciation_rate, residual_value } = req.body;

    const updated = await updateCategoryModel(id, {
      useful_life,
      depreciation_rate,
      residual_value,
    });

    if (!updated)
      return res.status(400).json({ error: "Cannot modify system categories" });

    return res.json({ category: updated });
  } catch (err) {
    console.error("Update category error:", err);
    return res.status(500).json({ error: "Server error" });
  }
}

export async function deleteCategory(req, res) {
  try {
    const { id } = req.params;

    const deleted = await deleteCategoryModel(id);
    if (!deleted)
      return res.status(400).json({
        error: "Cannot delete system categories",
      });

    return res.json({ message: "Category deleted" });
  } catch (err) {
    console.error("Delete category error:", err);
    return res.status(500).json({ error: "Server error" });
  }
}
