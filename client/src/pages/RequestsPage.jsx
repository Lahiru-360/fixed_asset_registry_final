// src/pages/admin/RequestsPage.jsx

import React from "react";
import AdminLayout from "../layout/AdminLayout";
import RequestsTable from "../components/admin/RequestsTable";
import axiosInstance from "../api/axiosInstance";
import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import { useSearchParams } from "react-router-dom";

export default function RequestsPage() {
  const [requests, setRequests] = useState([]);
  const [requestsLoading, setRequestsLoading] = useState(false);
  const { user, loading } = useAuth();

  const [searchParams, setSearchParams] = useSearchParams();

  const [searchQuery, setSearchQuery] = useState(
    searchParams.get("search") || ""
  );
  const [statusFilter, setStatusFilter] = useState(
    searchParams.get("status") || "All"
  );
  const [sortOrder, setSortOrder] = useState(
    searchParams.get("sort") || "newest"
  );
  const [page, setPage] = useState(Number(searchParams.get("page")) || 1);

  const [pageSize] = useState(20);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    setSearchParams({
      search: searchQuery,
      status: statusFilter,
      sort: sortOrder,
      page: String(page),
    });
  }, [searchQuery, statusFilter, sortOrder, page]);

  const fetchRequests = useCallback(async () => {
    setRequestsLoading(true);
    try {
      const res = await axiosInstance.get("/api/admin/requests", {
        params: {
          page,
          pageSize,
          search: searchQuery,
          status: statusFilter,
          sort: sortOrder,
        },
      });

      setRequests(res.data.requests || []);
      setTotalPages(res.data.pagination?.totalPages || 1);
    } catch (err) {
      console.error("Failed to load requests:", err);
    } finally {
      setRequestsLoading(false);
    }
  }, [page, pageSize, searchQuery, statusFilter, sortOrder]);

  useEffect(() => {
    if (!loading && user && user.role === "admin") {
      fetchRequests();
    }
  }, [loading, user, fetchRequests]);

  useEffect(() => {
    setPage(1);
  }, [searchQuery, statusFilter, sortOrder]);

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">
            Manage Requests
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Review and manage employee asset requests
          </p>
        </div>

        <section className="bg-muted border border-muted rounded-2xl p-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
            <h3 className="text-lg font-semibold">All Asset Requests</h3>

            <div className="flex flex-wrap items-center gap-3">
              <input
                className="px-3 py-2 rounded-md bg-background border border-muted focus:ring-0 focus:border-primary text-foreground placeholder:text-muted-foreground"
                placeholder="Search requests..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />

              <select
                className="px-3 py-2 rounded-md bg-background border border-muted focus:ring-0 focus:border-primary text-foreground"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="All">All</option>
                <option value="Pending">Pending</option>
                <option value="Approved">Approved</option>
                <option value="Rejected">Rejected</option>
                <option value="Quotation Selected">Quotation Selected</option>
                <option value="Purchase Order Sent">Purchase Order Sent</option>
                <option value="Asset Recieved">Asset Recieved</option>
                <option value="Completed">Completed</option>
              </select>

              <select
                className="px-3 py-2 rounded-md bg-background border border-muted focus:ring-0 focus:border-primary text-foreground"
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
              </select>
            </div>
          </div>

          <RequestsTable
            data={requests}
            onRefresh={fetchRequests}
            loading={requestsLoading}
          />
        </section>
        <div className="flex justify-center items-center mt-4">
          {/* Previous Button - Left */}
          <button
            disabled={page === 1}
            onClick={() => setPage((p) => p - 1)}
            className="inline-flex items-center gap-1.5
      px-2.5 py-1.5
      rounded-md
      text-sm font-medium
      text-primary
      border border-primary/30
      hover:bg-primary/10
      hover:border-primary/60
      active:scale-[0.97]
      transition disabled:opacity-50"
          >
            Previous
          </button>

          {/* Page Count - Center */}
          <span className="text-sm text-muted-foreground  mx-3">
            Page {page} of {totalPages}
          </span>

          {/* Next Button - Right */}
          <button
            disabled={page === totalPages}
            onClick={() => setPage((p) => p + 1)}
            className="inline-flex items-center gap-1.5
      px-2.5 py-1.5
      rounded-md
      text-sm font-medium
      text-primary
      border border-primary/30
      hover:bg-primary/10
      hover:border-primary/60
      active:scale-[0.97]
      transition disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
    </AdminLayout>
  );
}
