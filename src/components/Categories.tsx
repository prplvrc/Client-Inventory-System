import { useEffect, useState } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  RefreshCw,
  Search,
} from "lucide-react";

import CategoryForm from "./CategoryForm";
import { TableSkeleton } from "./LoadingSkeleton";
import PageHeader from "./ui/PageHeader";
import StatusBadge from "./ui/StatusBadge";
import { apiRequest } from "../services/api";

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

  // Fetch Categories
  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await apiRequest<Category[]>(
        "/categories"
      );

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

  // Add Category
  const handleAdd = () => {
    setSelectedCategory(null);
    setShowForm(true);
  };

  // Edit Category
  const handleEdit = (category: Category) => {
    setSelectedCategory(category);
    setShowForm(true);
  };

  // Delete Category
  const handleDelete = async (id: number) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this category?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setError("");

      await apiRequest(`/categories/${id}`, {
        method: "DELETE",
      });

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

  // Search
  const filteredCategories = categories.filter((category) =>
    category.name
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  return (
    <div className="w-full p-4 sm:p-6">

      {/* PAGE HEADER */}
      <PageHeader
        title="Categories"
        description="Manage product categories"
        actions={
          <div className="flex items-center gap-2">

            {/* REFRESH */}
            <button
              type="button"
              onClick={fetchCategories}
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-lg border border-[#E5E7EB] bg-white px-3 py-2 text-sm font-medium text-[#1F2937] transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
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
              className="inline-flex items-center gap-2 rounded-lg bg-[#292A24] px-3 py-2 text-sm font-medium text-white transition hover:opacity-90"
            >
              <Plus size={14} />
              Add Category
            </button>

          </div>
        }
      />

      {/* SEARCH */}
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

        <div className="relative w-full max-w-sm">
          <Search
            size={15}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-[#64748B]"
            aria-hidden="true"
          />

          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search categories..."
            className="w-full rounded-lg border border-[#E5E7EB] bg-white py-2 pl-9 pr-3 text-sm text-[#1F2937] placeholder:text-[#94A3B8] outline-none transition focus:border-[#292A24] focus:ring-1 focus:ring-[#292A24]"
          />
        </div>

        <p className="text-xs text-[#64748B]">
          {filteredCategories.length}{" "}
          {filteredCategories.length === 1
            ? "category"
            : "categories"}
        </p>

      </div>

      {/* ERROR */}
      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-700">
          {error}
        </div>
      )}

      {/* TABLE */}
      <div className="overflow-hidden rounded-xl border border-[#E5E7EB] bg-white">

        <div className="overflow-x-auto">

          <table className="w-full border-collapse text-left text-xs text-[#1F2937]">

            <thead className="border-b border-[#E5E7EB] bg-[#F8F7F2] text-[10px] font-semibold uppercase tracking-wider text-[#64748B]">

              <tr>
                <th className="w-16 border-r border-[#E5E7EB] px-4 py-3 text-center">
                  ID
                </th>

                <th className="border-r border-[#E5E7EB] px-4 py-3">
                  Category
                </th>

                <th className="border-r border-[#E5E7EB] px-4 py-3">
                  Description
                </th>

                <th className="w-32 border-r border-[#E5E7EB] px-4 py-3 text-center">
                  Status
                </th>

                <th className="w-40 px-4 py-3 text-center">
                  Actions
                </th>
              </tr>

            </thead>

            <tbody className="divide-y divide-[#E5E7EB]">

              {/* LOADING */}
              {loading ? (
                <TableSkeleton columns={5} />

              ) : filteredCategories.length === 0 ? (

                /* EMPTY */
                <tr>
                  <td
                    colSpan={5}
                    className="px-4 py-12 text-center text-sm text-[#64748B]"
                  >
                    {search
                      ? "No categories match your search."
                      : "No categories found."}
                  </td>
                </tr>

              ) : (

                /* DATA */
                filteredCategories.map((category) => (
                  <tr
                    key={category.id}
                    className="transition hover:bg-[#F8F7F2]/70"
                  >

                    {/* ID */}
                    <td className="border-r border-[#E5E7EB] px-4 py-3 text-center font-medium text-[#64748B]">
                      #{category.id}
                    </td>

                    {/* CATEGORY */}
                    <td className="border-r border-[#E5E7EB] px-4 py-3">
                      <span className="font-semibold text-[#1F2937]">
                        {category.name}
                      </span>
                    </td>

                    {/* DESCRIPTION */}
                    <td className="border-r border-[#E5E7EB] px-4 py-3 text-[#64748B]">
                      {category.description || "—"}
                    </td>

                    {/* STATUS */}
                    <td className="border-r border-[#E5E7EB] px-4 py-3 text-center">
                      <StatusBadge
                        status={category.status}
                      />
                    </td>

                    {/* ACTIONS */}
                    <td className="px-4 py-3 text-center">

                      <div className="flex items-center justify-center gap-1.5">

                        {/* EDIT */}
                        <button
                          type="button"
                          onClick={() =>
                            handleEdit(category)
                          }
                          className="inline-flex items-center gap-1 rounded-lg border border-emerald-200 bg-emerald-50 px-2.5 py-1.5 text-[11px] font-medium text-emerald-700 transition hover:bg-emerald-100"
                        >
                          <Pencil size={12} />
                          Edit
                        </button>

                        {/* DELETE */}
                        <button
                          type="button"
                          onClick={() =>
                            handleDelete(category.id)
                          }
                          className="inline-flex items-center gap-1 rounded-lg border border-rose-200 bg-rose-50 px-2.5 py-1.5 text-[11px] font-medium text-rose-700 transition hover:bg-rose-100"
                        >
                          <Trash2 size={12} />
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