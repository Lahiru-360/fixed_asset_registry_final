import {
  getAllRequests,
  getRequestById,
  updateRequestStatus,
  getRequestsPaginated,
} from "../models/adminRequests.model.js";

export const getRequests = async (req, res) => {
  try {
    const page = Number(req.query.page || 1);
    const pageSize = Number(req.query.pageSize || 10);
    const offset = (page - 1) * pageSize;

    const { search, status, sort } = req.query;

    const { rows, total } = await getRequestsPaginated({
      limit: pageSize,
      offset,
      search,
      status,
      sortOrder: sort,
    });

    return res.json({
      requests: rows,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to fetch requests" });
  }
};

export const approveRequest = async (req, res) => {
  try {
    const requestId = req.params.id;
    const adminId = req.user.employee_id;

    const reqRecord = await getRequestById(requestId);
    if (!reqRecord) {
      return res.status(404).json({ error: "Request not found" });
    }

    if (reqRecord.status !== "Pending") {
      return res.status(400).json({ error: "Request already processed" });
    }

    const updated = await updateRequestStatus(requestId, "Approved", adminId);

    return res.json({ message: "Request approved", request: updated });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Approval failed" });
  }
};

export const rejectRequest = async (req, res) => {
  try {
    const requestId = req.params.id;
    const adminId = req.user.employee_id;

    const reqRecord = await getRequestById(requestId);
    if (!reqRecord) {
      return res.status(404).json({ error: "Request not found" });
    }

    if (reqRecord.status !== "Pending") {
      return res.status(400).json({ error: "Request already processed" });
    }

    const updated = await updateRequestStatus(requestId, "Rejected", adminId);

    return res.json({ message: "Request rejected", request: updated });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Rejection failed" });
  }
};
