import { useEffect, useState, useMemo } from "react";
import axiosInstance from "../api/axiosInstance";
import AdminLayout from "../layout/AdminLayout";

export default function SOFPPage() {
  const now = new Date();

  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);

  const [data, setData] = useState(null);
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [loading, setLoading] = useState(true);

  // UI-only state
  const [search, setSearch] = useState("");

  const load = async () => {
    setLoading(true);
    const res = await axiosInstance.get(
      `/api/admin/sofp?year=${year}&month=${month}`
    );

    setData(res.data);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, [year, month]);

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-semibold text-foreground">
            Statement of Financial Position
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            As at end of{" "}
            {new Date(year, month - 1).toLocaleString("default", {
              month: "long",
            })}{" "}
            {year}
          </p>
        </div>

        {/* Card container */}
        <section className="bg-muted border border-muted rounded-2xl p-4">
          {/* Controls */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
            <h3 className="text-lg font-semibold">SOFP Summary</h3>

            <div className="flex flex-wrap items-center gap-3">
              <select
                value={month}
                onChange={(e) => setMonth(Number(e.target.value))}
                className="px-3 py-2 rounded-md bg-background border border-muted focus:ring-0 focus:border-primary text-foreground"
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
                value={year}
                onChange={(e) => setYear(Number(e.target.value))}
                className="px-3 py-2 rounded-md bg-background border border-muted focus:ring-0 focus:border-primary text-foreground"
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
                    `/api/admin/sofp/pdf?year=${year}&month=${month}`,
                    { responseType: "blob" }
                  );

                  const url = window.URL.createObjectURL(new Blob([res.data]));
                  const a = document.createElement("a");
                  a.href = url;
                  a.download = `SOFP-${year}-${String(month).padStart(
                    2,
                    "0"
                  )}.pdf`;

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
              Loading SOFP…
            </p>
          ) : data.categories.length === 0 ? (
            <p className="text-sm text-muted-foreground py-8 text-center">
              No categories found
            </p>
          ) : (
            <>
              {/* 📱 MOBILE CARD VIEW */}
              <div className="block md:hidden space-y-4">
                {data.categories.map((c) => (
                  <div
                    key={c.category}
                    className="p-4 bg-background border border-muted rounded-lg shadow-sm"
                  >
                    {/* Header */}
                    <h3 className="font-semibold text-foreground mb-3">
                      {c.category}
                    </h3>

                    {/* Values */}
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">
                          Total Cost:
                        </span>
                        <span className="font-medium text-foreground">
                          LKR {c.total_cost.toLocaleString()}
                        </span>
                      </div>

                      <div className="flex justify-between">
                        <span className="text-muted-foreground">
                          Accumulated Depreciation:
                        </span>
                        <span className="text-foreground">
                          LKR {c.accumulated_depreciation.toLocaleString()}
                        </span>
                      </div>

                      <div className="flex justify-between pt-2 border-t border-muted">
                        <span className="text-muted-foreground">NBV:</span>
                        <span className="font-semibold text-foreground">
                          LKR {c.nbv.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="hidden md:block overflow-auto rounded-xl">
                <table className="w-full min-w-[800px] text-sm">
                  <thead className="text-xs text-muted-foreground uppercase tracking-wide">
                    <tr>
                      <th className="py-3 text-left">Category</th>
                      <th className="py-3 text-right">Cost</th>
                      <th className="py-3 text-right">Accumulated Dep.</th>
                      <th className="py-3 text-right">NBV</th>
                    </tr>
                  </thead>

                  <tbody>
                    {data.categories.map((c) => (
                      <tr
                        key={c.category}
                        className="border-b border-muted/30 dark:border-gray-700 hover:bg-background/50 transition-colors"
                      >
                        <td className="py-3 font-medium text-foreground">
                          {c.category}
                        </td>
                        <td className="py-3 text-right text-muted-foreground">
                          {c.total_cost.toLocaleString()}
                        </td>
                        <td className="py-3 text-right text-muted-foreground">
                          {c.accumulated_depreciation.toLocaleString()}
                        </td>
                        <td className="py-3 text-right text-muted-foreground">
                          {c.nbv.toLocaleString()}
                        </td>
                      </tr>
                    ))}

                    {/* Totals */}
                    <tr className="border-t font-semibold bg-muted/50">
                      <td className="py-3">Total Assets</td>
                      <td className="py-3 text-right">
                        {data.totals.total_cost.toLocaleString()}
                      </td>
                      <td className="py-3 text-right">
                        {data.totals.accumulated_depreciation.toLocaleString()}
                      </td>
                      <td className="py-3 text-right">
                        {data.totals.nbv.toLocaleString()}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </>
          )}
        </section>
      </div>
    </AdminLayout>
  );
}
