import { useState } from "react";
import type { FormEvent } from "react";
import { X } from "lucide-react";

interface InventoryItem {
  id: number;
  ingredient: string;
  unit: string;
  initialStock: number;
  availableStock: number;
  status: string;
}

interface InventoryFormProps {
  inventory: InventoryItem | null;
  onClose: () => void;
  onSuccess: () => void;
}

function InventoryForm({
  inventory,
  onClose,
  onSuccess,
}: InventoryFormProps) {
  const [inventoryId, setInventoryId] = useState(
    inventory?.id?.toString() ?? ""
  );

  const [ingredient, setIngredient] = useState(
    inventory?.ingredient ?? ""
  );

  const [unit, setUnit] = useState(
    inventory?.unit ?? ""
  );

  const [initialStock, setInitialStock] = useState(
    inventory?.initialStock?.toString() ?? ""
  );

  const [availableStock, setAvailableStock] = useState(
    inventory?.availableStock?.toString() ?? ""
  );

  const [status, setStatus] = useState(
    inventory?.status ?? "In Stock"
  );

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const isEditing = Boolean(inventory);

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    try {
      setLoading(true);
      setError("");

      const apiUrl = import.meta.env.VITE_API_URL;

      if (!apiUrl) {
        throw new Error("VITE_API_URL is not configured.");
      }

      const inventoryData = {
        ingredient,
        unit,
        initialStock: Number(initialStock),
        availableStock: Number(availableStock),
        status,
      };

      const url = inventory
        ? `${apiUrl}/inventory/${inventory.id}`
        : `${apiUrl}/inventory`;

      const response = await fetch(url, {
        method: inventory ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(inventoryData),
      });

      if (!response.ok) {
        throw new Error("Failed to save inventory item");
      }

      onSuccess();
    } catch (err) {
      console.error("Save inventory error:", err);
      setError("Unable to save inventory item.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
      {/* FORM CONTAINER */}
      <div className="relative w-full max-w-md overflow-hidden rounded-xl border border-gray-200 bg-white shadow-2xl transition-all">
        {/* TOP TITLE BAR */}
        <div className="flex items-center justify-between border-b border-gray-200 bg-gray-50/80 px-4 py-3">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-500">
            Inventory Management
          </h2>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-gray-400 transition hover:bg-gray-200 hover:text-gray-700"
          >
            <X size={16} />
          </button>
        </div>

        {/* HEADER SECTION */}
        <div className="border-b border-[#e3dc9e] bg-[#EFEABB]/60 px-4 py-3">
          <h3 className="text-sm font-bold text-gray-900">
            {isEditing
              ? "Edit Inventory Item"
              : "Add New Inventory Item"}
          </h3>

          <p className="text-[11px] text-gray-600">
            {isEditing
              ? "Update details for the selected inventory item."
              : "Fill out the fields below to create a new inventory item."}
          </p>
        </div>

        {/* ERROR DISPLAY */}
        {error && (
          <div className="mx-4 mt-3 rounded-md border border-red-200 bg-red-50 p-2.5 text-xs text-red-600">
            {error}
          </div>
        )}

        {/* FORM */}
        <form
          onSubmit={handleSubmit}
          className="space-y-4 p-4"
        >
          <div className="grid grid-cols-2 gap-3">
            {/* Inventory ID */}
            <div>
              <label
                htmlFor="inventoryId"
                className="mb-1 block text-xs font-medium text-gray-700"
              >
                Inventory ID
              </label>

              <input
                id="inventoryId"
                type="number"
                value={inventoryId}
                onChange={(e) =>
                  setInventoryId(e.target.value)
                }
                placeholder="Auto-assigned"
                disabled
                className="w-full cursor-not-allowed rounded-md border border-gray-300 bg-gray-100 px-3 py-1.5 text-xs text-gray-500 outline-none"
              />
            </div>

            {/* Status */}
            <div>
              <label
                htmlFor="status"
                className="mb-1 block text-xs font-medium text-gray-700"
              >
                Status *
              </label>

              <select
                id="status"
                value={status}
                onChange={(e) =>
                  setStatus(e.target.value)
                }
                required
                className="w-full rounded-md border border-gray-300 bg-white px-3 py-1.5 text-xs text-gray-900 focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
              >
                <option value="In Stock">
                  In Stock
                </option>

                <option value="Low Stock">
                  Low Stock
                </option>

                <option value="Out of Stock">
                  Out of Stock
                </option>
              </select>
            </div>

            {/* Ingredient */}
            <div className="col-span-2">
              <label
                htmlFor="ingredient"
                className="mb-1 block text-xs font-medium text-gray-700"
              >
                Ingredient *
              </label>

              <input
                id="ingredient"
                type="text"
                value={ingredient}
                onChange={(e) =>
                  setIngredient(e.target.value)
                }
                placeholder="e.g. Rice, Pork, Cooking Oil"
                required
                className="w-full rounded-md border border-gray-300 bg-white px-3 py-1.5 text-xs text-gray-900 placeholder:text-gray-400 focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
              />
            </div>

            {/* Unit */}
            <div>
              <label
                htmlFor="unit"
                className="mb-1 block text-xs font-medium text-gray-700"
              >
                Unit *
              </label>

              <select
                id="unit"
                value={unit}
                onChange={(e) =>
                  setUnit(e.target.value)
                }
                required
                className="w-full rounded-md border border-gray-300 bg-white px-3 py-1.5 text-xs text-gray-900 focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
              >
                <option value="" disabled>
                  Select Unit
                </option>

                <option value="pcs">
                  Pieces (pcs)
                </option>

                <option value="kg">
                  Kilogram (kg)
                </option>

                <option value="g">
                  Gram (g)
                </option>

                <option value="L">
                  Liter (L)
                </option>

                <option value="mL">
                  Milliliter (mL)
                </option>

                <option value="pack">
                  Pack
                </option>

                <option value="box">
                  Box
                </option>
              </select>
            </div>

            {/* Initial Stock */}
            <div>
              <label
                htmlFor="initialStock"
                className="mb-1 block text-xs font-medium text-gray-700"
              >
                Initial Stock *
              </label>

              <input
                id="initialStock"
                type="number"
                value={initialStock}
                onChange={(e) =>
                  setInitialStock(e.target.value)
                }
                placeholder="0.00"
                required
                min="0"
                step="0.01"
                className="w-full rounded-md border border-gray-300 bg-white px-3 py-1.5 text-xs text-gray-900 placeholder:text-gray-400 focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
              />
            </div>

            {/* Available Stock */}
            <div>
              <label
                htmlFor="availableStock"
                className="mb-1 block text-xs font-medium text-gray-700"
              >
                Available Stock *
              </label>

              <input
                id="availableStock"
                type="number"
                value={availableStock}
                onChange={(e) =>
                  setAvailableStock(e.target.value)
                }
                placeholder="0.00"
                required
                min="0"
                step="0.01"
                className="w-full rounded-md border border-gray-300 bg-white px-3 py-1.5 text-xs text-gray-900 placeholder:text-gray-400 focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
              />
            </div>
          </div>

          {/* ACTIONS */}
          <div className="mt-6 flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="rounded-md border border-gray-300 bg-white px-4 py-1.5 text-xs font-medium text-gray-700 shadow-sm transition hover:bg-gray-50 disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className="rounded-md border border-[#d6d09b] bg-[#EFEABB] px-4 py-1.5 text-xs font-semibold text-gray-900 shadow-sm transition hover:bg-[#e3dc9e] disabled:opacity-50"
            >
              {loading
                ? "Saving..."
                : isEditing
                  ? "Update Inventory"
                  : "Save Inventory"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default InventoryForm;