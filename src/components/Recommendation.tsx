import { useEffect, useState } from "react";
import {
  AlertTriangle,
  Info,
} from "lucide-react";

import { Skeleton, TableSkeleton } from "./LoadingSkeleton";
import { FORECAST_API_URL } from "../services/api";
import PageHeader from "./ui/PageHeader";
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

  const [recommendations, setRecommendations] =
    useState<RecommendationData | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        setLoading(true);
        setError("");

        // Recommendations require a specific branch.
        if (selectedBranchId === "ALL") {
          setRecommendations(null);
          return;
        }

        if (!FORECAST_API_URL) {
          throw new Error(
            "VITE_FORECAST_API_URL is not configured."
          );
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
          throw new Error(
            "Failed to fetch recommendations."
          );
        }

        const data: RecommendationData =
          await response.json();

        setRecommendations(data);
      } catch (err) {
        console.error(
          "Error fetching recommendations:",
          err
        );

        setError(
          err instanceof Error
            ? err.message
            : "Unable to load recommendations."
        );

        setRecommendations(null);
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendations();
  }, [selectedBranchId]);

  return (
    <div className="w-full p-4 sm:p-6">

      {/* PAGE HEADER */}
      <PageHeader
        title="Recommendation"
        description="View inventory, restocking, and preparation insights."
      />

      {/* ERROR */}
      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-700">
          {error}
        </div>
      )}

      {/* ALL BRANCHES MESSAGE */}
      {selectedBranchId === "ALL" && (
        <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-700">
          Select Branch 1 or Branch 2 to view recommendations.
        </div>
      )}

      {/* RESOURCE PLANNING + ALERTS */}
      <div className="mb-5 grid grid-cols-1 gap-4 lg:grid-cols-2">

        {/* RESOURCE PLANNING */}
        <section className="overflow-hidden rounded-xl border border-[#E5E7EB] bg-white">

          <SectionHeader title="Resource Planning" />

          <div className="p-4">

            {loading ? (
              <ResourcePlanningSkeleton />
            ) : recommendations?.resourcePlanning?.length ? (

              <div className="space-y-2.5">

                {recommendations.resourcePlanning.map(
                  (item, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-2.5 rounded-lg border border-[#E5E7EB] bg-[#F8F7F2]/60 p-3"
                    >
                      <Info
                        size={15}
                        className="mt-0.5 shrink-0 text-blue-500"
                        aria-hidden="true"
                      />

                      <span className="text-xs leading-5 text-[#1F2937]">
                        {item.message}
                      </span>
                    </div>
                  )
                )}

              </div>

            ) : (

              <div className="flex h-44 items-center justify-center text-xs text-[#64748B]">
                No resource planning recommendations available.
              </div>

            )}

          </div>
        </section>

        {/* ALERTS */}
        <section className="overflow-hidden rounded-xl border border-[#E5E7EB] bg-white">

          <SectionHeader title="Alerts" />

          <div className="p-4">

            {loading ? (
              <AlertsSkeleton />
            ) : recommendations?.alerts?.length ? (

              <div className="space-y-2.5">

                {recommendations.alerts.map(
                  (alert) => {
                    const alertStyles =
                      alert.severity === "high"
                        ? "border-red-200 bg-red-50/70 text-red-800"
                        : alert.severity === "medium"
                        ? "border-amber-200 bg-amber-50/70 text-amber-800"
                        : "border-blue-200 bg-blue-50/70 text-blue-800";

                    const badgeStyles =
                      alert.severity === "high"
                        ? "bg-red-100 text-red-700"
                        : alert.severity === "medium"
                        ? "bg-amber-100 text-amber-700"
                        : "bg-blue-100 text-blue-700";

                    return (
                      <div
                        key={alert.id}
                        className={`flex items-start justify-between gap-3 rounded-lg border p-3 text-xs ${alertStyles}`}
                      >

                        <div className="flex min-w-0 items-start gap-2">

                          <AlertTriangle
                            size={15}
                            className="mt-0.5 shrink-0"
                            aria-hidden="true"
                          />

                          <span className="leading-5">
                            {alert.message}
                          </span>

                        </div>

                        <span
                          className={`shrink-0 rounded-full px-2 py-1 text-[10px] font-semibold uppercase ${badgeStyles}`}
                        >
                          {alert.severity}
                        </span>

                      </div>
                    );
                  }
                )}

              </div>

            ) : (

              <div className="flex h-44 items-center justify-center text-xs text-[#64748B]">
                No alerts available.
              </div>

            )}

          </div>
        </section>

      </div>

      {/* RESTOCKING RECOMMENDATION */}
      <section className="mb-5 overflow-hidden rounded-xl border border-[#E5E7EB] bg-white">

        <SectionHeader title="Restocking Recommendation" />

        <div className="overflow-x-auto">

          <table className="w-full border-collapse text-left text-xs text-[#1F2937]">

            <thead className="border-b border-[#E5E7EB] bg-[#F8F7F2] text-[10px] font-semibold uppercase tracking-wider text-[#64748B]">

              <tr>

                <th className="border-r border-[#E5E7EB] px-4 py-3">
                  Ingredient
                </th>

                <th className="border-r border-[#E5E7EB] px-4 py-3 text-center">
                  Current Stock
                </th>

                <th className="border-r border-[#E5E7EB] px-4 py-3 text-center">
                  Recommended Stock
                </th>

                <th className="px-4 py-3 text-center">
                  Restock
                </th>

              </tr>

            </thead>

            <tbody className="divide-y divide-[#E5E7EB]">

              {loading ? (

                <TableSkeleton
                  columns={4}
                  rows={4}
                />

              ) : recommendations?.restocking?.length ? (

                recommendations.restocking.map(
                  (item) => (
                    <tr
                      key={item.id}
                      className="transition hover:bg-[#F8F7F2]/70"
                    >

                      <td className="border-r border-[#E5E7EB] px-4 py-3 font-semibold text-[#1F2937]">
                        {item.ingredient}
                      </td>

                      <td className="border-r border-[#E5E7EB] px-4 py-3 text-center text-[#64748B]">
                        {item.currentStock}{" "}
                        {item.unit}
                      </td>

                      <td className="border-r border-[#E5E7EB] px-4 py-3 text-center text-[#64748B]">
                        {item.recommendedStock}{" "}
                        {item.unit}
                      </td>

                      <td className="px-4 py-3 text-center font-semibold text-[#1F2937]">
                        {item.quantity}{" "}
                        {item.unit}
                      </td>

                    </tr>
                  )
                )

              ) : (

                <tr>
                  <td
                    colSpan={4}
                    className="px-4 py-12 text-center text-xs text-[#64748B]"
                  >
                    No restocking recommendations available.
                  </td>
                </tr>

              )}

            </tbody>
          </table>

        </div>
      </section>

      {/* PREPARATION RECOMMENDATION */}
      <section className="overflow-hidden rounded-xl border border-[#E5E7EB] bg-white">

        <SectionHeader title="Preparation Recommendation" />

        <div className="overflow-x-auto">

          <table className="w-full border-collapse text-left text-xs text-[#1F2937]">

            <thead className="border-b border-[#E5E7EB] bg-[#F8F7F2] text-[10px] font-semibold uppercase tracking-wider text-[#64748B]">

              <tr>

                <th className="border-r border-[#E5E7EB] px-4 py-3">
                  Product
                </th>

                <th className="border-r border-[#E5E7EB] px-4 py-3 text-center">
                  Forecasted Demand
                </th>

                <th className="px-4 py-3 text-center">
                  Recommended Preparation
                </th>

              </tr>

            </thead>

            <tbody className="divide-y divide-[#E5E7EB]">

              {loading ? (

                <TableSkeleton
                  columns={3}
                  rows={4}
                />

              ) : recommendations?.preparation?.length ? (

                recommendations.preparation.map(
                  (item) => (
                    <tr
                      key={item.id}
                      className="transition hover:bg-[#F8F7F2]/70"
                    >

                      <td className="border-r border-[#E5E7EB] px-4 py-3 font-semibold text-[#1F2937]">
                        {item.product}
                      </td>

                      <td className="border-r border-[#E5E7EB] px-4 py-3 text-center text-[#64748B]">
                        {item.forecastedDemand}{" "}
                        {item.unit}
                      </td>

                      <td className="px-4 py-3 text-center font-semibold text-[#1F2937]">
                        {item.recommendedPreparation}{" "}
                        {item.unit}
                      </td>

                    </tr>
                  )
                )

              ) : (

                <tr>
                  <td
                    colSpan={3}
                    className="px-4 py-12 text-center text-xs text-[#64748B]"
                  >
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
   RESOURCE PLANNING SKELETON
========================================================= */

function ResourcePlanningSkeleton() {
  return (
    <div className="space-y-2.5" role="status">

      {Array.from(
        { length: 3 },
        (_, index) => (
          <div
            key={index}
            className="flex items-start gap-2.5 rounded-lg border border-[#E5E7EB] bg-[#F8F7F2]/60 p-3"
          >
            <Skeleton
              className="mt-0.5 h-4 w-4 shrink-0 rounded-full"
            />

            <div className="flex-1 space-y-2">
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-3/4" />
            </div>
          </div>
        )
      )}

      <span className="sr-only">
        Loading resource planning recommendations...
      </span>
    </div>
  );
}

/* =========================================================
   ALERTS SKELETON
========================================================= */

function AlertsSkeleton() {
  return (
    <div className="space-y-2.5" role="status">

      {Array.from(
        { length: 3 },
        (_, index) => (
          <div
            key={index}
            className="flex items-start justify-between gap-3 rounded-lg border border-[#E5E7EB] bg-[#F8F7F2]/60 p-3"
          >

            <div className="flex flex-1 items-start gap-2">

              <Skeleton
                className="mt-0.5 h-4 w-4 shrink-0 rounded-full"
              />

              <div className="flex-1 space-y-2">
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-2/3" />
              </div>

            </div>

            <Skeleton className="h-5 w-12 shrink-0 rounded-full" />

          </div>
        )
      )}

      <span className="sr-only">
        Loading alerts...
      </span>
    </div>
  );
}

export default Recommendation;