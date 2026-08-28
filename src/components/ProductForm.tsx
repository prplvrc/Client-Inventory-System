import { useEffect, useState } from "react";
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

interface Category {
  id: number;
  name: string;
  status?: string;
}

interface ProductFormProps {
  product: Product | null;
  onClose: () => void;
  onSuccess: () => void;
}

function ProductForm({
  product,
  onClose,
  onSuccess,
}: ProductFormProps) {
  const [productName, setProductName] = useState(
    product?.product ?? ""
  );

  const [categoryId, setCategoryId] = useState("");

  const [price, setPrice] = useState(
    product?.price?.toString() ?? ""
  );

  const [status, setStatus] = useState(
    product?.status ?? "ACTIVE"
  );

  const [categories, setCategories] = useState<Category[]>([]);

  const [loading, setLoading] = useState(false);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [error, setError] = useState("");

  const isEditing = Boolean(product);

  const apiUrl = import.meta.env.VITE_API_URL;

  // ===============================
  // Fetch Categories
  // ===============================

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoadingCategories(true);
        setError("");

        if (!apiUrl) {
          throw new Error("VITE_API_URL is not configured.");
        }

        const response = await fetch(`${apiUrl}/categories`);

        const contentType = response.headers.get("content-type");

        let result: Category[] = [];

        if (contentType?.includes("application/json")) {
          result = await response.json();
        } else {
          const text = await response.text();
          console.error("Non-JSON category response:", text);
          throw new Error("Invalid response from category server.");
        }

        if (!response.ok) {
          throw new Error("Failed to fetch categories");
        }

        setCategories(result);

        // When editing, find the category ID
        // using the category name returned by the product API.
        if (product) {
          const selectedCategory = result.find(
            (category) =>
              category.name.toLowerCase() ===
              product.category.toLowerCase()
          );

          if (selectedCategory) {
            setCategoryId(selectedCategory.id.toString());
          }
        }
      } catch (err) {
        console.error("Fetch categories error:", err);

        setError(
          err instanceof Error
            ? err.message
            : "Unable to load categories."
        );
      } finally {
        setLoadingCategories(false);
      }
    };

    fetchCategories();
  }, [apiUrl, product?.id, product?.category]);

  // ===============================
  // Submit
  // ===============================

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    try {
      setLoading(true);
      setError("");

      if (!apiUrl) {
        throw new Error("VITE_API_URL is not configured.");
      }

      // Validate product name
      if (!productName.trim()) {
        throw new Error("Product name is required.");
      }

      // Validate category
      if (!categoryId) {
        throw new Error("Please select a category.");
      }

      // Validate price
      const numericPrice = Number(price);

      if (price === "" || !Number.isFinite(numericPrice)) {
        throw new Error("Please enter a valid price.");
      }

      if (numericPrice < 0) {
        throw new Error("Price cannot be negative.");
      }

      const productData = {
        product: productName.trim(),
        categoryId: Number(categoryId),
        price: numericPrice,
        status,
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

      const contentType = response.headers.get("content-type");

      let result: {
        message?: string;
        [key: string]: unknown;
      } = {};

      if (contentType?.includes("application/json")) {
        result = await response.json();
      } else {
        const text = await response.text();

        console.error("Non-JSON product response:", text);

        throw new Error(
          `Server returned an invalid response (${response.status}).`
        );
      }

      if (!response.ok) {
        throw new Error(
          result.message ||
            (product
              ? "Failed to update product."
              : "Failed to create product.")
        );
      }

      console.log(
        product
          ? "Product updated:"
          : "Product created:",
        result
      );

      onSuccess();
    } catch (err) {
      console.error("Save product error:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Unable to save product."
      );
    } finally {
      setLoading(false);
    }
  };

  // ===============================
  // Available Categories
  // ===============================

  const availableCategories = categories.filter((category) => {
    // When adding a product:
    // only ACTIVE categories can be selected.
    if (!isEditing) {
      return category.status === "ACTIVE";
    }

    // When editing:
    // keep the currently selected category available
    // even if it is now INACTIVE.
    return (
      category.status === "ACTIVE" ||
      category.id.toString() === categoryId
    );
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">

      <div className="relative w-full max-w-md overflow-hidden rounded-xl border border-gray-200 bg-white shadow-2xl">

        {/* TOP BAR */}
        <div className="flex items-center justify-between border-b border-gray-200 bg-gray-50/80 px-4 py-3">

          <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-500">
            Product Management
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
              ? "Edit Product"
              : "Add New Product"}
          </h3>

          <p className="text-[11px] text-gray-600">
            {isEditing
              ? "Update details for the selected product."
              : "Fill out the fields below to create a new product."}
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

            {/* PRODUCT ID */}
            <div>

              <label className="mb-1 block text-xs font-medium text-gray-700">
                Product ID
              </label>

              <input
                type="text"
                value={product?.id ?? "Auto"}
                disabled
                className="w-full cursor-not-allowed rounded-md border border-gray-300 bg-gray-100 px-3 py-1.5 text-xs text-gray-500"
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

            {/* PRODUCT NAME */}
            <div className="col-span-2">

              <label
                htmlFor="productName"
                className="mb-1 block text-xs font-medium text-gray-700"
              >
                Product Name *
              </label>

              <input
                id="productName"
                type="text"
                value={productName}
                onChange={(e) =>
                  setProductName(e.target.value)
                }
                placeholder="e.g. Goto"
                required
                disabled={loading}
                className="w-full rounded-md border border-gray-300 bg-white px-3 py-1.5 text-xs text-gray-900 placeholder:text-gray-400 focus:border-black focus:outline-none disabled:bg-gray-100"
              />

            </div>

            {/* CATEGORY */}
            <div>

              <label
                htmlFor="category"
                className="mb-1 block text-xs font-medium text-gray-700"
              >
                Category *
              </label>

              <select
                id="category"
                value={categoryId}
                onChange={(e) =>
                  setCategoryId(e.target.value)
                }
                required
                disabled={loadingCategories || loading}
                className="w-full rounded-md border border-gray-300 bg-white px-3 py-1.5 text-xs text-gray-900 focus:border-black focus:outline-none disabled:bg-gray-100"
              >

                <option value="">
                  {loadingCategories
                    ? "Loading categories..."
                    : availableCategories.length === 0
                    ? "No active categories"
                    : "Select Category"}
                </option>

                {availableCategories.map((category) => (
                  <option
                    key={category.id}
                    value={category.id}
                  >
                    {category.name}
                    {category.status === "INACTIVE"
                      ? " (Inactive)"
                      : ""}
                  </option>
                ))}

              </select>

            </div>

            {/* PRICE */}
            <div>

              <label
                htmlFor="price"
                className="mb-1 block text-xs font-medium text-gray-700"
              >
                Price (₱) *
              </label>

              <input
                id="price"
                type="number"
                value={price}
                onChange={(e) =>
                  setPrice(e.target.value)
                }
                placeholder="0.00"
                required
                min="0"
                step="0.01"
                disabled={loading}
                className="w-full rounded-md border border-gray-300 bg-white px-3 py-1.5 text-xs text-gray-900 placeholder:text-gray-400 focus:border-black focus:outline-none disabled:bg-gray-100"
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
              disabled={
                loading ||
                loadingCategories ||
                availableCategories.length === 0
              }
              className="rounded-md border border-[#d6d09b] bg-[#EFEABB] px-4 py-1.5 text-xs font-semibold text-gray-900 hover:bg-[#e3dc9e] disabled:opacity-50"
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