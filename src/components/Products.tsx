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

interface Product {
  id: number;
  product: string;
  category: string;
  price: number;
  status: string;
  bom: string | null;
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
  const [dateTime, setDateTime] = useState(new Date());

  const limit = 10;

  // Real-time clock
  useEffect(() => {
    const timer = setInterval(() => setDateTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

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

      if (debouncedSearch.trim()) params.append("search", debouncedSearch.trim());
      if (debouncedCategory.trim()) params.append("category", debouncedCategory.trim());
      if (debouncedStatus.trim()) params.append("status", debouncedStatus.trim());

      params.append("page", String(page));
      params.append("limit", String(limit));

      if (!API_URL) throw new Error("VITE_API_URL is not configured.");

      const token = localStorage.getItem("token");

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
        throw new Error(`Failed to fetch products: ${response.status}`);
      }

      const result: ProductResponse = await response.json();
      setProducts(result.data ?? []);
      setTotalPages(result.totalPages ?? 1);
    } catch (err) {
      console.error("Fetch products error:", err);
      setProducts([]);
      setError("Unable to load products. Please try again.");
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
    if (!window.confirm("Are you sure you want to delete this product?")) return;

    try {
      setError("");
      if (!API_URL) throw new Error("VITE_API_URL is not configured.");

      const token = localStorage.getItem("token");

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

      if (!response.ok) throw new Error(`Failed to delete product: ${response.status}`);

      await fetchProducts();
    } catch (err) {
      console.error("Delete product error:", err);
      setError("Unable to delete product.");
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
      {/* HEADER */}
      <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="pl-12 lg:pl-0">
          <h1 className="text-xl font-bold uppercase tracking-tight text-gray-900">
            Products
          </h1>
          <p className="text-xs text-gray-500">
            Manage all products
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

      {/* ACTION BAR */}
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 items-center gap-3">
          <div className="relative w-full max-w-xs">
            <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Search products..."
              className="w-full rounded-md border border-gray-300 bg-white py-1.5 pl-8 pr-3 text-xs text-gray-900 placeholder:text-gray-400 focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* FILTER TOGGLE */}
          <button
            type="button"
            onClick={() => setShowFilters((prev) => !prev)}
            className="flex items-center gap-1.5 rounded-md border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 shadow-sm transition hover:bg-gray-50"
          >
            <SlidersHorizontal size={14} />
            Filters
          </button>

          {/* ADD BUTTON */}
          <button
            type="button"
            onClick={handleAdd}
            className="flex items-center gap-1.5 rounded-md bg-[#EFEABB] border border-[#d6d09b] px-3 py-1.5 text-xs font-semibold text-gray-900 shadow-sm transition hover:bg-[#e3dc9e]"
          >
            <Plus size={14} />
            Add
          </button>
        </div>
      </div>

      {/* EXPANDABLE FILTERS */}
      {showFilters && (
        <div className="mb-4 flex flex-wrap items-center gap-3 rounded-lg border border-gray-200 bg-white p-3 shadow-sm">
          <input
            type="text"
            value={category}
            onChange={(e) => {
              setCategory(e.target.value);
              setPage(1);
            }}
            placeholder="Filter by Category"
            className="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-xs text-gray-900 outline-none focus:border-black"
          />

          <input
            type="text"
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(1);
            }}
            placeholder="Filter by Status"
            className="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-xs text-gray-900 outline-none focus:border-black"
          />

          <button
            type="button"
            onClick={handleReset}
            className="flex items-center gap-1 rounded-md border border-gray-300 bg-gray-50 px-3 py-1.5 text-xs font-medium text-gray-700 transition hover:bg-gray-100"
          >
            <RefreshCw size={12} />
            Reset
          </button>
        </div>
      )}

      {/* ERROR MSG */}
      {error && (
        <div className="mb-4 rounded-md border border-red-200 bg-red-50 p-3 text-xs text-red-600">
          {error}
        </div>
      )}

      {/* DATA TABLE */}
      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-gray-700 border-collapse">
            <thead className="border-b border-gray-200 bg-gray-100/70 font-semibold uppercase tracking-wider text-gray-700">
              <tr>
                <th className="px-4 py-2.5 w-16 text-center border-r border-gray-200">ID</th>
                <th className="px-4 py-2.5 text-center border-r border-gray-200">Product</th>
                <th className="px-4 py-2.5 text-center border-r border-gray-200">Category</th>
                <th className="px-4 py-2.5 text-center border-r border-gray-200">Price</th>
                <th className="px-4 py-2.5 text-center border-r border-gray-200">Status</th>
                <th className="px-4 py-2.5 text-center border-r border-gray-200">BOM</th>
                <th className="px-4 py-2.5 text-center">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <TableSkeleton columns={7} />
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-gray-500">
                    No products found.
                  </td>
                </tr>
              ) : (
                products.map((p) => (
                  <tr key={p.id} className="transition hover:bg-gray-50/80">
                    <td className="px-4 py-2.5 text-center font-medium text-gray-500 border-r border-gray-200">
                      #{p.id}
                    </td>
                    <td className="px-4 py-2.5 font-semibold text-gray-900 border-r border-gray-200">
                      {p.product}
                    </td>
                    <td className="px-4 py-2.5 text-gray-600 border-r border-gray-200">
                      {p.category}
                    </td>
                    <td className="px-4 py-2.5 text-right font-medium text-gray-900 border-r border-gray-200">
                      ₱{Number(p.price).toFixed(2)}
                    </td>
                    <td className="px-4 py-2.5 text-center border-r border-gray-200">
                      <span
                        className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                          p.status?.toLowerCase() === "active"
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {p.status}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 text-center text-gray-500 border-r border-gray-200">
                      {p.bom || "—"}
                    </td>
                    <td className="px-4 py-2.5 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleEdit(p)}
                          className="flex items-center gap-1 rounded border border-emerald-300 bg-emerald-50 px-2 py-1 text-[11px] font-medium text-emerald-700 transition hover:bg-emerald-100"
                        >
                          <Pencil size={11} />
                          Edit
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDelete(p.id)}
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

      {/* PAGINATION */}
      <div className="mt-4 flex items-center justify-between text-xs text-gray-600">
        <span>
          Page <strong>{page}</strong> of <strong>{totalPages}</strong>
        </span>

        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={page <= 1}
            onClick={() => setPage((curr) => curr - 1)}
            className="rounded-md border border-gray-300 bg-white px-3 py-1.5 font-medium shadow-sm transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Previous
          </button>

          <button
            type="button"
            disabled={page >= totalPages}
            onClick={() => setPage((curr) => curr + 1)}
            className="rounded-md border border-gray-300 bg-white px-3 py-1.5 font-medium shadow-sm transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
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
