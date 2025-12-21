import { useState, useEffect, useCallback } from "react";
import Sidebar from "../components/employeeDashboard/Sidebar";
import TopBar from "../components/employeeDashboard/TopBar";
import StatsGrid from "../components/employeeDashboard/StatsGrid";
import RequestsTable from "../components/employeeDashboard/RequestsTable";
import NewRequestDrawer from "../components/employeeDashboard/NewRequestDrawer";
import axiosInstance from "../api/axiosInstance";
import EmployeeLayout from "../layout/EmployeeLayout";

import { useAuth } from "../context/AuthContext";

export default function EmployeeDashboard() {
  const [requests, setRequests] = useState([]);
  const [stats, setStats] = useState(null);

  const { user, loading } = useAuth();

  const [searchQuery, setSearchQuery] = useState("");

  const [statusFilter, setStatusFilter] = useState("All");
  const [sortOrder, setSortOrder] = useState("newest");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const fetchRequests = useCallback(async () => {
    try {
      const res = await axiosInstance.get("/api/requests");
      setRequests(res.data.requests || []);
    } catch (err) {
      console.error("Failed to load requests:", err);
    }
  }, []);

  const fetchStats = useCallback(async () => {
    try {
      const res = await axiosInstance.get("/api/requests/stats");
      setStats(res.data || null);
    } catch (err) {
      console.error("Failed to load stats:", err);
    }
  }, []);

  const handleRequestCreated = async () => {
    await fetchRequests();
    await fetchStats();
  };

  useEffect(() => {
    if (!loading && user) {
      fetchRequests();
      fetchStats();
    }
  }, [fetchRequests, fetchStats]);

  const applySearch = (list) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return list;

    const startsWith = (value) =>
      value.toLowerCase().startsWith(q) ||
      value
        .toLowerCase()
        .split(" ")
        .some((word) => word.startsWith(q));

    return list.filter(
      (r) => startsWith(r.asset_name || "") || startsWith(r.reason || "")
    );
  };

  const applyStatusFilter = (list) => {
    if (statusFilter === "All") return list;
    if (statusFilter == "Processing") {
      return list.filter(
        (r) =>
          r.status === "Approved" ||
          r.status === "Quotation Selected" ||
          r.status === "Purchase Order Sent" ||
          r.status === "Asset Recieved"
      );
    }

    return list.filter((r) => r.status === statusFilter);
  };

  const applySorting = (list) => {
    return [...list].sort((a, b) => {
      const da = new Date(a.created_at);
      const db = new Date(b.created_at);

      return sortOrder === "newest" ? db - da : da - db;
    });
  };

  const filteredRequests = applySorting(
    applyStatusFilter(applySearch(requests))
  );

  return (
    <EmployeeLayout onNewRequest={() => setDrawerOpen(true)}>
      <div className="flex-1 flex flex-col">
        <main className="p-4 md:p-2 space-y-6 overflow-auto">
          <StatsGrid stats={stats} />

          <section className="bg-muted border border-muted rounded-2xl p-4">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
              <h3 className="text-lg font-semibold">My Asset Requests</h3>

              <div className="flex flex-wrap items-center gap-3">
                <input
                  className="px-3 py-2 rounded-md bg-background border border-muted focus:ring-0 focus:border-primary"
                  placeholder="Search requests..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />

                <select
                  className="px-3 py-2 rounded-md bg-background border border-muted focus:ring-0 focus:border-primary"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="All">All</option>
                  <option value="Pending">Pending</option>
                  <option value="Processing">Processing</option>
                  <option value="Rejected">Rejected</option>
                  <option value="Completed">Completed</option>
                </select>

                <select
                  className="px-3 py-2 rounded-md bg-background border border-muted focus:ring-0 focus:border-primary"
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value)}
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                </select>
              </div>
            </div>

            {/* Updated Requests */}
            <RequestsTable data={filteredRequests} />
          </section>
        </main>
      </div>

      <NewRequestDrawer
        open={drawerOpen}
        setOpen={setDrawerOpen}
        onCreated={handleRequestCreated}
      />
    </EmployeeLayout>
  );
}
