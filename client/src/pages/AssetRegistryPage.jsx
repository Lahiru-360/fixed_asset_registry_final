import { useEffect, useState, useMemo } from "react";
import axiosInstance from "../api/axiosInstance";
import AdminLayout from "../layout/AdminLayout";
import { Boxes, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useSearchParams } from "react-router-dom";

export default function AssetRegistryPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);

  const [page, setPage] = useState(Number(searchParams.get("page")) || 1);

  const [totalPages, setTotalPages] = useState(1);
  const limit = 15;

  const navigate = useNavigate();

  const [search, setSearch] = useState(searchParams.get("search") || "");

  const [categoryFilter, setCategoryFilter] = useState(
    searchParams.get("category") || "All"
  );

  const [sortOrder, setSortOrder] = useState(
    searchParams.get("sort") || "newest"
  );

  useEffect(() => {
    setSearchParams({
      page: String(page),
      search,
      category: categoryFilter,
      sort: sortOrder,
    });
  }, [page, search, categoryFilter, sortOrder]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);

      const res = await axiosInstance.get("/api/admin/assets/paginated", {
        params: {
          page,
          limit,
          search,
          category: categoryFilter,
          sort: sortOrder,
        },
      });

      setAssets(res.data.assets || []);
      setTotalPages(res.data.totalPages);
      setLoading(false);
    };

    load();
  }, [page, search, categoryFilter, sortOrder]);

  const ASSET_CATEGORIES = [
    "All",
    "Land",
    "Buildings",
    "Machinery & Equipment",
    "Vehicles",
    "Furniture & Fixtures",
    "Computer Equipment & IT",
    "Office Equipment",
  ];

  const filteredAssets = assets;

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-semibold text-foreground">
            Asset Registry
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            View and manage registered company assets
          </p>
        </div>

        {/* Card container*/}
        <section className="bg-muted border border-muted rounded-2xl p-4">
          {/* Controls */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
            <h3 className="text-lg font-semibold">All Assets</h3>

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
                value={categoryFilter}
                onChange={(e) => {
                  setPage(1);
                  setCategoryFilter(e.target.value);
                }}
              >
                {ASSET_CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>

              <select
                className="px-3 py-2 rounded-md bg-background border border-muted focus:ring-0 focus:border-primary text-foreground"
                value={sortOrder}
                onChange={(e) => {
                  setPage(1);
                  setSortOrder(e.target.value);
                }}
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
              </select>
            </div>
          </div>

          {/* Content */}
          {loading ? (
            <p className="text-sm text-muted-foreground py-8 text-center">
              Loading assets…
            </p>
          ) : filteredAssets.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground flex flex-col items-center gap-3">
              <Boxes />
              <p> No Assets found</p>
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
                      <div className="space-x-2">
                        <span className="text-xs px-2 py-1 rounded-full border border-muted text-muted-foreground">
                          {a.category_name || "Uncategorized"}
                        </span>
                        {a.fullyDepreciated ? (
                          <span className="text-xs px-2 py-1 rounded-full bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300">
                            Fully Depreciated
                          </span>
                        ) : (
                          <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300">
                            Active
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Details */}

                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Asset No:</span>
                        <span className="font-medium text-foreground">
                          {a.asset_number}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Cost:</span>
                        <span className="font-medium text-foreground">
                          LKR {Number(a.purchase_cost).toLocaleString()}
                        </span>
                      </div>

                      <div className="flex justify-between">
                        <span className="text-muted-foreground">
                          Useful Life:
                        </span>
                        <span className="text-foreground">
                          {a.useful_life} yrs
                        </span>
                      </div>

                      <div className="flex justify-between">
                        <span className="text-muted-foreground">
                          Department:
                        </span>
                        <span className="text-foreground">
                          {a.department || "—"}
                        </span>
                      </div>

                      <div className="flex justify-between pt-2 border-t border-muted text-xs">
                        <span className="text-muted-foreground">Acquired:</span>
                        <span className="text-foreground">
                          {new Date(a.acquisition_date).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex gap-2 justify-end mt-4">
                        <button
                          onClick={() =>
                            navigate(
                              `/admin/requests/${a.request_id}/quotations`
                            )
                          }
                          className="inline-flex items-center gap-1.5
      px-2.5 py-1.5
      rounded-md
      text-sm font-medium
      text-primary
      border border-primary/30
      hover:bg-primary/10
      hover:border-primary/60
      active:scale-[0.97]
      transition"
                        >
                          Quotations
                          <ChevronRight className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() =>
                            navigate(`/admin/requests/${a.request_id}/order`)
                          }
                          className="inline-flex items-center gap-1.5
      px-2.5 py-1.5
      rounded-md
      text-sm font-medium
      text-primary
      border border-primary/30
      hover:bg-primary/10
      hover:border-primary/60
      active:scale-[0.97]
      transition"
                        >
                          PO/GRN
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="hidden md:block overflow-auto">
                <table className="hidden md:table w-full min-w-[1100px] text-sm">
                  <thead className="text-xs text-muted-foreground uppercase tracking-wide">
                    <tr>
                      <th className="py-3 text-left">Asset No</th>
                      <th className="py-3 text-left">Asset</th>
                      <th className="py-3 text-left">Category</th>
                      <th className="py-3 text-left">Cost (LKR)</th>
                      <th className="py-3 text-left">Life (yrs)</th>
                      <th className="py-3 text-left">Department</th>
                      <th className="py-3 text-left">Acquired</th>
                      <th className="py-3 text-right">Status</th>
                      <th className="py-3 text-right">Review</th>
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
                          {a.category_name || "—"}
                        </td>
                        <td className="py-3 text-muted-foreground">
                          {Number(a.purchase_cost).toLocaleString()}
                        </td>
                        <td className="py-3 text-muted-foreground">
                          {a.useful_life}
                        </td>

                        <td className="py-3 text-muted-foreground">
                          {a.department || "—"}
                        </td>
                        <td className="py-3  text-muted-foreground">
                          {new Date(a.acquisition_date).toLocaleDateString()}
                        </td>
                        <td className="py-3 text-right  text-muted-foreground">
                          {a.fullyDepreciated ? (
                            <span className="text-xs px-2 py-1 rounded-full bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300">
                              Fully Depreciated
                            </span>
                          ) : (
                            <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300">
                              Active
                            </span>
                          )}
                        </td>
                        <td className="py-3 text-right  text-muted-foreground">
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() =>
                                navigate(
                                  `/admin/requests/${a.request_id}/quotations`
                                )
                              }
                              className="
      inline-flex items-center gap-1.5
      px-2.5 py-1.5
      rounded-md
      text-sm font-medium
      text-primary
      border border-primary/30
      hover:bg-primary/10
      hover:border-primary/60
      active:scale-[0.97]
      transition
    "
                            >
                              Quotations
                              <ChevronRight className="w-4 h-4" />
                            </button>

                            <button
                              onClick={() =>
                                navigate(
                                  `/admin/requests/${a.request_id}/order`
                                )
                              }
                              className="
      inline-flex items-center gap-1.5
      px-2.5 py-1.5
      rounded-md
      text-sm font-medium
      text-primary
      border border-primary/30
      hover:bg-primary/10
      hover:border-primary/60
      active:scale-[0.97]
      transition
    "
                            >
                              PO / GRN
                              <ChevronRight className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
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
