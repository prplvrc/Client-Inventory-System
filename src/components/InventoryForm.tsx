import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { X, Plus } from "lucide-react";
import { API_URL } from "../services/api";
interface Ingredient {
  id: number;
  name: string;
  unit: string;
  status: string;
}

interface InventoryItem {
  id: number;
  ingredientId: number;
  ingredient: Ingredient;
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
  const [ingredientId, setIngredientId] = useState(
    inventory?.ingredientId?.toString() ?? ""
  );

  const [initialStock, setInitialStock] = useState(
    inventory?.initialStock?.toString() ?? ""
  );

  const [availableStock, setAvailableStock] = useState(
    inventory?.availableStock?.toString() ?? ""
  );

  const [status, setStatus] = useState(
    inventory?.status ?? "ACTIVE"
  );

  const [ingredients, setIngredients] = useState<Ingredient[]>([]);

  const [loading, setLoading] = useState(false);
  const [loadingIngredients, setLoadingIngredients] = useState(true);

  const [error, setError] = useState("");

  // ========================================
  // NEW INGREDIENT STATES
  // ========================================

  const [showAddIngredient, setShowAddIngredient] = useState(false);

  const [newIngredientName, setNewIngredientName] = useState("");
  const [newIngredientUnit, setNewIngredientUnit] = useState("");

  const [creatingIngredient, setCreatingIngredient] = useState(false);

  const [ingredientError, setIngredientError] = useState("");

  const isEditing = Boolean(inventory);

  // ========================================
  // Fetch Ingredients
  // ========================================

  const fetchIngredients = async () => {
    try {
      setLoadingIngredients(true);
      setError("");

      if (!API_URL) {
        throw new Error("VITE_API_URL is not configured.");
      }

      const response = await fetch(`${API_URL}/ingredients`);

      if (!response.ok) {
        throw new Error("Failed to fetch ingredients");
      }

      const data: Ingredient[] = await response.json();

      setIngredients(data);
    } catch (err) {
      console.error("Fetch ingredients error:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Unable to load ingredients."
      );
    } finally {
      setLoadingIngredients(false);
    }
  };

  useEffect(() => {
    fetchIngredients();
  }, [API_URL]);

  // ========================================
  // Add New Ingredient
  // ========================================

  const handleCreateIngredient = async () => {
    try {
      setCreatingIngredient(true);
      setIngredientError("");

      if (!API_URL) {
        throw new Error("VITE_API_URL is not configured.");
      }

      if (!newIngredientName.trim()) {
        setIngredientError("Ingredient name is required.");
        return;
      }

      if (!newIngredientUnit.trim()) {
        setIngredientError("Unit is required.");
        return;
      }

      const response = await fetch(`${API_URL}/ingredients`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: newIngredientName.trim(),
          unit: newIngredientUnit.trim(),
          status: "ACTIVE",
        }),
      });

      if (!response.ok) {
        let message = "Failed to create ingredient.";

        try {
          const result = await response.json();
          message = result.message || message;
        } catch {
          // Response was not JSON
        }

        throw new Error(message);
      }

      const createdIngredient: Ingredient = await response.json();

      // Add the newly created ingredient to the dropdown
      setIngredients((current) => [
        ...current,
        createdIngredient,
      ]);

      // Automatically select the new ingredient
      setIngredientId(createdIngredient.id.toString());

      // Close the new ingredient section
      setShowAddIngredient(false);

      // Clear fields
      setNewIngredientName("");
      setNewIngredientUnit("");
      setIngredientError("");
    } catch (err) {
      console.error("Create ingredient error:", err);

      setIngredientError(
        err instanceof Error
          ? err.message
          : "Unable to create ingredient."
      );
    } finally {
      setCreatingIngredient(false);
    }
  };

  // ========================================
  // Submit Inventory
  // ========================================

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    try {
      setLoading(true);
      setError("");

      if (!API_URL) {
        throw new Error("VITE_API_URL is not configured.");
      }

      if (!ingredientId) {
        setError("Please select an ingredient.");
        return;
      }

      if (
        initialStock === "" ||
        Number(initialStock) < 0
      ) {
        setError("Please enter a valid initial stock.");
        return;
      }

      if (
        availableStock === "" ||
        Number(availableStock) < 0
      ) {
        setError("Please enter a valid available stock.");
        return;
      }

      if (
        Number(availableStock) >
        Number(initialStock)
      ) {
        setError(
          "Available stock cannot be greater than initial stock."
        );
        return;
      }

      const inventoryData = {
        ingredientId: Number(ingredientId),
        initialStock: Number(initialStock),
        availableStock: Number(availableStock),
        status,
      };

      const url = inventory
        ? `${API_URL}/inventory/${inventory.id}`
        : `${API_URL}/inventory`;

      const response = await fetch(url, {
        method: inventory ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(inventoryData),
      });

      if (!response.ok) {
        let message = "Failed to save inventory item.";

        try {
          const result = await response.json();
          message = result.message || message;
        } catch {
          // Response was not JSON
        }

        throw new Error(message);
      }

      onSuccess();
    } catch (err) {
      console.error("Save inventory error:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Unable to save inventory item."
      );
    } finally {
      setLoading(false);
    }
  };

  // ========================================
  // Selected Ingredient
  // ========================================

  const selectedIngredient = ingredients.find(
    (ingredient) =>
      ingredient.id === Number(ingredientId)
  );

  // ========================================
  // Render
  // ========================================

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">

      <div className="relative w-full max-w-md overflow-hidden rounded-xl border border-gray-200 bg-white shadow-2xl">

        {/* TOP BAR */}
        <div className="flex items-center justify-between border-b border-gray-200 bg-gray-50/80 px-4 py-3">

          <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-500">
            Inventory Management
          </h2>

          <button
            type="button"
            onClick={onClose}
            disabled={loading || creatingIngredient}
            className="rounded-lg p-1 text-gray-400 transition hover:bg-gray-200 hover:text-gray-700 disabled:opacity-50"
          >
            <X size={16} />
          </button>

        </div>

        {/* HEADER */}
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

        {/* ERROR */}
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

            {/* INVENTORY ID */}
            <div>

              <label
                htmlFor="inventoryId"
                className="mb-1 block text-xs font-medium text-gray-700"
              >
                Inventory ID
              </label>

              <input
                id="inventoryId"
                type="text"
                value={
                  inventory?.id
                    ? `#${inventory.id}`
                    : "Auto"
                }
                disabled
                className="w-full cursor-not-allowed rounded-md border border-gray-300 bg-gray-100 px-3 py-1.5 text-xs text-gray-500 outline-none"
              />

            </div>

            {/* STATUS */}
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

                <option value="ACTIVE">
                  Active
                </option>

                <option value="INACTIVE">
                  Inactive
                </option>

              </select>

            </div>

            {/* INGREDIENT */}
            <div className="col-span-2">

              <div className="mb-1 flex items-center justify-between">

                <label
                  htmlFor="ingredient"
                  className="block text-xs font-medium text-gray-700"
                >
                  Ingredient *
                </label>

                {!isEditing && (
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddIngredient((current) => !current);
                      setIngredientError("");
                    }}
                    disabled={loading || creatingIngredient}
                    className="flex items-center gap-1 text-[11px] font-semibold text-gray-700 transition hover:text-black disabled:opacity-50"
                  >
                    <Plus size={12} />
                    Add New Ingredient
                  </button>
                )}

              </div>

              <select
                id="ingredient"
                value={ingredientId}
                onChange={(e) =>
                  setIngredientId(e.target.value)
                }
                required
                disabled={
                  loadingIngredients ||
                  isEditing ||
                  creatingIngredient
                }
                className="w-full rounded-md border border-gray-300 bg-white px-3 py-1.5 text-xs text-gray-900 focus:border-black focus:outline-none focus:ring-1 focus:ring-black disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-500"
              >

                <option value="">
                  {loadingIngredients
                    ? "Loading ingredients..."
                    : "Select Ingredient"}
                </option>

                {ingredients
                  .filter(
                    (ingredient) =>
                      ingredient.status === "ACTIVE" ||
                      ingredient.id === inventory?.ingredientId
                  )
                  .map((ingredient) => (
                    <option
                      key={ingredient.id}
                      value={ingredient.id}
                    >
                      {ingredient.name} ({ingredient.unit})
                    </option>
                  ))}

              </select>

              {isEditing && (
                <p className="mt-1 text-[10px] text-gray-400">
                  Ingredient cannot be changed while editing inventory.
                </p>
              )}

            </div>


            {/* ADD NEW INGREDIENT PANEL */}
            {showAddIngredient && (
              <div className="col-span-2 rounded-lg border border-[#e3dc9e] bg-[#EFEABB]/40 p-3">

                <div className="mb-3 flex items-center justify-between">

                  <div>
                    <p className="text-xs font-semibold text-gray-900">
                      Add New Ingredient
                    </p>

                    <p className="text-[10px] text-gray-500">
                      Create an ingredient before adding its stock.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setShowAddIngredient(false);
                      setIngredientError("");
                    }}
                    className="rounded p-1 text-gray-400 transition hover:bg-gray-200 hover:text-gray-700"
                  >
                    <X size={14} />
                  </button>

                </div>

                {/* INGREDIENT NAME */}
                <div className="mb-3">

                  <label
                    htmlFor="newIngredientName"
                    className="mb-1 block text-xs font-medium text-gray-700"
                  >
                    Ingredient Name *
                  </label>

                  <input
                    id="newIngredientName"
                    type="text"
                    value={newIngredientName}
                    onChange={(e) =>
                      setNewIngredientName(
                        e.target.value
                      )
                    }
                    placeholder="e.g. Chicken"
                    disabled={creatingIngredient}
                    className="w-full rounded-md border border-gray-300 bg-white px-3 py-1.5 text-xs text-gray-900 placeholder:text-gray-400 focus:border-black focus:outline-none focus:ring-1 focus:ring-black disabled:bg-gray-100"
                  />

                </div>

                {/* UNIT */}
                <div className="mb-3">

                  <label
                    htmlFor="newIngredientUnit"
                    className="mb-1 block text-xs font-medium text-gray-700"
                  >
                    Unit *
                  </label>

                  <input
                    id="newIngredientUnit"
                    type="text"
                    value={newIngredientUnit}
                    onChange={(e) =>
                      setNewIngredientUnit(
                        e.target.value
                      )
                    }
                    placeholder="e.g. kg, pcs, liters"
                    disabled={creatingIngredient}
                    className="w-full rounded-md border border-gray-300 bg-white px-3 py-1.5 text-xs text-gray-900 placeholder:text-gray-400 focus:border-black focus:outline-none focus:ring-1 focus:ring-black disabled:bg-gray-100"
                  />

                </div>

                {/* INGREDIENT ERROR */}
                {ingredientError && (
                  <div className="mb-3 rounded-md border border-red-200 bg-red-50 p-2 text-[11px] text-red-600">
                    {ingredientError}
                  </div>
                )}

                {/* CREATE BUTTON */}
                <div className="flex justify-end">

                  <button
                    type="button"
                    onClick={handleCreateIngredient}
                    disabled={creatingIngredient}
                    className="flex items-center gap-1.5 rounded-md border border-[#d6d09b] bg-[#EFEABB] px-3 py-1.5 text-xs font-semibold text-gray-900 shadow-sm transition hover:bg-[#e3dc9e] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <Plus size={13} />

                    {creatingIngredient
                      ? "Creating..."
                      : "Create Ingredient"}

                  </button>

                </div>

              </div>
            )}

            {/* UNIT */}
            <div>

              <label className="mb-1 block text-xs font-medium text-gray-700">
                Unit
              </label>

              <input
                type="text"
                value={
                  selectedIngredient?.unit ?? ""
                }
                disabled
                placeholder="Auto"
                className="w-full cursor-not-allowed rounded-md border border-gray-300 bg-gray-100 px-3 py-1.5 text-xs text-gray-500"
              />

            </div>

            {/* INITIAL STOCK */}
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

            {/* AVAILABLE STOCK */}
            <div className="col-span-2">

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

          {/* STOCK INFO */}
          {selectedIngredient && (
            <div className="rounded-md border border-gray-200 bg-gray-50 p-3">

              <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-500">
                Selected Ingredient
              </p>

              <p className="mt-1 text-xs font-semibold text-gray-900">
                {selectedIngredient.name}
              </p>

              <p className="text-[11px] text-gray-500">
                Unit: {selectedIngredient.unit}
              </p>

            </div>
          )}

          {/* ACTIONS */}
          <div className="mt-6 flex items-center justify-end gap-2 pt-2">

            <button
              type="button"
              onClick={onClose}
              disabled={loading || creatingIngredient}
              className="rounded-md border border-gray-300 bg-white px-4 py-1.5 text-xs font-medium text-gray-700 shadow-sm transition hover:bg-gray-50 disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={
                loading ||
                loadingIngredients ||
                creatingIngredient
              }
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