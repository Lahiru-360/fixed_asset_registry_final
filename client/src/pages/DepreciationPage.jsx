import { useEffect, useState, useMemo } from "react";
import axiosInstance from "../api/axiosInstance";
import AdminLayout from "../layout/AdminLayout";
import { TrendingDown } from "lucide-react";
import { useSearchParams } from "react-router-dom";

export default function DepreciationPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const now = new Date();

  const [year, setYear] = useState(
    searchParams.get("year") || now.getFullYear()
  );
  const [month, setMonth] = useState(
    searchParams.get("month") || now.getMonth() + 1
  );

  const [assets, setAssets] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  //const [page, setPage] = useState(1);
  const [page, setPage] = useState(Number(searchParams.get("page")) || 1);

  const [limit] = useState(10);
  const [totalRows, setTotalRows] = useState(0);

  // UI state (client-side only)
  const [search, setSearch] = useState(searchParams.get("search") || "");

  const [statusFilter, setStatusFilter] = useState(
    searchParams.get("status") || "All"
  );

  useEffect(() => {
    setSearchParams({
      page: String(page),
      search,
      year: year,
      month: month,
      status: statusFilter,
    });
  }, [page, search, statusFilter, year, month]);

  const load = async () => {
    setLoading(true);

    const res = await axiosInstance.get("/api/admin/depreciation/monthly", {
      params: {
        year,
        month,
        page,
        limit,
        search,
        status: statusFilter,
      },
    });

    setAssets(res.data.assets || []);
    setTotal(res.data.total || 0);
    setTotalRows(res.data.totalRows || 0);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, [year, month, page, search, statusFilter]);

  /* useEffect(() => {
    setPage(1);
  }, [search, statusFilter, year, month]);*/

  const filteredAssets = assets;

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-semibold text-foreground">
            Depreciation
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Monthly depreciation summary for registered assets
          </p>
        </div>

        {/* Card container */}
        <section className="bg-muted border border-muted rounded-2xl p-4">
          {/* Controls */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
            <h3 className="text-lg font-semibold">Monthly Summary</h3>

            <div className="flex flex-wrap items-center gap-3">
              <input
                className="px-3 py-2 rounded-md bg-background border border-muted focus:ring-0 focus:border-primary text-foreground placeholder:text-muted-foreground"
                placeholder="Search assets..."
                value={search}
                onChange={(e) => {
                  setPage(1);
                  setSearch(e.target.value);
                }}
              />

              <select
                className="px-3 py-2 rounded-md bg-background border border-muted focus:ring-0 focus:border-primary text-foreground"
                value={statusFilter}
                onChange={(e) => {
                  setPage(1);
                  setStatusFilter(e.target.value);
                }}
              >
                <option value="All">All Statuses</option>
                <option value="Active">Active</option>
                <option value="Fully">Fully Depreciated</option>
              </select>

              <select
                className="px-3 py-2 rounded-md bg-background border border-muted focus:ring-0 focus:border-primary text-foreground"
                value={month}
                onChange={(e) => {
                  setPage(1);
                  setMonth(Number(e.target.value));
                }}
              >
                {Array.from({ length: 12 }).map((_, i) => (
                  <option key={i} value={i + 1}>
                    {new Date(0, i).toLocaleString("default", {
                      month: "long",
                    })}
                  </option>
                ))}
              </select>

              <select
                className="px-3 py-2 rounded-md bg-background border border-muted focus:ring-0 focus:border-primary text-foreground"
                value={year}
                onChange={(e) => {
                  setPage(1);
                  setYear(Number(e.target.value));
                }}
              >
                {[2023, 2024, 2025, 2026, 2027].map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>

              <button
                onClick={async () => {
                  const res = await axiosInstance.get(
                    `/api/admin/depreciation/monthly/pdf?year=${year}&month=${month}`,
                    { responseType: "blob" }
                  );

                  const url = window.URL.createObjectURL(new Blob([res.data]));
                  const a = document.createElement("a");
                  a.href = url;
                  a.download = `Monthly-Depreciation-${year}-${month}.pdf`;
                  a.click();
                  a.remove();
                }}
                className="px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition"
              >
                Download PDF
              </button>
            </div>
          </div>
          {/* Content */}
          {loading ? (
            <p className="text-sm text-muted-foreground py-8 text-center">
              Loading depreciation data…
            </p>
          ) : filteredAssets.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground flex flex-col items-center gap-3">
              <TrendingDown />
              <p> No depreciation data found</p>
            </div>
          ) : (
            <>
              {/* 📱 MOBILE CARD VIEW */}
              <div className="block md:hidden space-y-4">
                {filteredAssets.map((a) => (
                  <div
                    key={a.asset_id}
                    className="p-4 bg-background border border-muted rounded-lg shadow-sm"
                  >
                    {/* Header */}
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="font-semibold text-foreground">
                        {a.asset_name}
                      </h3>

                      {a.fully_depreciated ? (
                        <span className="text-xs px-2 py-1 rounded-full bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300">
                          Fully Depreciated
                        </span>
                      ) : (
                        <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300">
                          Active
                        </span>
                      )}
                    </div>

                    {/* Key figures */}
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Asset No.</span>
                        <span className="font-medium text-foreground">
                          {a.asset_number}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">
                          Monthly Depreciation:
                        </span>
                        <span className="font-medium text-foreground">
                          LKR {Number(a.monthly_depreciation).toLocaleString()}
                        </span>
                      </div>

                      <div className="flex justify-between">
                        <span className="text-muted-foreground">
                          Accumulated:
                        </span>
                        <span className="text-foreground">
                          LKR{" "}
                          {Number(a.accumulated_depreciation).toLocaleString()}
                        </span>
                      </div>

                      <div className="flex justify-between">
                        <span className="text-muted-foreground">NBV:</span>
                        <span className="text-foreground">
                          LKR {Number(a.nbv).toLocaleString()}
                        </span>
                      </div>

                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Cost:</span>
                        <span className="text-foreground">
                          LKR {Number(a.purchase_cost).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="overflow-auto md:block rounded-xl">
                <table className="hidden md:table w-full min-w-[1000px] text-sm">
                  <thead className="text-xs text-muted-foreground uppercase tracking-wide">
                    <tr>
                      <th className="py-3 text-left">Asset No</th>
                      <th className="py-3 text-left">Asset</th>
                      <th className="py-3 text-left">Cost (LKR)</th>
                      <th className="py-3 text-left">Residual</th>
                      <th className="py-3 text-left">Monthly Dep.</th>
                      <th className="py-3 text-left">Accumulated</th>
                      <th className="py-3 text-left">NBV</th>
                      <th className="py-3 text-left">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredAssets.map((a) => (
                      <tr
                        key={a.asset_id}
                        className="border-b border-muted/30 dark:border-gray-700 hover:bg-background/50 transition-colors"
                      >
                        <td className="py-3 font-medium text-foreground">
                          {a.asset_number}
                        </td>
                        <td className="py-3 font-medium text-foreground">
                          {a.asset_name}
                        </td>
                        <td className="py-3 text-muted-foreground">
                          {Number(a.purchase_cost).toLocaleString()}
                        </td>
                        <td className="py-3 text-muted-foreground">
                          {Number(a.residual_value).toLocaleString()}
                        </td>
                        <td className="py-3 text-muted-foreground">
                          {Number(a.monthly_depreciation).toLocaleString()}
                        </td>
                        <td className="py-3 text-muted-foreground">
                          {Number(a.accumulated_depreciation).toLocaleString()}
                        </td>
                        <td className="py-3 text-muted-foreground">
                          {Number(a.nbv).toLocaleString()}
                        </td>
                        <td className="py-3">
                          {a.fully_depreciated ? (
                            <span className="text-xs px-2 py-1 rounded-full bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300">
                              Fully Depreciated
                            </span>
                          ) : (
                            <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300">
                              Active
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Total */}
              <div className="mt-4 text-left ml-3 font-semibold">
                Total Monthly Depreciation:{" "}
                <span className="text-primary">
                  LKR {Number(total).toLocaleString()}
                </span>
              </div>
            </>
          )}

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
              Page {page} of {Math.ceil(totalRows / limit)}
            </span>

            {/* Next Button - Right */}
            <button
              disabled={page >= Math.ceil(totalRows / limit)}
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
        </section>
      </div>
    </AdminLayout>
  );
}
