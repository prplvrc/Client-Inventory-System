import { useState } from "react";
import type { FormEvent } from "react";
import { X } from "lucide-react";

interface Product {
  id: number;
  product: string;
  category: string;
  price: number;
  status: string;
  bom: string | null;
}

interface ProductFormProps {
  product: Product | null;
  onClose: () => void;
  onSuccess: () => void;
}

function ProductForm({ product, onClose, onSuccess }: ProductFormProps) {
  const [productId, setProductId] = useState(
    product?.id?.toString() ?? ""
  );
  const [productName, setProductName] = useState(
    product?.product ?? ""
  );
  const [category, setCategory] = useState(
    product?.category ?? ""
  );
  const [price, setPrice] = useState(
    product?.price?.toString() ?? ""
  );
  const [status, setStatus] = useState(
    product?.status ?? "Active"
  );
  const [bom, setBom] = useState(
    product?.bom ?? ""
  );

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const isEditing = Boolean(product);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    try {
      setLoading(true);
      setError("");

      const apiUrl = import.meta.env.VITE_API_URL;
      if (!apiUrl) {
        throw new Error("VITE_API_URL is not configured.");
      }

      const productData = {
        product: productName,
        category,
        price: Number(price),
        status,
        bom: bom || null,
      };

      const url = product
        ? `${apiUrl}/products/${product.id}`
        : `${apiUrl}/products`;

      const response = await fetch(url, {
        method: product ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(productData),
      });

      if (!response.ok) {
        throw new Error("Failed to save product");
      }

      onSuccess();
    } catch (err) {
      console.error("Save product error:", err);
      setError("Unable to save product.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      {/* FORM CONTAINER */}
      <div className="relative w-full max-w-md overflow-hidden rounded-xl border border-gray-200 bg-white shadow-2xl transition-all">
        {/* TOP TITLE BAR WITH CLOSE BUTTON */}
        <div className="flex items-center justify-between border-b border-gray-200 bg-gray-50/80 px-4 py-3">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-500">
            Product Management
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-gray-400 hover:bg-gray-200 hover:text-gray-700 transition"
          >
            <X size={16} />
          </button>
        </div>

        {/* HEADER SECTION */}
        <div className="bg-[#EFEABB]/60 border-b border-[#e3dc9e] px-4 py-3">
          <h3 className="text-sm font-bold text-gray-900">
            {isEditing ? "Edit Product" : "Add New Product"}
          </h3>
          <p className="text-[11px] text-gray-600">
            {isEditing
              ? "Update details for the selected product."
              : "Fill out the fields below to create a new product."}
          </p>
        </div>

        {/* ERROR DISPLAY */}
        {error && (
          <div className="mx-4 mt-3 rounded-md border border-red-200 bg-red-50 p-2.5 text-xs text-red-600">
            {error}
          </div>
        )}

        {/* FORM FIELDS */}
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            {/* Product ID */}
            <div>
              <label htmlFor="productId" className="mb-1 block text-xs font-medium text-gray-700">
                Product ID
              </label>
              <input
                id="productId"
                type="number"
                value={productId}
                onChange={(e) => setProductId(e.target.value)}
                placeholder="Auto-assigned"
                disabled
                className="w-full rounded-md border border-gray-300 bg-gray-100 px-3 py-1.5 text-xs text-gray-500 cursor-not-allowed outline-none"
              />
            </div>

            {/* Status */}
            <div>
              <label htmlFor="status" className="mb-1 block text-xs font-medium text-gray-700">
                Status *
              </label>
              <select
                id="status"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                required
                className="w-full rounded-md border border-gray-300 bg-white px-3 py-1.5 text-xs text-gray-900 focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>

            {/* Product Name */}
            <div className="col-span-2">
              <label htmlFor="productName" className="mb-1 block text-xs font-medium text-gray-700">
                Product Name *
              </label>
              <input
                id="productName"
                type="text"
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                placeholder="e.g. Fares Overload"
                required
                className="w-full rounded-md border border-gray-300 bg-white px-3 py-1.5 text-xs text-gray-900 placeholder:text-gray-400 focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
              />
            </div>

            {/* Category */}
            <div>
              <label htmlFor="category" className="mb-1 block text-xs font-medium text-gray-700">
                Category *
              </label>
              <select
                id="category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                required
                className="w-full rounded-md border border-gray-300 bg-white px-3 py-1.5 text-xs text-gray-900 focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
              >
                <option value="" disabled>Select Category</option>
                <option value="Electronics">Electronics</option>
                <option value="Hardware">Hardware</option>
                <option value="Equipment">Equipment</option>
                <option value="Assembly">Assembly</option>
              </select>
            </div>

            {/* Selling Price */}
            <div>
              <label htmlFor="price" className="mb-1 block text-xs font-medium text-gray-700">
                Price (₱) *
              </label>
              <input
                id="price"
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="0.00"
                required
                min="0"
                step="0.01"
                className="w-full rounded-md border border-gray-300 bg-white px-3 py-1.5 text-xs text-gray-900 placeholder:text-gray-400 focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
              />
            </div>

            {/* BOM */}
            <div className="col-span-2">
              <label htmlFor="bom" className="mb-1 block text-xs font-medium text-gray-700">
                Bill of Materials (BoM)
              </label>
              <input
                id="bom"
                type="text"
                value={bom}
                onChange={(e) => setBom(e.target.value)}
                placeholder="e.g. BOM-101 (Optional)"
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
                ? "Update Product"
                : "Save Product"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ProductForm;