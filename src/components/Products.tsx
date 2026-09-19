import { useEffect, useState } from "react";
import {
  SlidersHorizontal,
  Plus,
  Pencil,
  Trash2,
  RefreshCw,
  Search,
} from "lucide-react";
import ProductForm from "./ProductForm";
import { TableSkeleton } from "./LoadingSkeleton";
import { API_URL } from "../services/api";
import PageHeader from "../components/ui/PageHeader";
import StatusBadge from "../components/ui/StatusBadge";

interface Product {
  id: number;
  product: string;
  category: string;
  categoryId?: number;
  price: number;
  status: string;
  requiresPreparation: boolean;
  bom: string | null;

  // Number of historical SaleItem records associated with this product.
  saleItemCount: number;
}

interface ProductResponse {
  data: Product[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

function Products() {
  const [products, setProducts] = useState<Product[]>([]);

  // Raw Filter States
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [status, setStatus] = useState("");

  // Debounced Filter States
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [debouncedCategory, setDebouncedCategory] = useState("");
  const [debouncedStatus, setDebouncedStatus] = useState("");

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showFilters, setShowFilters] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const limit = 10;

  // Debounce search and filter inputs
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setDebouncedCategory(category);
      setDebouncedStatus(status);
    }, 300);

    return () => clearTimeout(timer);
  }, [search, category, status]);

  // Fetch Products
  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError("");

      const params = new URLSearchParams();

      if (debouncedSearch.trim()) {
        params.append("search", debouncedSearch.trim());
      }
      if (debouncedCategory.trim()) {
        params.append("category", debouncedCategory.trim());
      }
      if (debouncedStatus.trim()) {
        params.append("status", debouncedStatus.trim());
      }

      params.append("page", String(page));
      params.append("limit", String(limit));

      if (!API_URL) {
        throw new Error("VITE_API_URL is not configured.");
      }

      const token =
        localStorage.getItem("token") || sessionStorage.getItem("token");

      if (!token) {
        throw new Error("You are not logged in.");
      }

      const response = await fetch(`${API_URL}/products?${params.toString()}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        let message = `Failed to fetch products: ${response.status}`;
        try {
          const errorData = await response.json();
          message = errorData?.message || message;
        } catch {
          // Response was not JSON
        }
        throw new Error(message);
      }

      const result: ProductResponse = await response.json();
      setProducts(result.data ?? []);
      setTotalPages(result.totalPages ?? 1);
    } catch (err) {
      console.error("Fetch products error:", err);
      setProducts([]);
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load products. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [page, debouncedSearch, debouncedCategory, debouncedStatus]);

  const handleAdd = () => {
    setSelectedProduct(null);
    setShowForm(true);
  };

  const handleEdit = (product: Product) => {
    setSelectedProduct(product);
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    const product = products.find((item) => item.id === id);
    if (!product) return;

    if (Number(product.saleItemCount ?? 0) > 0) {
      setError(
        `Cannot delete "${product.product}" because it has sales history. Set the product to INACTIVE instead.`
      );
      return;
    }

    if (
      !window.confirm(`Are you sure you want to delete "${product.product}"?`)
    ) {
      return;
    }

    try {
      setError("");

      if (!API_URL) {
        throw new Error("VITE_API_URL is not configured.");
      }

      const token =
        localStorage.getItem("token") || sessionStorage.getItem("token");

      if (!token) {
        throw new Error("You are not logged in.");
      }

      const response = await fetch(`${API_URL}/products/${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const result = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(
          result?.message || `Failed to delete product: ${response.status}`
        );
      }

      await fetchProducts();
    } catch (err) {
      console.error("Delete product error:", err);
      setError(
        err instanceof Error ? err.message : "Unable to delete product."
      );
    }
  };

  const handleReset = () => {
    setSearch("");
    setCategory("");
    setStatus("");
    setPage(1);
  };

  return (
    <div className="w-full p-4 sm:p-6">
      {/* PAGE HEADER */}
      <PageHeader
        title="Products"
        description="Manage all products and menu items."
      />

      {/* ACTION BAR */}
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {/* SEARCH */}
        <div className="relative w-full max-w-sm">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-[#64748B]"
            aria-hidden="true"
          />
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search products..."
            className="w-full rounded-lg border border-[#E5E7EB] bg-white py-2 pl-9 pr-3 text-xs text-[#1F2937] placeholder:text-[#94A3B8] outline-none transition focus:border-[#292A24] focus:ring-1 focus:ring-[#292A24]"
          />
        </div>

        {/* ACTIONS */}
        <div className="flex items-center gap-2">
          {/* FILTER TOGGLE */}
          <button
            type="button"
            onClick={() => setShowFilters((prev) => !prev)}
            className="inline-flex items-center gap-2 rounded-lg border border-[#E5E7EB] bg-white px-3 py-2 text-xs font-medium text-[#1F2937] transition hover:bg-gray-50"
          >
            <SlidersHorizontal size={14} />
            Filters
          </button>

          {/* ADD BUTTON */}
          <button
            type="button"
            onClick={handleAdd}
            className="inline-flex items-center gap-2 rounded-lg bg-[#292A24] px-3 py-2 text-xs font-medium text-white transition hover:opacity-90"
          >
            <Plus size={14} />
            Add Product
          </button>
        </div>
      </div>

      {/* EXPANDABLE FILTERS */}
      {showFilters && (
        <div className="mb-4 flex flex-wrap items-center gap-3 rounded-xl border border-[#E5E7EB] bg-white p-3">
          <input
            type="text"
            value={category}
            onChange={(e) => {
              setCategory(e.target.value);
              setPage(1);
            }}
            placeholder="Filter by Category"
            className="rounded-lg border border-[#E5E7EB] bg-white px-3 py-2 text-xs text-[#1F2937] outline-none focus:border-[#292A24] focus:ring-1 focus:ring-[#292A24]"
          />

          <select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(1);
            }}
            className="rounded-lg border border-[#E5E7EB] bg-white px-3 py-2 text-xs text-[#1F2937] outline-none focus:border-[#292A24] focus:ring-1 focus:ring-[#292A24]"
          >
            <option value="">All Status</option>
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
          </select>

          <button
            type="button"
            onClick={handleReset}
            className="inline-flex items-center gap-2 rounded-lg border border-[#E5E7EB] bg-white px-3 py-2 text-xs font-medium text-[#1F2937] transition hover:bg-gray-50"
          >
            <RefreshCw size={12} />
            Reset
          </button>
        </div>
      )}

      {/* ERROR MSG */}
      {error && (
        <div className="mb-4 flex items-start justify-between gap-3 rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-600">
          <span>{error}</span>
          <button
            type="button"
            onClick={() => setError("")}
            className="shrink-0 font-semibold text-red-500 hover:text-red-700"
          >
            ×
          </button>
        </div>
      )}

      {/* DATA TABLE */}
      <div className="overflow-hidden rounded-xl border border-[#E5E7EB] bg-white">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-xs text-[#1F2937]">
            <thead className="border-b border-[#E5E7EB] bg-[#F8F7F2] font-semibold uppercase tracking-wider text-[#64748B]">
              <tr>
                <th className="w-16 px-4 py-2.5 text-center">ID</th>
                <th className="px-4 py-2.5 text-center">Product</th>
                <th className="px-4 py-2.5 text-center">Category</th>
                <th className="px-4 py-2.5 text-center">Price</th>
                <th className="px-4 py-2.5 text-center">Status</th>
                <th className="px-4 py-2.5 text-center">BOM</th>
                <th className="px-4 py-2.5 text-center">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-[#E5E7EB]">
              {loading ? (
                <TableSkeleton columns={7} />
              ) : products.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-4 py-12 text-center text-[#64748B]"
                  >
                    No products found.
                  </td>
                </tr>
              ) : (
                products.map((p) => {
                  const hasSalesHistory = Number(p.saleItemCount ?? 0) > 0;

                  return (
                    <tr
                      key={p.id}
                      className="transition hover:bg-[#F8F7F2]/60"
                    >
                      {/* ID */}
                      <td className="px-4 py-2.5 text-center font-medium text-[#64748B]">
                        #{p.id}
                      </td>

                      {/* PRODUCT */}
                      <td className="px-4 py-2.5 font-semibold text-[#1F2937]">
                        {p.product}
                      </td>

                      {/* CATEGORY */}
                      <td className="px-4 py-2.5 text-center text-[#64748B]">
                        {p.category}
                      </td>

                      {/* PRICE */}
                      <td className="px-4 py-2.5 text-right font-medium text-[#1F2937]">
                        ₱{Number(p.price).toFixed(2)}
                      </td>

                      {/* STATUS */}
                      <td className="px-4 py-2.5 text-center">
                        <StatusBadge status={p.status} />
                      </td>

                      {/* BOM */}
                      <td className="px-4 py-2.5 text-center text-[#64748B]">
                        {p.bom || "—"}
                      </td>

                      {/* ACTIONS */}
                      <td className="px-4 py-2.5 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          {/* EDIT */}
                          <button
                            type="button"
                            onClick={() => handleEdit(p)}
                            className="inline-flex items-center gap-1 rounded-lg border border-[#E5E7EB] bg-white px-2.5 py-1.5 text-[11px] font-medium text-[#1F2937] transition hover:bg-gray-50"
                          >
                            <Pencil size={11} />
                            Edit
                          </button>

                          {/* DELETE / PROTECTED */}
                          <button
                            type="button"
                            disabled={hasSalesHistory}
                            onClick={() => handleDelete(p.id)}
                            title={
                              hasSalesHistory
                                ? "This product has sales history and cannot be deleted."
                                : "Delete product"
                            }
                            className={`inline-flex items-center gap-1 rounded-lg border px-2.5 py-1.5 text-[11px] font-medium transition ${
                              hasSalesHistory
                                ? "cursor-not-allowed border-[#E5E7EB] bg-gray-100 text-[#94A3B8]"
                                : "border-red-200 bg-red-50 text-red-700 hover:bg-red-100"
                            }`}
                          >
                            <Trash2 size={11} />
                            {hasSalesHistory ? "Protected" : "Delete"}
                          </button>
                        </div>

                        {/* SALES HISTORY INDICATOR */}
                        {hasSalesHistory && (
                          <p className="mt-1 text-[10px] text-[#94A3B8]">
                            {p.saleItemCount} sale
                            {p.saleItemCount !== 1 ? "s" : ""} recorded
                          </p>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* PAGINATION */}
      <div className="mt-4 flex items-center justify-between text-xs text-[#64748B]">
        <span>
          Page <strong className="text-[#1F2937]">{page}</strong> of{" "}
          <strong className="text-[#1F2937]">{totalPages}</strong>
        </span>

        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={page <= 1}
            onClick={() => setPage((curr) => curr - 1)}
            className="rounded-lg border border-[#E5E7EB] bg-white px-3 py-1.5 font-medium text-[#1F2937] transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Previous
          </button>

          <button
            type="button"
            disabled={page >= totalPages}
            onClick={() => setPage((curr) => curr + 1)}
            className="rounded-lg border border-[#E5E7EB] bg-white px-3 py-1.5 font-medium text-[#1F2937] transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Next
          </button>
        </div>
      </div>

      {/* MODAL FORM */}
      {showForm && (
        <ProductForm
          product={selectedProduct}
          onClose={() => {
            setShowForm(false);
            setSelectedProduct(null);
          }}
          onSuccess={() => {
            setShowForm(false);
            setSelectedProduct(null);
            fetchProducts();
          }}
        />
      )}
    </div>
  );
}

export default Products;