import { useState } from "react";
import type { FormEvent } from "react";
import { X } from "lucide-react";
import { API_URL } from "../services/api";

interface Category {
  id: number;
  name: string;
  description: string | null;
  status: string;
}

interface CategoryFormProps {
  category: Category | null;
  onClose: () => void;
  onSuccess: () => void;
}

function CategoryForm({
  category,
  onClose,
  onSuccess,
}: CategoryFormProps) {
  const [name, setName] = useState(category?.name ?? "");
  const [description, setDescription] = useState(
    category?.description ?? ""
  );
  const [status, setStatus] = useState(
    category?.status ?? "ACTIVE"
  );

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const isEditing = Boolean(category);

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

      if (!name.trim()) {
        setError("Category name is required.");
        return;
      }

      const categoryData = {
        name: name.trim(),
        description: description.trim() || null,
        status,
      };

      const url = category
        ? `${API_URL}/categories/${category.id}`
        : `${API_URL}/categories`;

      const token = localStorage.getItem("token");

      if (!token) {
        throw new Error("You are not logged in.");
      }

      const response = await fetch(url, {
        method: category ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(categoryData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.message || "Failed to save category."
        );
      }

      onSuccess();
    } catch (err) {
      console.error("Save category error:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Unable to save category."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
      <div className="relative w-full max-w-md overflow-hidden rounded-xl border border-gray-200 bg-white shadow-2xl">

        {/* TOP BAR */}
        <div className="flex items-center justify-between border-b border-gray-200 bg-gray-50/80 px-4 py-3">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-500">
            Category Management
          </h2>

          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="rounded-lg p-1 text-gray-400 transition hover:bg-gray-200 hover:text-gray-700 disabled:opacity-50"
          >
            <X size={16} />
          </button>
        </div>

        {/* HEADER */}
        <div className="border-b border-[#e3dc9e] bg-[#EFEABB]/60 px-4 py-3">
          <h3 className="text-sm font-bold text-gray-900">
            {isEditing
              ? "Edit Category"
              : "Add New Category"}
          </h3>

          <p className="text-[11px] text-gray-600">
            {isEditing
              ? "Update details for the selected category."
              : "Fill out the fields below to create a new category."}
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

            {/* CATEGORY ID */}
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-700">
                Category ID
              </label>

              <input
                type="text"
                value={category?.id ?? "Auto"}
                disabled
                className="w-full cursor-not-allowed rounded-md border border-gray-300 bg-gray-100 px-3 py-1.5 text-xs text-gray-500"
              />
            </div>

            {/* STATUS */}
            <div>
              <label
                htmlFor="categoryStatus"
                className="mb-1 block text-xs font-medium text-gray-700"
              >
                Status *
              </label>

              <select
                id="categoryStatus"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                required
                disabled={loading}
                className="w-full rounded-md border border-gray-300 bg-white px-3 py-1.5 text-xs text-gray-900 focus:border-black focus:outline-none disabled:bg-gray-100"
              >
                <option value="ACTIVE">
                  Active
                </option>

                <option value="INACTIVE">
                  Inactive
                </option>
              </select>
            </div>

            {/* CATEGORY NAME */}
            <div className="col-span-2">
              <label
                htmlFor="categoryName"
                className="mb-1 block text-xs font-medium text-gray-700"
              >
                Category Name *
              </label>

              <input
                id="categoryName"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Food"
                required
                disabled={loading}
                className="w-full rounded-md border border-gray-300 bg-white px-3 py-1.5 text-xs text-gray-900 placeholder:text-gray-400 focus:border-black focus:outline-none disabled:bg-gray-100"
              />
            </div>

            {/* DESCRIPTION */}
            <div className="col-span-2">
              <label
                htmlFor="categoryDescription"
                className="mb-1 block text-xs font-medium text-gray-700"
              >
                Description
              </label>

              <textarea
                id="categoryDescription"
                value={description}
                onChange={(e) =>
                  setDescription(e.target.value)
                }
                placeholder="e.g. Food products"
                rows={3}
                disabled={loading}
                className="w-full resize-none rounded-md border border-gray-300 bg-white px-3 py-1.5 text-xs text-gray-900 placeholder:text-gray-400 focus:border-black focus:outline-none disabled:bg-gray-100"
              />
            </div>
          </div>

          {/* ACTIONS */}
          <div className="mt-6 flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="rounded-md border border-gray-300 bg-white px-4 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className="rounded-md border border-[#d6d09b] bg-[#EFEABB] px-4 py-1.5 text-xs font-semibold text-gray-900 hover:bg-[#e3dc9e] disabled:opacity-50"
            >
              {loading
                ? "Saving..."
                : isEditing
                ? "Update Category"
                : "Save Category"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CategoryForm;