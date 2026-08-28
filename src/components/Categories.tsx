import { useEffect, useState } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  RefreshCw,
  Search,
} from "lucide-react";
import CategoryForm from "./CategoryForm";

interface Category {
  id: number;
  name: string;
  description: string | null;
  status: string;
}

function Categories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Category form state
  const [showForm, setShowForm] = useState(false);
  const [selectedCategory, setSelectedCategory] =
    useState<Category | null>(null);

  const apiUrl = import.meta.env.VITE_API_URL;

  // ===============================
  // Fetch Categories
  // ===============================

  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError("");

      if (!apiUrl) {
        throw new Error("VITE_API_URL is not configured.");
      }

      const response = await fetch(`${apiUrl}/categories`);

      if (!response.ok) {
        throw new Error("Failed to fetch categories");
      }

      const data: Category[] = await response.json();

      setCategories(data);
    } catch (err) {
      console.error("Fetch categories error:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Unable to load categories."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // ===============================
  // Add Category
  // ===============================

  const handleAdd = () => {
    setSelectedCategory(null);
    setShowForm(true);
  };

  // ===============================
  // Edit Category
  // ===============================

  const handleEdit = (category: Category) => {
    setSelectedCategory(category);
    setShowForm(true);
  };

  // ===============================
  // Delete Category
  // ===============================

  const handleDelete = async (id: number) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this category?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setError("");

      if (!apiUrl) {
        throw new Error("VITE_API_URL is not configured.");
      }

      const response = await fetch(
        `${apiUrl}/categories/${id}`,
        {
          method: "DELETE",
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.message || "Failed to delete category"
        );
      }

      await fetchCategories();
    } catch (err) {
      console.error("Delete category error:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Unable to delete category."
      );
    }
  };

  // ===============================
  // Search
  // ===============================

  const filteredCategories = categories.filter((category) =>
    category.name
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  return (
    <div className="w-full p-4 sm:p-6">

      {/* HEADER */}
      <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold uppercase tracking-tight text-gray-900">
            Categories
          </h1>

          <p className="text-xs text-gray-500">
            Manage product categories
          </p>
        </div>
      </div>

      {/* ACTION BAR */}
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

        {/* SEARCH */}
        <div className="relative w-full max-w-xs">
          <Search
            className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400"
          />

          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search categories..."
            className="w-full rounded-md border border-gray-300 bg-white py-1.5 pl-8 pr-3 text-xs text-gray-900 placeholder:text-gray-400 focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
          />
        </div>

        {/* BUTTONS */}
        <div className="flex items-center gap-2">

          {/* REFRESH */}
          <button
            type="button"
            onClick={fetchCategories}
            disabled={loading}
            className="flex items-center gap-1.5 rounded-md border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 shadow-sm transition hover:bg-gray-50 disabled:opacity-50"
          >
            <RefreshCw
              size={14}
              className={loading ? "animate-spin" : ""}
            />
            Refresh
          </button>

          {/* ADD */}
          <button
            type="button"
            onClick={handleAdd}
            className="flex items-center gap-1.5 rounded-md border border-[#d6d09b] bg-[#EFEABB] px-3 py-1.5 text-xs font-semibold text-gray-900 shadow-sm transition hover:bg-[#e3dc9e]"
          >
            <Plus size={14} />
            Add
          </button>

        </div>
      </div>

      {/* ERROR */}
      {error && (
        <div className="mb-4 rounded-md border border-red-200 bg-red-50 p-3 text-xs text-red-600">
          {error}
        </div>
      )}

      {/* TABLE */}
      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">

        <div className="overflow-x-auto">

          <table className="w-full border-collapse text-left text-xs text-gray-700">

            <thead className="border-b border-gray-200 bg-gray-100/70 font-semibold uppercase tracking-wider text-gray-700">

              <tr>
                <th className="w-16 border-r border-gray-200 px-4 py-2.5 text-center">
                  ID
                </th>

                <th className="border-r border-gray-200 px-4 py-2.5">
                  Category
                </th>

                <th className="border-r border-gray-200 px-4 py-2.5">
                  Description
                </th>

                <th className="border-r border-gray-200 px-4 py-2.5 text-center">
                  Status
                </th>

                <th className="px-4 py-2.5 text-center">
                  Actions
                </th>
              </tr>

            </thead>

            <tbody className="divide-y divide-gray-200">

              {/* LOADING */}
              {loading ? (
                <tr>
                  <td
                    colSpan={5}
                    className="py-12 text-center text-gray-500"
                  >
                    Loading categories...
                  </td>
                </tr>

              ) : filteredCategories.length === 0 ? (

                /* EMPTY */
                <tr>
                  <td
                    colSpan={5}
                    className="py-12 text-center text-gray-500"
                  >
                    No categories found.
                  </td>
                </tr>

              ) : (

                /* DATA */
                filteredCategories.map((category) => (
                  <tr
                    key={category.id}
                    className="transition hover:bg-gray-50/80"
                  >

                    {/* ID */}
                    <td className="border-r border-gray-200 px-4 py-2.5 text-center font-medium text-gray-500">
                      #{category.id}
                    </td>

                    {/* CATEGORY */}
                    <td className="border-r border-gray-200 px-4 py-2.5 font-semibold text-gray-900">
                      {category.name}
                    </td>

                    {/* DESCRIPTION */}
                    <td className="border-r border-gray-200 px-4 py-2.5 text-gray-600">
                      {category.description || "—"}
                    </td>

                    {/* STATUS */}
                    <td className="border-r border-gray-200 px-4 py-2.5 text-center">
                      <span
                        className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                          category.status === "ACTIVE"
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {category.status}
                      </span>
                    </td>

                    {/* ACTIONS */}
                    <td className="px-4 py-2.5 text-center">

                      <div className="flex items-center justify-center gap-1.5">

                        {/* EDIT */}
                        <button
                          type="button"
                          onClick={() =>
                            handleEdit(category)
                          }
                          className="flex items-center gap-1 rounded border border-emerald-300 bg-emerald-50 px-2 py-1 text-[11px] font-medium text-emerald-700 transition hover:bg-emerald-100"
                        >
                          <Pencil size={11} />
                          Edit
                        </button>

                        {/* DELETE */}
                        <button
                          type="button"
                          onClick={() =>
                            handleDelete(category.id)
                          }
                          className="flex items-center gap-1 rounded border border-rose-300 bg-rose-50 px-2 py-1 text-[11px] font-medium text-rose-700 transition hover:bg-rose-100"
                        >
                          <Trash2 size={11} />
                          Delete
                        </button>

                      </div>

                    </td>

                  </tr>
                ))
              )}

            </tbody>

          </table>

        </div>
      </div>

      {/* CATEGORY FORM */}
      {showForm && (
        <CategoryForm
          category={selectedCategory}

          onClose={() => {
            setShowForm(false);
            setSelectedCategory(null);
          }}

          onSuccess={() => {
            setShowForm(false);
            setSelectedCategory(null);
            fetchCategories();
          }}
        />
      )}

    </div>
  );
}

export default Categories;