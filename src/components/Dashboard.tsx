import { useEffect, useState } from "react";
import {
  AlertTriangle,
  Info,
  TrendingUp,
  Receipt,
  ShoppingBag,
  CircleDollarSign,
} from "lucide-react";

interface DashboardMetrics {
  todaySales: number;
  transactions: number;
  itemsSold: number;
  averageTransaction: number;
}

interface SalesOverview {
  day: string;
  sales: number;
}

interface InventoryAlert {
  id: number;
  ingredient: string;
  currentStock: number;
  unit?: string;
}

interface TopSellingProduct {
  product: string;
  quantity: number;
}

interface Recommendation {
  id: number;
  type: "prepare" | "restock" | "info";
  message: string;
}

interface DashboardResponse {
  metrics: DashboardMetrics;
  salesOverview: SalesOverview[];
  inventoryAlerts: InventoryAlert[];
  topSellingProducts: TopSellingProduct[];
  recommendations: Recommendation[];
}

function Dashboard() {
  const [dateTime, setDateTime] = useState(new Date());

  const [dashboard, setDashboard] = useState<DashboardResponse | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // =========================
  // REAL-TIME CLOCK
  // =========================

  useEffect(() => {
    const timer = setInterval(() => {
      setDateTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // =========================
  // FETCH DASHBOARD
  // =========================

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        setError("");

        const apiUrl = import.meta.env.VITE_API_URL;

        if (!apiUrl) {
          throw new Error("VITE_API_URL is not configured.");
        }

        const response = await fetch(`${apiUrl}/dashboard`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch dashboard: ${response.status}`);
        }

        const result: DashboardResponse = await response.json();
        setDashboard(result);
      } catch (err) {
        console.error("Fetch dashboard error:", err);
        setError("Unable to load dashboard data.");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  // =========================
  // DEFAULT VALUES
  // =========================

  const metrics = dashboard?.metrics ?? {
    todaySales: 0,
    transactions: 0,
    itemsSold: 0,
    averageTransaction: 0,
  };

  return (
    <div className="w-full p-4 sm:p-6">
      {/* =========================
          HEADER
      ========================= */}

      <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold uppercase tracking-tight text-gray-900">
            Dashboard
          </h1>

          <p className="text-xs text-gray-500">
            Good Day, Admin! Here is today's overview.
          </p>
        </div>

        <div className="flex items-center gap-4 text-xs font-medium text-gray-600">
          <span>
            DATE:{" "}
            {dateTime.toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </span>

          <span>
            TIME:{" "}
            {dateTime.toLocaleTimeString("en-US", {
              hour12: false,
            })}
          </span>
        </div>
      </div>

      {/* =========================
          ERROR
      ========================= */}

      {error && (
        <div className="mb-4 rounded-md border border-red-200 bg-red-50 p-3 text-xs text-red-600">
          {error}
        </div>
      )}

      {/* =========================
          METRICS
      ========================= */}

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          value={metrics.todaySales}
          label="Today's Sales"
          prefix="₱"
          icon={<TrendingUp size={18} className="text-gray-500" />}
          loading={loading}
        />

        <MetricCard
          value={metrics.transactions}
          label="Transactions"
          icon={<Receipt size={18} className="text-gray-500" />}
          loading={loading}
        />

        <MetricCard
          value={metrics.itemsSold}
          label="Items Sold"
          icon={<ShoppingBag size={18} className="text-gray-500" />}
          loading={loading}
        />

        <MetricCard
          value={metrics.averageTransaction}
          label="Average Transaction"
          prefix="₱"
          icon={<CircleDollarSign size={18} className="text-gray-500" />}
          loading={loading}
        />
      </div>

      {/* =========================
          MAIN DASHBOARD
      ========================= */}

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
        {/* =========================
            SALES OVERVIEW
        ========================= */}

        <section className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm lg:col-span-6">
          <div className="border-b border-gray-200 bg-gray-50/50 px-4 py-3 text-xs font-bold uppercase tracking-wider text-gray-700">
            Sales Overview
          </div>

          <div className="p-4">
            {loading ? (
              <div className="flex h-50 items-center justify-center text-xs text-gray-500">
                Loading sales overview...
              </div>
            ) : (
              <SalesOverviewChart data={dashboard?.salesOverview ?? []} />
            )}
          </div>
        </section>

        {/* =========================
            INVENTORY ALERT
        ========================= */}

        <section className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm lg:col-span-3">
          <div className="border-b border-gray-200 bg-gray-50/50 px-4 py-3 text-xs font-bold uppercase tracking-wider text-gray-700">
            Inventory Alerts
          </div>

          <div className="p-4 min-h-57.5">
            {loading ? (
              <div className="flex h-44 items-center justify-center text-xs text-gray-500">
                Loading alerts...
              </div>
            ) : dashboard?.inventoryAlerts?.length ? (
              <div className="space-y-2.5">
                {dashboard.inventoryAlerts.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between rounded-md border border-red-200 bg-red-50/60 p-2.5 text-xs text-red-800"
                  >
                    <div className="flex items-center gap-2">
                      <AlertTriangle size={14} className="shrink-0 text-red-600" />
                      <span className="font-medium text-gray-800">{item.ingredient}</span>
                    </div>

                    <span className="font-bold text-red-600">
                      {item.currentStock} {item.unit || ""}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex h-44 items-center justify-center text-xs text-gray-500">
                No low-stock items.
              </div>
            )}
          </div>
        </section>

        {/* =========================
            TOP SELLING PRODUCTS
        ========================= */}

        <section className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm lg:col-span-3">
          <div className="border-b border-gray-200 bg-gray-50/50 px-4 py-3 text-xs font-bold uppercase tracking-wider text-gray-700">
            Top Selling Products
          </div>

          <div className="p-4 min-h-57.5 flex items-center justify-center">
            {loading ? (
              <div className="text-xs text-gray-500">Loading top products...</div>
            ) : (
              <TopProductsChart data={dashboard?.topSellingProducts ?? []} />
            )}
          </div>
        </section>

        {/* =========================
            RECOMMENDATIONS
        ========================= */}

        <section className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm lg:col-span-12">
          <div className="border-b border-gray-200 bg-gray-50/50 px-4 py-3 text-xs font-bold uppercase tracking-wider text-gray-700">
            Recommendations
          </div>

          <div className="p-4">
            {loading ? (
              <div className="flex h-20 items-center justify-center text-xs text-gray-500">
                Loading recommendations...
              </div>
            ) : dashboard?.recommendations?.length ? (
              <div className="space-y-2.5">
                {dashboard.recommendations.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-start gap-2.5 rounded-md border border-gray-200 bg-gray-50/50 p-3 text-xs text-gray-700"
                  >
                    {item.type === "prepare" && (
                      <AlertTriangle size={15} className="mt-0.5 shrink-0 text-amber-500" />
                    )}

                    {item.type === "restock" && (
                      <AlertTriangle size={15} className="mt-0.5 shrink-0 text-red-500" />
                    )}

                    {item.type === "info" && (
                      <Info size={15} className="mt-0.5 shrink-0 text-blue-500" />
                    )}

                    <span>{item.message}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex h-20 items-center justify-center text-xs text-gray-500">
                No recommendations available.
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

/* =========================================================
   METRIC CARD
========================================================= */

function MetricCard({
  value,
  label,
  prefix = "",
  icon,
  loading,
}: {
  value: number;
  label: string;
  prefix?: string;
  icon?: React.ReactNode;
  loading: boolean;
}) {
  return (
    <div className="overflow-hidden rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
      {loading ? (
        <div className="h-16 animate-pulse rounded bg-gray-100" />
      ) : (
        <div className="flex items-center justify-between">
          <div>
            <p className="text-2xl font-bold text-gray-900">
              {prefix}
              {Number(value).toLocaleString("en-PH", {
                minimumFractionDigits: prefix ? 2 : 0,
                maximumFractionDigits: prefix ? 2 : 0,
              })}
            </p>

            <p className="mt-1 text-xs text-gray-500 font-medium">{label}</p>
          </div>

          {icon && <div className="rounded-full bg-gray-50 p-2.5 border border-gray-100">{icon}</div>}
        </div>
      )}
    </div>
  );
}

/* =========================================================
   SALES OVERVIEW CHART
========================================================= */

function SalesOverviewChart({ data }: { data: SalesOverview[] }) {
  const width = 600;
  const height = 200;

  const paddingLeft = 30;
  const paddingRight = 10;
  const paddingTop = 15;
  const paddingBottom = 35;

  const chartWidth = width - paddingLeft - paddingRight;
  const chartHeight = height - paddingTop - paddingBottom;

  if (!data.length) {
    return (
      <div className="flex h-50 items-center justify-center text-xs text-gray-500">
        No sales data available.
      </div>
    );
  }

  const maxSales = Math.max(...data.map((item) => item.sales), 1);

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="h-50 w-full">
      {data.map((item, index) => {
        const barWidth = chartWidth / Math.max(data.length * 1.6, 1);
        const gap = chartWidth / Math.max(data.length, 1);
        const x = paddingLeft + index * gap + (gap - barWidth) / 2;
        const barHeight = (item.sales / maxSales) * chartHeight;
        const y = paddingTop + chartHeight - barHeight;

        return (
          <g key={`${item.day}-${index}`}>
            <rect
              x={x}
              y={y}
              width={barWidth}
              height={barHeight}
              rx="4"
              className="fill-gray-800 hover:fill-gray-600 transition"
            />

            <text
              x={x + barWidth / 2}
              y={height - 10}
              textAnchor="middle"
              fontSize="10"
              className="fill-gray-500"
            >
              {item.day}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

/* =========================================================
   TOP SELLING PRODUCTS PIE CHART
========================================================= */

function TopProductsChart({ data }: { data: TopSellingProduct[] }) {
  const total = data.reduce((sum, item) => sum + item.quantity, 0);

  if (!data.length || total === 0) {
    return (
      <div className="flex h-45 items-center justify-center text-xs text-gray-500">
        No sales data available.
      </div>
    );
  }

  const center = 75;
  const radius = 60;

  let currentAngle = 0;

  return (
    <div className="flex h-45 items-center justify-center">
      <svg viewBox="0 0 150 150" className="h-37.5 w-37.5">
        {data.slice(0, 5).map((item, index) => {
          const percentage = item.quantity / total;
          const angle = percentage * 360;

          const startAngle = currentAngle;
          const endAngle = currentAngle + angle;

          currentAngle = endAngle;

          const path = createPieSlice(center, center, radius, startAngle, endAngle);

          const pieClasses = [
            "fill-gray-900",
            "fill-gray-700",
            "fill-gray-500",
            "fill-gray-400",
            "fill-gray-300",
          ];

          return (
            <path
              key={item.product}
              d={path}
              className={pieClasses[index % pieClasses.length]}
              stroke="white"
              strokeWidth="1.5"
            />
          );
        })}
      </svg>
    </div>
  );
}

/* =========================================================
   PIE CHART HELPER
========================================================= */

function createPieSlice(
  centerX: number,
  centerY: number,
  radius: number,
  startAngle: number,
  endAngle: number
) {
  const start = polarToCartesian(centerX, centerY, radius, endAngle);
  const end = polarToCartesian(centerX, centerY, radius, startAngle);

  const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";

  return [
    "M",
    centerX,
    centerY,
    "L",
    start.x,
    start.y,
    "A",
    radius,
    radius,
    0,
    largeArcFlag,
    0,
    end.x,
    end.y,
    "Z",
  ].join(" ");
}

function polarToCartesian(
  centerX: number,
  centerY: number,
  radius: number,
  angleInDegrees: number
) {
  const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180;

  return {
    x: centerX + radius * Math.cos(angleInRadians),
    y: centerY + radius * Math.sin(angleInRadians),
  };
}

export default Dashboard;