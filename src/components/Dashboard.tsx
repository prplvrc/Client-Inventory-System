import { useEffect, useState } from "react";
import { Skeleton } from "./LoadingSkeleton";
import {
  AlertTriangle,
  Info,
  TrendingUp,
  ArrowLeftRight,
  ShoppingBag,
  Calculator,
} from "lucide-react";

import PageHeader from "./ui/PageHeader";
import { apiRequest } from "../services/api";
import { useBranch } from "../hooks/useBranch";

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
  const { selectedBranchId } = useBranch();

  const [dashboard, setDashboard] =
    useState<DashboardResponse | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Load dashboard data
  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        setError("");

        const params = new URLSearchParams();

        // ALL means no branch restriction
        if (selectedBranchId !== "ALL" && selectedBranchId) {
          params.append(
            "branchId",
            String(selectedBranchId)
          );
        }

        const queryString = params.toString();

        const endpoint = `/dashboard${
          queryString ? `?${queryString}` : ""
        }`;

        const result =
          await apiRequest<DashboardResponse>(endpoint);

        setDashboard(result);
      } catch (err) {
        console.error("Fetch dashboard error:", err);

        setError(
          err instanceof Error
            ? err.message
            : "Unable to load dashboard data. Please try again later."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, [selectedBranchId]);

  // Use empty metrics while loading
  const metrics = dashboard?.metrics ?? {
    todaySales: 0,
    transactions: 0,
    itemsSold: 0,
    averageTransaction: 0,
  };

  return (
    <div className="w-full p-4 sm:p-6">

      {/* PAGE HEADER */}
      <PageHeader
        title="Dashboard"
        description="Today's sales, inventory, and business overview."
      />

      {/* ERROR */}
      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-700">
          {error}
        </div>
      )}

      {/* METRICS */}
      <div className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">

        <MetricCard
          value={metrics.todaySales}
          label="Today's Sales"
          prefix="₱"
          icon={
            <TrendingUp
              size={17}
              className="text-[#64748B]"
            />
          }
          loading={loading}
        />

        <MetricCard
          value={metrics.transactions}
          label="Transactions"
          icon={
            <ArrowLeftRight
              size={17}
              className="text-[#64748B]"
            />
          }
          loading={loading}
        />

        <MetricCard
          value={metrics.itemsSold}
          label="Items Sold"
          icon={
            <ShoppingBag
              size={17}
              className="text-[#64748B]"
            />
          }
          loading={loading}
        />

        <MetricCard
          value={metrics.averageTransaction}
          label="Average Transaction"
          prefix="₱"
          icon={
            <Calculator
              size={17}
              className="text-[#64748B]"
            />
          }
          loading={loading}
        />

      </div>

      {/* MAIN DASHBOARD */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">

        {/* SALES OVERVIEW */}
        <section className="overflow-hidden rounded-xl border border-[#E5E7EB] bg-white lg:col-span-6">

          <SectionHeader title="Sales Overview" />

          <div className="p-4">
            {loading ? (
              <SalesOverviewSkeleton />
            ) : (
              <SalesOverviewChart
                data={dashboard?.salesOverview ?? []}
              />
            )}
          </div>

        </section>

        {/* INVENTORY ALERTS */}
        <section className="overflow-hidden rounded-xl border border-[#E5E7EB] bg-white lg:col-span-3">

          <SectionHeader title="Inventory Alerts" />

          <div className="min-h-[230px] p-4">

            {loading ? (
              <InventoryAlertsSkeleton />
            ) : dashboard?.inventoryAlerts?.length ? (

              <div className="space-y-2.5">

                {dashboard.inventoryAlerts.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between gap-2 rounded-lg border border-red-200 bg-red-50/70 p-2.5"
                  >
                    <div className="flex min-w-0 items-center gap-2">

                      <AlertTriangle
                        size={14}
                        className="shrink-0 text-red-600"
                        aria-hidden="true"
                      />

                      <span className="truncate text-xs font-medium text-[#1F2937]">
                        {item.ingredient}
                      </span>

                    </div>

                    <span className="shrink-0 text-xs font-semibold text-red-600">
                      {item.currentStock}{" "}
                      {item.unit || ""}
                    </span>
                  </div>
                ))}

              </div>

            ) : (

              <div className="flex h-44 items-center justify-center text-xs text-[#64748B]">
                No low-stock items.
              </div>

            )}

          </div>
        </section>

        {/* TOP-SELLING PRODUCTS */}
        <section className="overflow-hidden rounded-xl border border-[#E5E7EB] bg-white lg:col-span-3">

          <SectionHeader title="Top Selling Products" />

          <div className="flex min-h-[230px] items-center justify-center p-4">

            {loading ? (
              <TopProductsSkeleton />
            ) : (
              <TopProductsChart
                data={
                  dashboard?.topSellingProducts ?? []
                }
              />
            )}

          </div>
        </section>

        {/* RECOMMENDATIONS */}
        <section className="overflow-hidden rounded-xl border border-[#E5E7EB] bg-white lg:col-span-12">

          <SectionHeader title="Recommendations" />

          <div className="p-4">

            {loading ? (
              <RecommendationsSkeleton />
            ) : dashboard?.recommendations?.length ? (

              <div className="space-y-2.5">

                {dashboard.recommendations.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-start gap-2.5 rounded-lg border border-[#E5E7EB] bg-[#F8F7F2]/60 p-3"
                  >

                    {item.type === "prepare" && (
                      <AlertTriangle
                        size={15}
                        className="mt-0.5 shrink-0 text-amber-500"
                        aria-hidden="true"
                      />
                    )}

                    {item.type === "restock" && (
                      <AlertTriangle
                        size={15}
                        className="mt-0.5 shrink-0 text-red-500"
                        aria-hidden="true"
                      />
                    )}

                    {item.type === "info" && (
                      <Info
                        size={15}
                        className="mt-0.5 shrink-0 text-blue-500"
                        aria-hidden="true"
                      />
                    )}

                    <span className="text-xs leading-5 text-[#1F2937]">
                      {item.message}
                    </span>

                  </div>
                ))}

              </div>

            ) : (

              <div className="flex h-20 items-center justify-center text-xs text-[#64748B]">
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
   SECTION HEADER
========================================================= */

function SectionHeader({
  title,
}: {
  title: string;
}) {
  return (
    <div className="border-b border-[#E5E7EB] bg-[#F8F7F2] px-4 py-3">
      <h2 className="text-[10px] font-semibold uppercase tracking-wider text-[#64748B]">
        {title}
      </h2>
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
    <div className="rounded-xl border border-[#E5E7EB] bg-white p-4">

      {loading ? (

        <div
          className="flex items-center justify-between"
          aria-label="Loading metric"
          role="status"
        >
          <div className="space-y-2">
            <Skeleton className="h-7 w-24" />
            <Skeleton className="h-3 w-24" />
          </div>

          <Skeleton className="h-9 w-9 rounded-full" />

          <span className="sr-only">
            Loading metric...
          </span>
        </div>

      ) : (

        <div className="flex items-center justify-between">

          <div>
            <p className="text-xl font-semibold tracking-tight text-[#1F2937]">
              {prefix}
              {Number(value).toLocaleString("en-PH", {
                minimumFractionDigits: prefix ? 2 : 0,
                maximumFractionDigits: prefix ? 2 : 0,
              })}
            </p>

            <p className="mt-1 text-xs font-medium text-[#64748B]">
              {label}
            </p>
          </div>

          {icon && (
            <div className="rounded-lg border border-[#E5E7EB] bg-[#F8F7F2] p-2.5">
              {icon}
            </div>
          )}

        </div>

      )}

    </div>
  );
}

/* =========================================================
   SALES OVERVIEW SKELETON
========================================================= */

function SalesOverviewSkeleton() {
  const heights = [
    35,
    52,
    43,
    66,
    78,
    91,
    60,
  ];

  return (
    <div
      className="flex h-50 items-end gap-3 border-b border-l border-[#E5E7EB] px-3 pb-6 pt-3"
      role="status"
    >
      {heights.map((height, index) => (
        <Skeleton
          key={index}
          className="flex-1 rounded-b-none"
          style={{
            height: `${height}%`,
          }}
        />
      ))}

      <span className="sr-only">
        Loading sales overview chart...
      </span>
    </div>
  );
}

/* =========================================================
   INVENTORY ALERTS SKELETON
========================================================= */

function InventoryAlertsSkeleton() {
  return (
    <div className="space-y-2.5" role="status">

      {Array.from(
        { length: 4 },
        (_, index) => (
          <div
            key={index}
            className="flex items-center justify-between rounded-lg border border-[#E5E7EB] bg-[#F8F7F2]/60 p-2.5"
          >
            <div className="flex items-center gap-2">

              <Skeleton className="h-3.5 w-3.5 rounded-full" />

              <Skeleton className="h-3 w-20" />

            </div>

            <Skeleton className="h-3 w-9" />
          </div>
        )
      )}

      <span className="sr-only">
        Loading inventory alerts...
      </span>
    </div>
  );
}

/* =========================================================
   TOP PRODUCTS SKELETON
========================================================= */

function TopProductsSkeleton() {
  return (
    <div
      className="flex h-45 items-center justify-center"
      role="status"
    >
      <div
        aria-hidden="true"
        className="h-37.5 w-37.5 animate-pulse rounded-full"
        style={{
          background:
            "conic-gradient(#d1d5db 0deg 105deg, #e5e7eb 105deg 180deg, #cbd5e1 180deg 245deg, #e5e7eb 245deg 305deg, #d1d5db 305deg 360deg)",
        }}
      />

      <span className="sr-only">
        Loading top products chart...
      </span>
    </div>
  );
}

/* =========================================================
   RECOMMENDATIONS SKELETON
========================================================= */

function RecommendationsSkeleton() {
  return (
    <div className="space-y-2.5" role="status">

      {Array.from(
        { length: 3 },
        (_, index) => (
          <div
            key={index}
            className="flex items-start gap-2.5 rounded-lg border border-[#E5E7EB] bg-[#F8F7F2]/60 p-3"
          >
            <Skeleton className="mt-0.5 h-4 w-4 shrink-0 rounded-full" />

            <div className="flex-1 space-y-2">
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-2/3" />
            </div>
          </div>
        )
      )}

      <span className="sr-only">
        Loading recommendations...
      </span>
    </div>
  );
}

/* =========================================================
   SALES OVERVIEW CHART
========================================================= */

function SalesOverviewChart({
  data,
}: {
  data: SalesOverview[];
}) {
  const width = 600;
  const height = 200;

  const paddingLeft = 30;
  const paddingRight = 10;
  const paddingTop = 15;
  const paddingBottom = 35;

  const chartWidth =
    width - paddingLeft - paddingRight;

  const chartHeight =
    height - paddingTop - paddingBottom;

  if (!data.length) {
    return (
      <div className="flex h-50 items-center justify-center text-xs text-[#64748B]">
        No sales data available.
      </div>
    );
  }

  const maxSales = Math.max(
    ...data.map((item) => item.sales),
    1
  );

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className="h-50 w-full"
      role="img"
      aria-label="Sales overview chart"
    >
      {data.map((item, index) => {
        const barWidth =
          chartWidth /
          Math.max(data.length * 1.6, 1);

        const gap =
          chartWidth /
          Math.max(data.length, 1);

        const x =
          paddingLeft +
          index * gap +
          (gap - barWidth) / 2;

        const barHeight =
          (item.sales / maxSales) *
          chartHeight;

        const y =
          paddingTop +
          chartHeight -
          barHeight;

        return (
          <g key={`${item.day}-${index}`}>

            <rect
              x={x}
              y={y}
              width={barWidth}
              height={barHeight}
              rx="4"
              className="fill-[#292A24] transition hover:opacity-75"
            />

            <text
              x={x + barWidth / 2}
              y={height - 10}
              textAnchor="middle"
              fontSize="10"
              className="fill-[#64748B]"
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
   TOP-SELLING PRODUCTS CHART
========================================================= */

function TopProductsChart({
  data,
}: {
  data: TopSellingProduct[];
}) {
  const total = data.reduce(
    (sum, item) => sum + item.quantity,
    0
  );

  if (!data.length || total === 0) {
    return (
      <div className="flex h-45 items-center justify-center text-xs text-[#64748B]">
        No sales data available.
      </div>
    );
  }

  const center = 75;
  const radius = 60;

  /*
   * Pre-calculate slices using reduce
   * to keep the calculation pure.
   */
  const slices = data
    .slice(0, 5)
    .reduce<
      Array<TopSellingProduct & { path: string }>
    >((acc, item) => {
      const currentAngle = acc.reduce(
        (sum, prev) => {
          const percentage =
            prev.quantity / total;

          return (
            sum + percentage * 360
          );
        },
        0
      );

      const percentage =
        item.quantity / total;

      const angle =
        percentage * 360;

      const startAngle = currentAngle;
      const endAngle =
        currentAngle + angle;

      const path = createPieSlice(
        center,
        center,
        radius,
        startAngle,
        endAngle
      );

      acc.push({
        ...item,
        path,
      });

      return acc;
    }, []);

  const pieClasses = [
    "fill-[#292A24]",
    "fill-[#4B4C45]",
    "fill-[#74756D]",
    "fill-[#A1A29A]",
    "fill-[#C9C9C1]",
  ];

  return (
    <div className="flex h-45 items-center justify-center">

      <svg
        viewBox="0 0 150 150"
        className="h-37.5 w-37.5"
        role="img"
        aria-label="Top selling products chart"
      >
        {slices.map((slice, index) => (
          <path
            key={slice.product}
            d={slice.path}
            className={
              pieClasses[
                index % pieClasses.length
              ]
            }
            stroke="white"
            strokeWidth="1.5"
          />
        ))}
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
  const start = polarToCartesian(
    centerX,
    centerY,
    radius,
    endAngle
  );

  const end = polarToCartesian(
    centerX,
    centerY,
    radius,
    startAngle
  );

  const largeArcFlag =
    endAngle - startAngle <= 180
      ? "0"
      : "1";

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

/* =========================================================
   POLAR COORDINATE HELPER
========================================================= */

function polarToCartesian(
  centerX: number,
  centerY: number,
  radius: number,
  angleInDegrees: number
) {
  const angleInRadians =
    ((angleInDegrees - 90) * Math.PI) /
    180;

  return {
    x:
      centerX +
      radius *
        Math.cos(angleInRadians),

    y:
      centerY +
      radius *
        Math.sin(angleInRadians),
  };
}

export default Dashboard;