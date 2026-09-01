import { useEffect, useState } from "react";
import { SlidersHorizontal, Package } from "lucide-react";
import { TableSkeleton } from "./LoadingSkeleton";

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
  const [dateTime, setDateTime] = useState(new Date());

  const [period, setPeriod] = useState("next-day");
  const [product, setProduct] = useState("all");

  const [data, setData] = useState<ForecastResponse | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Real-time date and time
  useEffect(() => {
    const timer = setInterval(() => {
      setDateTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Fetch forecast data
  useEffect(() => {
    const fetchForecast = async () => {
      try {
        setLoading(true);
        setError("");

        const API_URL = import.meta.env.VITE_API_URL;

        if (!API_URL) {
          throw new Error("VITE_API_URL is not configured.");
        }

        const response = await fetch(
          `${API_URL}/api/forecast?period=${period}&product=${product}`
        );

        if (!response.ok) {
          throw new Error("Failed to fetch forecast data.");
        }

        const result: ForecastResponse = await response.json();
        setData(result);
      } catch (err) {
        console.error("Forecast fetch error:", err);
        setError("Unable to load forecasting data.");
        setData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchForecast();
  }, [period, product]);

  return (
    <div className="w-full p-4 sm:p-6">
      {/* HEADER */}
      <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold uppercase tracking-tight text-gray-900">
            Demand Forecasting
          </h1>

          <p className="text-xs text-gray-500">
            View forecasted demand and inventory recommendations.
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

      {/* FILTERS TOOLBAR */}
      <div className="mb-4 flex flex-wrap items-center gap-3 rounded-lg border border-gray-200 bg-white p-3 shadow-sm">
        <div className="flex items-center gap-2">
          <SlidersHorizontal size={14} className="text-gray-500" />
          <label htmlFor="period-select" className="text-xs font-medium text-gray-700">
            Forecast Period:
          </label>
          <select
            id="period-select"
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="rounded-md border border-gray-300 bg-white px-2.5 py-1 text-xs text-gray-900 outline-none focus:border-black"
          >
            <option value="next-day">Next Day</option>
            <option value="next-week">Next Week</option>
            <option value="next-month">Next Month</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <Package size={14} className="text-gray-500" />
          <label htmlFor="product-select" className="text-xs font-medium text-gray-700">
            Product:
          </label>
          <select
            id="product-select"
            value={product}
            onChange={(e) => setProduct(e.target.value)}
            className="rounded-md border border-gray-300 bg-white px-2.5 py-1 text-xs text-gray-900 outline-none focus:border-black"
          >
            <option value="all">All Products</option>
            <option value="goto">Goto</option>
            <option value="pares">Pares</option>
            <option value="tapa">Tapa</option>
          </select>
        </div>
      </div>

      {/* ERROR MSG */}
      {error && (
        <div className="mb-4 rounded-md border border-red-200 bg-red-50 p-3 text-xs text-red-600">
          {error}
        </div>
      )}

      {/* TOP GRID */}
      <div className="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* FORECAST SUMMARY TABLE */}
        <section className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
          <div className="border-b border-gray-200 bg-gray-50/50 px-4 py-3 text-xs font-bold uppercase tracking-wider text-gray-700">
            Forecast Summary
          </div>

          <div className="min-h-70 overflow-x-auto">
            {loading ? (
              <ForecastSummarySkeleton />
            ) : data?.summary?.length ? (
              <table className="w-full text-left text-xs text-gray-700 border-collapse">
                <thead className="border-b border-gray-200 bg-gray-100/70 font-semibold uppercase tracking-wider text-gray-700">
                  <tr>
                    <th className="px-4 py-2.5 border-r border-gray-200">Period</th>
                    <th className="px-4 py-2.5 text-right border-r border-gray-200">Sales</th>
                    <th className="px-4 py-2.5 text-right">Forecasted Demand</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-200">
                  {data.summary.map((item, index) => (
                    <tr key={index} className="transition hover:bg-gray-50/80">
                      <td className="px-4 py-2.5 font-medium text-gray-900 border-r border-gray-200">
                        {item.period}
                      </td>
                      <td className="px-4 py-2.5 text-right text-gray-600 border-r border-gray-200">
                        {item.sales}
                      </td>
                      <td className="px-4 py-2.5 text-right font-semibold text-gray-900">
                        {item.forecastedDemand}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="flex h-64 items-center justify-center text-xs text-gray-500">
                No forecast data available.
              </div>
            )}
          </div>
        </section>

        {/* HISTORICAL SALES CHART */}
        <section className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
          <div className="border-b border-gray-200 bg-gray-50/50 px-4 py-3 text-xs font-bold uppercase tracking-wider text-gray-700">
            Historical Sales
          </div>

          <div className="min-h-70 p-4 flex items-center justify-center">
            {loading ? (
              <HistoricalSalesChartSkeleton />
            ) : data?.historicalSales?.length ? (
              <SalesChart data={data.historicalSales} />
            ) : (
              <div className="text-xs text-gray-500">No historical sales available.</div>
            )}
          </div>
        </section>
      </div>

      {/* PRODUCT FORECAST TABLE */}
      <section className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-gray-700 border-collapse">
            <thead className="border-b border-gray-200 bg-gray-100/70 font-semibold uppercase tracking-wider text-gray-700">
              <tr>
                <th className="px-4 py-2.5 border-r border-gray-200">Product</th>
                <th className="px-4 py-2.5 text-center border-r border-gray-200">Recent Avg.</th>
                <th className="px-4 py-2.5 text-center border-r border-gray-200">Forecast</th>
                <th className="px-4 py-2.5 text-center border-r border-gray-200">Current Stock</th>
                <th className="px-4 py-2.5 text-center">Suggested Preparation</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <TableSkeleton columns={5} rows={4} />
              ) : data?.products?.length ? (
                data.products.map((item) => (
                  <tr key={item.product} className="transition hover:bg-gray-50/80">
                    <td className="px-4 py-2.5 font-semibold text-gray-900 border-r border-gray-200">
                      {item.product}
                    </td>
                    <td className="px-4 py-2.5 text-center text-gray-600 border-r border-gray-200">
                      {item.recentAverage}
                    </td>
                    <td className="px-4 py-2.5 text-center font-medium text-gray-900 border-r border-gray-200">
                      {item.forecast}
                    </td>
                    <td className="px-4 py-2.5 text-center text-gray-600 border-r border-gray-200">
                      {item.currentStock}
                    </td>
                    <td className="px-4 py-2.5 text-center font-bold text-gray-900">
                      {item.suggestedPreparation}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-gray-500">
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

function ForecastSummarySkeleton() {
  return (
    <table className="w-full border-collapse text-left text-xs text-gray-700" aria-label="Loading forecast summary">
      <thead className="border-b border-gray-200 bg-gray-100/70 font-semibold uppercase tracking-wider text-gray-700">
        <tr>
          <th className="border-r border-gray-200 px-4 py-2.5">Period</th>
          <th className="border-r border-gray-200 px-4 py-2.5 text-right">Sales</th>
          <th className="px-4 py-2.5 text-right">Forecasted Demand</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-200"><TableSkeleton columns={3} rows={7} /></tbody>
    </table>
  );
}

function HistoricalSalesChartSkeleton() {
  const points = [82, 64, 70, 48, 27, 15, 32];

  return (
    <div className="h-full w-full overflow-x-auto" role="status">
      <svg viewBox="0 0 500 210" className="h-55 w-full min-w-95" aria-hidden="true">
        <line x1="45" y1="10" x2="45" y2="175" className="stroke-gray-200" />
        <line x1="45" y1="175" x2="485" y2="175" className="stroke-gray-200" />
        {[40, 80, 120, 160].map((y) => <line key={y} x1="45" y1={y} x2="485" y2={y} className="stroke-gray-100" />)}
        <polyline points={points.map((y, index) => `${45 + index * (440 / 6)},${y}`).join(" ")} fill="none" stroke="#d1d5db" strokeWidth="3" className="animate-pulse" />
        {points.map((y, index) => <circle key={index} cx={45 + index * (440 / 6)} cy={y} r="4" className="fill-gray-200 animate-pulse" />)}
      </svg>
      <span className="sr-only">Loading historical sales chart...</span>
    </div>
  );
}

function SalesChart({ data }: { data: HistoricalSale[] }) {
  const width = 500;
  const height = 210;

  const paddingLeft = 45;
  const paddingBottom = 35;
  const paddingTop = 10;
  const paddingRight = 15;

  const chartWidth = width - paddingLeft - paddingRight;
  const chartHeight = height - paddingTop - paddingBottom;

  const maxSales = Math.max(...data.map((item) => item.sales), 1);

  const points = data.map((item, index) => {
    const x = paddingLeft + (index / Math.max(data.length - 1, 1)) * chartWidth;
    const y = paddingTop + chartHeight - (item.sales / maxSales) * chartHeight;

    return { x, y, ...item };
  });

  const linePoints = points.map((point) => `${point.x},${point.y}`).join(" ");

  return (
    <div className="h-full w-full overflow-x-auto">
      <svg viewBox={`0 0 ${width} ${height}`} className="h-55 w-full min-w-">
        {/* Y axis */}
        <line
          x1={paddingLeft}
          y1={paddingTop}
          x2={paddingLeft}
          y2={paddingTop + chartHeight}
          stroke="currentColor"
          className="text-gray-300"
        />

        {/* X axis */}
        <line
          x1={paddingLeft}
          y1={paddingTop + chartHeight}
          x2={paddingLeft + chartWidth}
          y2={paddingTop + chartHeight}
          stroke="currentColor"
          className="text-gray-300"
        />

        {/* Y labels */}
        {[0, 25, 50, 75, 100].map((value) => {
          const y = paddingTop + chartHeight - (value / 100) * chartHeight;
          const labelValue = Math.round((value / 100) * maxSales);

          return (
            <text
              key={value}
              x={paddingLeft - 8}
              y={y + 3}
              textAnchor="end"
              fontSize="10"
              fill="currentColor"
              className="text-gray-400"
            >
              {labelValue}
            </text>
          );
        })}

        {/* Sales line */}
        {points.length > 1 && (
          <polyline
            points={linePoints}
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="text-gray-800"
          />
        )}

        {/* Points */}
        {points.map((point, index) => (
          <circle
            key={index}
            cx={point.x}
            cy={point.y}
            r="3"
            fill="currentColor"
            className="text-gray-900"
          />
        ))}

        {/* X labels */}
        {points.map((point, index) => (
          <text
            key={index}
            x={point.x}
            y={height - 10}
            textAnchor="middle"
            fontSize="10"
            fill="currentColor"
            className="text-gray-500"
          >
            {point.period}
          </text>
        ))}
      </svg>
    </div>
  );
}

export default Forecasting;