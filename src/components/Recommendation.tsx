import { useEffect, useState } from "react";

function Recommendation() {
  const [dateTime, setDateTime] = useState(new Date());

  // Real-time clock matching Products.tsx
  useEffect(() => {
    const timer = setInterval(() => setDateTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="w-full p-4 sm:p-6">
      {/* HEADER */}
      <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold uppercase tracking-tight text-gray-900">
            Recommendation
          </h1>
          <p className="text-xs text-gray-500">
            View recommendation
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
            TIME: {dateTime.toLocaleTimeString("en-US", { hour12: false })}
          </span>
        </div>
      </div>

      {/* Resource Planning & Alerts Grid */}
      <div className="mb-4 grid grid-cols-1 gap-4 lg:grid-cols-2">

        {/* Resource Planning */}
        <section className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
          <div className="border-b border-gray-200 bg-gray-100/70 px-4 py-2.5 font-semibold uppercase tracking-wider text-gray-700 text-xs">
            Resource Planning
          </div>
          <div className="flex h-48 items-center justify-center text-xs text-gray-500">
            No resource planning recommendations available.
          </div>
        </section>

        {/* Alerts */}
        <section className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
          <div className="border-b border-gray-200 bg-gray-100/70 px-4 py-2.5 font-semibold uppercase tracking-wider text-gray-700 text-xs">
            Alerts
          </div>
          <div className="flex h-48 items-center justify-center text-xs text-gray-500">
            No alerts available.
          </div>
        </section>

      </div>

      {/* Restocking Recommendation */}
      <section className="mb-4 overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-200 bg-gray-100/70 px-4 py-2.5 font-semibold uppercase tracking-wider text-gray-700 text-xs">
          Restocking Recommendation
        </div>
        <div className="flex h-52 items-center justify-center text-xs text-gray-500">
          No restocking recommendations available.
        </div>
      </section>

      {/* Preparation Recommendation */}
      <section className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-200 bg-gray-100/70 px-4 py-2.5 font-semibold uppercase tracking-wider text-gray-700 text-xs">
          Preparation Recommendation
        </div>
        <div className="flex h-52 items-center justify-center text-xs text-gray-500">
          No preparation recommendations available.
        </div>
      </section>

    </div>
  );
}

export default Recommendation;