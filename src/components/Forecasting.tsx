import { useEffect, useState } from "react";
import {
  SlidersHorizontal,
  Package,
} from "lucide-react";

import { TableSkeleton } from "./LoadingSkeleton";
import { FORECAST_API_URL } from "../services/api";
import PageHeader from "./ui/PageHeader";
import { useBranch } from "../hooks/useBranch";

interface ForecastSummary {
  period: string;
  sales: number;
  forecastedDemand: number;
}

interface ForecastProduct {
  product: string;
  recentAverage: number;
  forecast: number;
  currentStock: number;
  suggestedPreparation: number;
}

interface HistoricalSale {
  period: string;
  sales: number;
}

interface ForecastResponse {
  summary: ForecastSummary[];
  historicalSales: HistoricalSale[];
  products: ForecastProduct[];
}

function Forecasting() {
  const { selectedBranchId } = useBranch();

  const [period, setPeriod] = useState("next-day");
  const [product, setProduct] = useState("all");

  const [data, setData] =
    useState<ForecastResponse | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Fetch forecast data
  useEffect(() => {
    // Forecasting requires a specific branch.
    if (selectedBranchId === "ALL") {
      setData(null);
      setError("");
      setLoading(false);
      return;
    }

    const fetchForecast = async () => {
      try {
        setLoading(true);
        setError("");

        if (!FORECAST_API_URL) {
          throw new Error(
            "FORECAST_API_URL is not configured."
          );
        }

        const params = new URLSearchParams();

        params.append("period", period);
        params.append("product", product);
        params.append(
          "branchId",
          String(selectedBranchId)
        );

        const response = await fetch(
          `${FORECAST_API_URL}/forecast?${params.toString()}`
        );

        if (!response.ok) {
          throw new Error(
            "Failed to fetch forecast data."
          );
        }

        const result: ForecastResponse =
          await response.json();

        setData(result);
      } catch (err) {
        console.error(
          "Forecast fetch error:",
          err
        );

        setError(
          err instanceof Error
            ? err.message
            : "Unable to load forecasting data."
        );

        setData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchForecast();
  }, [period, product, selectedBranchId]);

  return (
    <div className="w-full p-4 sm:p-6">

      {/* PAGE HEADER */}
      <PageHeader
        title="Demand Forecasting"
        description="View forecasted demand and inventory preparation requirements."
      />

      {/* FILTER TOOLBAR */}
      <div className="mb-4 flex flex-col gap-3 rounded-xl border border-[#E5E7EB] bg-white p-3 sm:flex-row sm:flex-wrap sm:items-center">

        <div className="flex items-center gap-2">
          <SlidersHorizontal
            size={14}
            className="text-[#64748B]"
            aria-hidden="true"
          />

          <label
            htmlFor="period-select"
            className="text-xs font-medium text-[#1F2937]"
          >
            Forecast Period
          </label>

          <select
            id="period-select"
            value={period}
            onChange={(e) =>
              setPeriod(e.target.value)
            }
            className="rounded-lg border border-[#E5E7EB] bg-white px-2.5 py-1.5 text-xs text-[#1F2937] outline-none transition focus:border-[#292A24] focus:ring-1 focus:ring-[#292A24]"
          >
            <option value="next-day">
              Next Day
            </option>
            <option value="next-week">
              Next Week
            </option>
            <option value="next-month">
              Next Month
            </option>
          </select>
        </div>

        <div className="hidden h-5 w-px bg-[#E5E7EB] sm:block" />

        <div className="flex items-center gap-2">
          <Package
            size={14}
            className="text-[#64748B]"
            aria-hidden="true"
          />

          <label
            htmlFor="product-select"
            className="text-xs font-medium text-[#1F2937]"
          >
            Product
          </label>

          <select
            id="product-select"
            value={product}
            onChange={(e) =>
              setProduct(e.target.value)
            }
            className="rounded-lg border border-[#E5E7EB] bg-white px-2.5 py-1.5 text-xs text-[#1F2937] outline-none transition focus:border-[#292A24] focus:ring-1 focus:ring-[#292A24]"
          >
            <option value="all">
              All Products
            </option>
            <option value="goto">
              Goto
            </option>
            <option value="pares">
              Pares
            </option>
            <option value="tapa">
              Tapa
            </option>
          </select>
        </div>
      </div>

      {/* ERROR */}
      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-700">
          {error}
        </div>
      )}

      {/* ALL BRANCHES MESSAGE */}
      {selectedBranchId === "ALL" && (
        <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-700">
          Select Branch 1 or Branch 2 to view
          forecasting.
        </div>
      )}

      {/* TOP GRID */}
      <div className="mb-5 grid grid-cols-1 gap-4 lg:grid-cols-2">

        {/* FORECAST SUMMARY */}
        <section className="overflow-hidden rounded-xl border border-[#E5E7EB] bg-white">

          <SectionHeader title="Forecast Summary" />

          <div className="min-h-[280px] overflow-x-auto">

            {loading ? (
              <ForecastSummarySkeleton />
            ) : data?.summary?.length ? (

              <table className="w-full border-collapse text-left text-xs text-[#1F2937]">

                <thead className="border-b border-[#E5E7EB] bg-[#F8F7F2] text-[10px] font-semibold uppercase tracking-wider text-[#64748B]">
                  <tr>
                    <th className="border-r border-[#E5E7EB] px-4 py-3">
                      Period
                    </th>

                    <th className="border-r border-[#E5E7EB] px-4 py-3 text-right">
                      Sales
                    </th>

                    <th className="px-4 py-3 text-right">
                      Forecasted Demand
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-[#E5E7EB]">

                  {data.summary.map(
                    (item, index) => (
                      <tr
                        key={index}
                        className="transition hover:bg-[#F8F7F2]/70"
                      >
                        <td className="border-r border-[#E5E7EB] px-4 py-3 font-medium text-[#1F2937]">
                          {item.period}
                        </td>

                        <td className="border-r border-[#E5E7EB] px-4 py-3 text-right text-[#64748B]">
                          {item.sales}
                        </td>

                        <td className="px-4 py-3 text-right font-semibold text-[#1F2937]">
                          {item.forecastedDemand}
                        </td>
                      </tr>
                    )
                  )}

                </tbody>
              </table>

            ) : (

              <div className="flex h-64 items-center justify-center text-xs text-[#64748B]">
                No forecast data available.
              </div>

            )}

          </div>
        </section>

        {/* HISTORICAL SALES */}
        <section className="overflow-hidden rounded-xl border border-[#E5E7EB] bg-white">

          <SectionHeader title="Historical Sales" />

          <div className="flex min-h-[280px] items-center justify-center p-4">

            {loading ? (
              <HistoricalSalesChartSkeleton />
            ) : data?.historicalSales?.length ? (
              <SalesChart
                data={data.historicalSales}
              />
            ) : (
              <div className="text-xs text-[#64748B]">
                No historical sales available.
              </div>
            )}

          </div>
        </section>

      </div>

      {/* PRODUCT FORECAST */}
      <section className="overflow-hidden rounded-xl border border-[#E5E7EB] bg-white">

        <SectionHeader title="Product Forecast" />

        <div className="overflow-x-auto">

          <table className="w-full border-collapse text-left text-xs text-[#1F2937]">

            <thead className="border-b border-[#E5E7EB] bg-[#F8F7F2] text-[10px] font-semibold uppercase tracking-wider text-[#64748B]">
              <tr>

                <th className="border-r border-[#E5E7EB] px-4 py-3">
                  Product
                </th>

                <th className="border-r border-[#E5E7EB] px-4 py-3 text-center">
                  Recent Avg.
                </th>

                <th className="border-r border-[#E5E7EB] px-4 py-3 text-center">
                  Forecast
                </th>

                <th className="border-r border-[#E5E7EB] px-4 py-3 text-center">
                  Current Stock
                </th>

                <th className="px-4 py-3 text-center">
                  Suggested Preparation
                </th>

              </tr>
            </thead>

            <tbody className="divide-y divide-[#E5E7EB]">

              {loading ? (

                <TableSkeleton
                  columns={5}
                  rows={4}
                />

              ) : data?.products?.length ? (

                data.products.map((item) => (
                  <tr
                    key={item.product}
                    className="transition hover:bg-[#F8F7F2]/70"
                  >

                    <td className="border-r border-[#E5E7EB] px-4 py-3 font-semibold text-[#1F2937]">
                      {item.product}
                    </td>

                    <td className="border-r border-[#E5E7EB] px-4 py-3 text-center text-[#64748B]">
                      {item.recentAverage}
                    </td>

                    <td className="border-r border-[#E5E7EB] px-4 py-3 text-center font-medium text-[#1F2937]">
                      {item.forecast}
                    </td>

                    <td className="border-r border-[#E5E7EB] px-4 py-3 text-center text-[#64748B]">
                      {item.currentStock}
                    </td>

                    <td className="px-4 py-3 text-center font-semibold text-[#1F2937]">
                      {item.suggestedPreparation}
                    </td>

                  </tr>
                ))

              ) : (

                <tr>
                  <td
                    colSpan={5}
                    className="px-4 py-12 text-center text-xs text-[#64748B]"
                  >
                    No forecast data available.
                  </td>
                </tr>

              )}

            </tbody>
          </table>

        </div>
      </section>

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
   FORECAST SUMMARY SKELETON
========================================================= */

function ForecastSummarySkeleton() {
  return (
    <table
      className="w-full border-collapse text-left text-xs text-[#1F2937]"
      aria-label="Loading forecast summary"
    >
      <thead className="border-b border-[#E5E7EB] bg-[#F8F7F2] text-[10px] font-semibold uppercase tracking-wider text-[#64748B]">
        <tr>
          <th className="border-r border-[#E5E7EB] px-4 py-3">
            Period
          </th>

          <th className="border-r border-[#E5E7EB] px-4 py-3 text-right">
            Sales
          </th>

          <th className="px-4 py-3 text-right">
            Forecasted Demand
          </th>
        </tr>
      </thead>

      <tbody className="divide-y divide-[#E5E7EB]">
        <TableSkeleton
          columns={3}
          rows={7}
        />
      </tbody>
    </table>
  );
}

/* =========================================================
   HISTORICAL SALES SKELETON
========================================================= */

function HistoricalSalesChartSkeleton() {
  const points = [
    82,
    64,
    70,
    48,
    27,
    15,
    32,
  ];

  return (
    <div
      className="h-full w-full overflow-x-auto"
      role="status"
    >
      <svg
        viewBox="0 0 500 210"
        className="h-55 w-full min-w-[380px]"
        aria-hidden="true"
      >
        <line
          x1="45"
          y1="10"
          x2="45"
          y2="175"
          className="stroke-[#E5E7EB]"
        />

        <line
          x1="45"
          y1="175"
          x2="485"
          y2="175"
          className="stroke-[#E5E7EB]"
        />

        {[40, 80, 120, 160].map(
          (y) => (
            <line
              key={y}
              x1="45"
              y1={y}
              x2="485"
              y2={y}
              className="stroke-[#F1F2EE]"
            />
          )
        )}

        <polyline
          points={points
            .map(
              (y, index) =>
                `${45 + index * (440 / 6)},${y}`
            )
            .join(" ")}
          fill="none"
          stroke="#D1D5DB"
          strokeWidth="3"
          className="animate-pulse"
        />

        {points.map((y, index) => (
          <circle
            key={index}
            cx={
              45 +
              index * (440 / 6)
            }
            cy={y}
            r="4"
            className="fill-[#E5E7EB] animate-pulse"
          />
        ))}
      </svg>

      <span className="sr-only">
        Loading historical sales chart...
      </span>
    </div>
  );
}

/* =========================================================
   SALES CHART
========================================================= */

function SalesChart({
  data,
}: {
  data: HistoricalSale[];
}) {
  const width = 500;
  const height = 210;

  const paddingLeft = 45;
  const paddingBottom = 35;
  const paddingTop = 10;
  const paddingRight = 15;

  const chartWidth =
    width -
    paddingLeft -
    paddingRight;

  const chartHeight =
    height -
    paddingTop -
    paddingBottom;

  const maxSales = Math.max(
    ...data.map((item) => item.sales),
    1
  );

  const points = data.map(
    (item, index) => {
      const x =
        paddingLeft +
        (index /
          Math.max(
            data.length - 1,
            1
          )) *
          chartWidth;

      const y =
        paddingTop +
        chartHeight -
        (item.sales / maxSales) *
          chartHeight;

      return {
        x,
        y,
        ...item,
      };
    }
  );

  const linePoints = points
    .map(
      (point) =>
        `${point.x},${point.y}`
    )
    .join(" ");

  return (
    <div className="h-full w-full overflow-x-auto">

      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="h-55 w-full min-w-[380px]"
        role="img"
        aria-label="Historical sales chart"
      >

        {/* Y AXIS */}
        <line
          x1={paddingLeft}
          y1={paddingTop}
          x2={paddingLeft}
          y2={
            paddingTop +
            chartHeight
          }
          stroke="currentColor"
          className="text-[#D1D5DB]"
        />

        {/* X AXIS */}
        <line
          x1={paddingLeft}
          y1={
            paddingTop +
            chartHeight
          }
          x2={
            paddingLeft +
            chartWidth
          }
          y2={
            paddingTop +
            chartHeight
          }
          stroke="currentColor"
          className="text-[#D1D5DB]"
        />

        {/* Y LABELS */}
        {[0, 25, 50, 75, 100].map(
          (value) => {
            const y =
              paddingTop +
              chartHeight -
              (value / 100) *
                chartHeight;

            const labelValue =
              Math.round(
                (value / 100) *
                  maxSales
              );

            return (
              <text
                key={value}
                x={
                  paddingLeft - 8
                }
                y={y + 3}
                textAnchor="end"
                fontSize="10"
                fill="currentColor"
                className="text-[#94A3B8]"
              >
                {labelValue}
              </text>
            );
          }
        )}

        {/* SALES LINE */}
        {points.length > 1 && (
          <polyline
            points={linePoints}
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="text-[#292A24]"
          />
        )}

        {/* DATA POINTS */}
        {points.map(
          (point, index) => (
            <circle
              key={index}
              cx={point.x}
              cy={point.y}
              r="3"
              fill="currentColor"
              className="text-[#292A24]"
            />
          )
        )}

        {/* X LABELS */}
        {points.map(
          (point, index) => (
            <text
              key={index}
              x={point.x}
              y={height - 10}
              textAnchor="middle"
              fontSize="10"
              fill="currentColor"
              className="text-[#64748B]"
            >
              {point.period}
            </text>
          )
        )}

      </svg>
    </div>
  );
}

export default Forecasting;