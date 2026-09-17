import { useState } from "react";
import { apiRequest } from "../../services/api";

interface Product {
  id: number;
  product?: string;
  name?: string;
}

interface Props {
  products: Product[];
  branchId: number;
  onClose: () => void;
  onPrepared: () => void;
}

export default function PrepareBatchModal({
  products,
  branchId,
  onClose,
  onPrepared,
}: Props) {
  const [productId, setProductId] = useState("");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (
    event: React.FormEvent
  ) => {
    event.preventDefault();

    if (!productId) {
      setError("Please select a product.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      await apiRequest("/prepared-batches", {
        method: "POST",
        body: JSON.stringify({
          productId: Number(productId),
          branchId,
          note: note.trim() || null,
        }),
      });

      onPrepared();
      onClose();
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to prepare batch."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-5 shadow-xl"
      >
        {/* HEADER */}
        <div>
          <h2 className="text-lg font-semibold text-slate-900">
            Prepare Batch
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            One standard recipe will be deducted from raw
            ingredient inventory.
          </p>
        </div>

        {/* ERROR */}
        {error && (
          <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* PRODUCT */}
        <div className="mt-5">
          <label className="block text-sm font-medium text-slate-700">
            Product
          </label>

          <select
            value={productId}
            onChange={(e) => setProductId(e.target.value)}
            required
            disabled={loading}
            className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-slate-500 disabled:bg-slate-100"
          >
            <option value="">
              Select product
            </option>

            {products.map((product) => (
              <option
                key={product.id}
                value={product.id}
              >
                {product.name ?? product.product ?? "Unnamed Product"}
              </option>
            ))}
          </select>
        </div>

        {/* NOTE */}
        <div className="mt-4">
          <label className="block text-sm font-medium text-slate-700">
            Note
          </label>

          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            disabled={loading}
            placeholder="Optional note..."
            rows={3}
            className="mt-1 w-full resize-none rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500 disabled:bg-slate-100"
          />
        </div>

        {/* ACTIONS */}
        <div className="mt-5 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={loading || !productId}
            className="rounded-lg bg-[#EFEABB] px-4 py-2 text-sm font-semibold text-slate-900 transition hover:bg-[#e3dc9e] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Preparing..." : "Prepare Batch"}
          </button>
        </div>
      </form>
    </div>
  );
}