// src/controllers/assetRequestController.js
import AssetRequest from "../models/AssetRequest.js";
import { EmployeeModel } from "../models/employee.model.js";

export const createRequest = async (req, res) => {
  try {
    const uid = req.firebaseUser.uid;

    // find employee_id
    const employee = await EmployeeModel.findByFirebaseUID(uid);
    if (!employee) return res.status(404).json({ error: "Employee not found" });

    const { asset_name, quantity, reason } = req.body;

    if (!asset_name)
      return res.status(400).json({ error: "Asset name is required" });

    const request = await AssetRequest.create({
      employee_id: employee.employee_id,
      asset_name,
      quantity: quantity || 1,
      reason,
    });

    res.json({ message: "Request submitted", request });
  } catch (err) {
    console.error("Create Request Error:", err);
    res.status(500).json({ error: "Server error" });
  }
};

export const getMyRequests = async (req, res) => {
  try {
    const uid = req.firebaseUser.uid;

    const employee = await EmployeeModel.findByFirebaseUID(uid);
    if (!employee) return res.status(404).json({ error: "Employee not found" });

    const requests = await AssetRequest.findByEmployee(employee.employee_id);

    res.json({ requests });
  } catch (err) {
    console.error("Fetch Requests Error:", err);
    res.status(500).json({ error: "Server error" });
  }
};

export const getStats = async (req, res) => {
  try {
    const uid = req.firebaseUser.uid;
    const employee = await EmployeeModel.findByFirebaseUID(uid);
    if (!employee) return res.status(404).json({ error: "Employee not found" });

    // If admin -> return global stats
    if (employee.role === "admin") {
      const stats = await AssetRequest.statsGlobal();
      return res.json(stats);
    }

    // Otherwise employee-scoped stats
    const stats = await AssetRequest.statsForEmployee(employee.employee_id);
    return res.json(stats);
  } catch (err) {
    console.error("Stats fetch error:", err);
    return res.status(500).json({ error: "Server error while fetching stats" });
  }
};
