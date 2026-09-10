import { useEffect, useState } from "react";
import {
  AlertTriangle,
  Info,
} from "lucide-react";
import { Skeleton, TableSkeleton } from "./LoadingSkeleton";
import { FORECAST_API_URL } from "../services/api";

import { useBranch } from "../hooks/useBranch";

interface ResourcePlanning {
  message: string;
}

interface Alert {
  id: string;
  message: string;
  severity: "low" | "medium" | "high";
}

interface RestockingRecommendation {
  id: string;
  ingredient: string;
  currentStock: number;
  recommendedStock: number;
  quantity: number;
  unit: string;
}

interface PreparationRecommendation {
  id: string;
  product: string;
  forecastedDemand: number;
  recommendedPreparation: number;
  unit: string;
}

interface RecommendationData {
  resourcePlanning: ResourcePlanning[];
  alerts: Alert[];
  restocking: RestockingRecommendation[];
  preparation: PreparationRecommendation[];
}

function Recommendation() {
  const { selectedBranchId } = useBranch();
  const [dateTime, setDateTime] = useState(new Date());

  const [recommendations, setRecommendations] =
    useState<RecommendationData | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const timer = setInterval(() => {
      setDateTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        setLoading(true);
        setError("");

        if (selectedBranchId === "ALL") {
          setRecommendations(null);
          return;
        }

        if (!FORECAST_API_URL) {
          throw new Error("VITE_FORECAST_API_URL is not configured.");
        }

        const params = new URLSearchParams();

        params.append(
          "branchId",
          String(selectedBranchId)
        );

        const response = await fetch(
          `${FORECAST_API_URL}/recommendations?${params.toString()}`
        );

        if (!response.ok) {
          throw new Error("Failed to fetch recommendations.");
        }

        const data: RecommendationData = await response.json();
        setRecommendations(data);
      } catch (err) {
        console.error("Error fetching recommendations:", err);
        setError("Unable to load recommendations.");
        setRecommendations(null);
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendations();
  }, [selectedBranchId]);
  
  return (
    <div className="w-full p-4 sm:p-6">
      {/* HEADER */}
      <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="pl-12 lg:pl-0">
          <h1 className="text-xl font-bold uppercase tracking-tight text-gray-900">
            Recommendation
          </h1>

          <p className="text-xs text-gray-500">
            View inventory, restocking, and preparation insights.
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

      {/* ERROR */}
      {error && (
        <div className="mb-4 rounded-md border border-red-200 bg-red-50 p-3 text-xs text-red-600">
          {error}
        </div>
      )}

      {/* Resource Planning & Alerts */}
      <div className="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Resource Planning */}
        <section className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
          <div className="border-b border-gray-200 bg-gray-50/50 px-4 py-3 text-xs font-bold uppercase tracking-wider text-gray-700">
            Resource Planning
          </div>

          <div className="p-4">
            {loading ? (
              <ResourcePlanningSkeleton />
            ) : recommendations?.resourcePlanning?.length ? (
              <div className="space-y-2.5">
                {recommendations.resourcePlanning.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-2.5 rounded-md border border-gray-200 bg-gray-50/50 p-3 text-xs text-gray-700"
                  >
                    <Info size={15} className="mt-0.5 shrink-0 text-blue-500" />
                    <span>{item.message}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex h-44 items-center justify-center text-xs text-gray-500">
                No resource planning recommendations available.
              </div>
            )}
          </div>
        </section>

        {/* Alerts */}
        <section className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
          <div className="border-b border-gray-200 bg-gray-50/50 px-4 py-3 text-xs font-bold uppercase tracking-wider text-gray-700">
            Alerts
          </div>

          <div className="p-4">
            {loading ? (
              <AlertsSkeleton />
            ) : recommendations?.alerts?.length ? (
              <div className="space-y-2.5">
                {recommendations.alerts.map((alert) => (
                  <div
                    key={alert.id}
                    className={`flex items-start justify-between gap-3 rounded-md border p-3 text-xs ${
                      alert.severity === "high"
                        ? "border-red-200 bg-red-50/60 text-red-800"
                        : alert.severity === "medium"
                        ? "border-amber-200 bg-amber-50/60 text-amber-800"
                        : "border-blue-200 bg-blue-50/60 text-blue-800"
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      <AlertTriangle size={15} className="mt-0.5 shrink-0" />
                      <span>{alert.message}</span>
                    </div>

                    <span
                      className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase ${
                        alert.severity === "high"
                          ? "bg-red-200 text-red-900"
                          : alert.severity === "medium"
                          ? "bg-amber-200 text-amber-900"
                          : "bg-blue-200 text-blue-900"
                      }`}
                    >
                      {alert.severity}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex h-44 items-center justify-center text-xs text-gray-500">
                No alerts available.
              </div>
            )}
          </div>
        </section>
      </div>

      {/* Restocking Recommendation */}
      <section className="mb-6 overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-200 bg-gray-50/50 px-4 py-3 text-xs font-bold uppercase tracking-wider text-gray-700">
          Restocking Recommendation
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-gray-700 border-collapse">
            <thead className="border-b border-gray-200 bg-gray-100/70 font-semibold uppercase tracking-wider text-gray-700">
              <tr>
                <th className="px-4 py-2.5 text-center border-r border-gray-200">Ingredient</th>
                <th className="px-4 py-2.5 text-center border-r border-gray-200">Current Stock</th>
                <th className="px-4 py-2.5 text-center border-r border-gray-200">Recommended Stock</th>
                <th className="px-4 py-2.5 text-center">Restock</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <TableSkeleton columns={4} rows={4} />
              ) : recommendations?.restocking?.length ? (
                recommendations.restocking.map((item) => (
                  <tr key={item.id} className="transition hover:bg-gray-50/80">
                    <td className="px-4 py-2.5 font-semibold text-gray-900 border-r border-gray-200">
                      {item.ingredient}
                    </td>

                    <td className="px-4 py-2.5 text-center text-gray-600 border-r border-gray-200">
                      {item.currentStock} {item.unit}
                    </td>

                    <td className="px-4 py-2.5 text-center text-gray-600 border-r border-gray-200">
                      {item.recommendedStock} {item.unit}
                    </td>

                    <td className="px-4 py-2.5 text-center font-bold text-gray-900">
                      {item.quantity} {item.unit}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="py-12 text-center text-xs text-gray-500">
                    No restocking recommendations available.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Preparation Recommendation */}
      <section className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-200 bg-gray-50/50 px-4 py-3 text-xs font-bold uppercase tracking-wider text-gray-700">
          Preparation Recommendation
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-gray-700 border-collapse">
            <thead className="border-b border-gray-200 bg-gray-100/70 font-semibold uppercase tracking-wider text-gray-700">
              <tr>
                <th className="px-4 py-2.5 text-center border-r border-gray-200">Product</th>
                <th className="px-4 py-2.5 text-center border-r border-gray-200">Forecasted Demand</th>
                <th className="px-4 py-2.5 text-center">Recommended Preparation</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <TableSkeleton columns={3} rows={4} />
              ) : recommendations?.preparation?.length ? (
                recommendations.preparation.map((item) => (
                  <tr key={item.id} className="transition hover:bg-gray-50/80">
                    <td className="px-4 py-2.5 font-semibold text-gray-900 border-r border-gray-200">
                      {item.product}
                    </td>

                    <td className="px-4 py-2.5 text-center text-gray-600 border-r border-gray-200">
                      {item.forecastedDemand} {item.unit}
                    </td>

                    <td className="px-4 py-2.5 text-center font-bold text-gray-900">
                      {item.recommendedPreparation} {item.unit}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={3} className="py-12 text-center text-xs text-gray-500">
                    No preparation recommendations available.
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

function ResourcePlanningSkeleton() {
  return (
    <div className="space-y-2.5" role="status">
      {Array.from({ length: 3 }, (_, index) => (
        <div key={index} className="flex items-start gap-2.5 rounded-md border border-gray-100 bg-gray-50/70 p-3">
          <Skeleton className="mt-0.5 h-4 w-4 shrink-0 rounded-full" />
          <div className="flex-1 space-y-2"><Skeleton className="h-3 w-full" /><Skeleton className="h-3 w-3/4" /></div>
        </div>
      ))}
      <span className="sr-only">Loading resource planning recommendations...</span>
    </div>
  );
}

function AlertsSkeleton() {
  return (
    <div className="space-y-2.5" role="status">
      {Array.from({ length: 3 }, (_, index) => (
        <div key={index} className="flex items-start justify-between gap-3 rounded-md border border-gray-100 bg-gray-50/70 p-3">
          <div className="flex flex-1 items-start gap-2"><Skeleton className="mt-0.5 h-4 w-4 shrink-0 rounded-full" /><div className="flex-1 space-y-2"><Skeleton className="h-3 w-full" /><Skeleton className="h-3 w-2/3" /></div></div>
          <Skeleton className="h-4 w-10 shrink-0 rounded-full" />
        </div>
      ))}
      <span className="sr-only">Loading alerts...</span>
    </div>
  );
}

export default Recommendation;
