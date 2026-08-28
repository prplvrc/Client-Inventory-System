import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Search,
  ShoppingCart,
  Plus,
  Minus,
  Trash2,
  RefreshCw,
} from "lucide-react";

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

interface CartItem extends Product {
  quantity: number;
}

function POS() {
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [dateTime, setDateTime] = useState(new Date());

  // Fetch products from database
  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const apiUrl = import.meta.env.VITE_API_URL;

      if (!apiUrl) {
        throw new Error("VITE_API_URL is not configured.");
      }

      const params = new URLSearchParams();

      params.append("page", "1");
      params.append("limit", "100");

      if (search.trim()) {
        params.append("search", search.trim());
      }

      if (category.trim()) {
        params.append("category", category.trim());
      }

      const response = await fetch(
        `${apiUrl}/products?${params.toString()}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(
          `Failed to fetch products: ${response.status}`
        );
      }

      const result: ProductResponse = await response.json();

      // Only show active products in POS
      const activeProducts = (result.data ?? []).filter(
        (product) =>
          product.status?.toLowerCase() === "active"
      );

      setProducts(activeProducts);
    } catch (err) {
      console.error("Fetch products error:", err);
      setProducts([]);
      setError("Unable to load products. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [search, category]);

  // Real-time clock
  useEffect(() => {
    const timer = setInterval(() => {
      setDateTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Fetch whenever search/category changes
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchProducts();
    }, 300);

    return () => clearTimeout(timer);
  }, [fetchProducts]);

  // Get unique categories from products
  const categories = useMemo(() => {
    return Array.from(
      new Set(
        products
          .map((product) => product.category)
          .filter(Boolean)
      )
    );
  }, [products]);

  // Add product to cart
  const addToCart = (product: Product) => {
    setCart((currentCart) => {
      const existingItem = currentCart.find(
        (item) => item.id === product.id
      );

      if (existingItem) {
        return currentCart.map((item) =>
          item.id === product.id
            ? {
                ...item,
                quantity: item.quantity + 1,
              }
            : item
        );
      }

      return [
        ...currentCart,
        {
          ...product,
          quantity: 1,
        },
      ];
    });
  };

  // Increase quantity
  const increaseQuantity = (id: number) => {
    setCart((currentCart) =>
      currentCart.map((item) =>
        item.id === id
          ? {
              ...item,
              quantity: item.quantity + 1,
            }
          : item
      )
    );
  };

  // Decrease quantity
  const decreaseQuantity = (id: number) => {
    setCart((currentCart) =>
      currentCart
        .map((item) =>
          item.id === id
            ? {
                ...item,
                quantity: item.quantity - 1,
              }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  // Remove item from cart
  const removeFromCart = (id: number) => {
    setCart((currentCart) =>
      currentCart.filter((item) => item.id !== id)
    );
  };

  // Calculate subtotal
  const subtotal = useMemo(() => {
    return cart.reduce(
      (total, item) =>
        total + Number(item.price) * item.quantity,
      0
    );
  }, [cart]);

  const totalItems = useMemo(() => {
    return cart.reduce(
      (total, item) => total + item.quantity,
      0
    );
  }, [cart]);

  // Reset search and category
  const handleReset = () => {
    setSearch("");
    setCategory("");
  };

  return (
    <div className="w-full p-4 sm:p-6">

      {/* HEADER */}
      <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold uppercase tracking-tight text-gray-900">
            Point of Sale
          </h1>

          <p className="text-xs text-gray-500">
            Process customer orders and manage transactions.
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
            TIME:{" "}
            {dateTime.toLocaleTimeString("en-US", {
              hour12: false,
            })}
          </span>
        </div>
      </div>

      {/* ERROR */}
      {error && (
        <div className="mb-4 rounded-md border border-red-200 bg-red-50 p-3 text-xs text-red-600">
          {error}
        </div>
      )}

      {/* MAIN POS LAYOUT */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">

        {/* PRODUCTS */}
        <div className="lg:col-span-2">

          {/* SEARCH + FILTER */}
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">

            {/* SEARCH */}
            <div className="relative flex-1">
              <Search
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />

              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search products..."
                className="w-full rounded-md border border-gray-300 bg-white py-2 pl-9 pr-3 text-xs text-gray-900 placeholder:text-gray-400 focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
              />
            </div>

            {/* CATEGORY */}
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="rounded-md border border-gray-300 bg-white px-3 py-2 text-xs text-gray-700 focus:border-black focus:outline-none"
            >
              <option value="">All Categories</option>

              {categories.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>

            {/* RESET */}
            <button
              type="button"
              onClick={handleReset}
              className="flex items-center justify-center gap-1.5 rounded-md border border-gray-300 bg-white px-3 py-2 text-xs font-medium text-gray-700 transition hover:bg-gray-50"
            >
              <RefreshCw size={13} />
              Reset
            </button>
          </div>

          {/* PRODUCT HEADER */}
          <div className="mb-3">
            <h2 className="text-sm font-semibold text-gray-900">
              Products
            </h2>

            <p className="text-[11px] text-gray-500">
              Select a product to add it to the order.
            </p>
          </div>

          {/* PRODUCT LIST */}
          {loading ? (
            <div className="rounded-lg border border-gray-200 bg-white py-12 text-center text-xs text-gray-500 shadow-sm">
              Loading products...
            </div>
          ) : products.length === 0 ? (
            <div className="rounded-lg border border-gray-200 bg-white py-12 text-center text-xs text-gray-500 shadow-sm">
              No active products found.
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">

              {products.map((product) => (
                <div
                  key={product.id}
                  className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm transition hover:shadow-md"
                >
                  {/* CATEGORY */}
                  <div className="mb-3">
                    <span className="rounded-full bg-gray-100 px-2 py-1 text-[10px] font-medium text-gray-600">
                      {product.category}
                    </span>
                  </div>

                  {/* PRODUCT NAME */}
                  <h3 className="text-sm font-semibold text-gray-900">
                    {product.product}
                  </h3>

                  {/* PRODUCT ID */}
                  <p className="mt-1 text-[10px] text-gray-400">
                    ID: #{product.id}
                  </p>

                  {/* PRICE + ADD */}
                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-sm font-bold text-gray-900">
                      ₱{Number(product.price).toFixed(2)}
                    </span>

                    <button
                      type="button"
                      onClick={() => addToCart(product)}
                      className="flex items-center gap-1 rounded-md border border-[#d6d09b] bg-[#EFEABB] px-3 py-1.5 text-[11px] font-semibold text-gray-900 transition hover:bg-[#e3dc9e]"
                    >
                      <Plus size={12} />
                      Add
                    </button>
                  </div>
                </div>
              ))}

            </div>
          )}
        </div>

        {/* SHOPPING CART */}
        <div className="lg:col-span-1">

          <div className="sticky top-4 overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">

            {/* CART HEADER */}
            <div className="flex items-center justify-between border-b border-gray-200 bg-gray-100/70 px-4 py-3">
              <div className="flex items-center gap-2">
                <ShoppingCart
                  size={15}
                  className="text-gray-600"
                />

                <h2 className="text-sm font-semibold text-gray-900">
                  Shopping Cart
                </h2>
              </div>

              <span className="rounded-full bg-gray-200 px-2 py-0.5 text-[10px] font-semibold text-gray-600">
                {totalItems}{" "}
                {totalItems === 1 ? "Item" : "Items"}
              </span>
            </div>

            {/* CART ITEMS */}
            <div className="max-h-100 overflow-y-auto p-4">

              {cart.length === 0 ? (
                <div className="flex min-h-50 flex-col items-center justify-center text-center">
                  <ShoppingCart
                    size={32}
                    className="mb-3 text-gray-300"
                  />

                  <p className="text-xs font-medium text-gray-500">
                    Your cart is empty
                  </p>

                  <p className="mt-1 text-[11px] text-gray-400">
                    Add products to start an order.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">

                  {cart.map((item) => (
                    <div
                      key={item.id}
                      className="border-b border-gray-200 pb-4"
                    >

                      {/* ITEM NAME + DELETE */}
                      <div className="flex items-start justify-between gap-2">

                        <div>
                          <h3 className="text-xs font-semibold text-gray-900">
                            {item.product}
                          </h3>

                          <p className="mt-0.5 text-[10px] text-gray-500">
                            ₱{Number(item.price).toFixed(2)} each
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={() =>
                            removeFromCart(item.id)
                          }
                          className="rounded p-1 text-gray-400 transition hover:bg-rose-50 hover:text-rose-600"
                        >
                          <Trash2 size={13} />
                        </button>

                      </div>

                      {/* QUANTITY + TOTAL */}
                      <div className="mt-3 flex items-center justify-between">

                        <div className="flex items-center gap-2">

                          <button
                            type="button"
                            onClick={() =>
                              decreaseQuantity(item.id)
                            }
                            className="rounded border border-gray-300 bg-white p-1 hover:bg-gray-50"
                          >
                            <Minus size={11} />
                          </button>

                          <span className="min-w-5 text-center text-xs font-semibold">
                            {item.quantity}
                          </span>

                          <button
                            type="button"
                            onClick={() =>
                              increaseQuantity(item.id)
                            }
                            className="rounded border border-gray-300 bg-white p-1 hover:bg-gray-50"
                          >
                            <Plus size={11} />
                          </button>

                        </div>

                        <span className="text-xs font-bold text-gray-900">
                          ₱
                          {(
                            Number(item.price) *
                            item.quantity
                          ).toFixed(2)}
                        </span>

                      </div>
                    </div>
                  ))}

                </div>
              )}

            </div>

            {/* CART SUMMARY */}
            <div className="border-t border-gray-200 bg-gray-50 p-4">

              <div className="flex justify-between text-xs text-gray-600">
                <span>Subtotal</span>

                <span>
                  ₱{subtotal.toFixed(2)}
                </span>
              </div>

              <div className="mt-2 flex justify-between text-xs text-gray-600">
                <span>Discount</span>

                <span>₱0.00</span>
              </div>

              <div className="mt-3 flex justify-between border-t border-gray-200 pt-3">
                <span className="text-sm font-bold text-gray-900">
                  Total
                </span>

                <span className="text-sm font-bold text-gray-900">
                  ₱{subtotal.toFixed(2)}
                </span>
              </div>

              <button
                type="button"
                disabled={cart.length === 0}
                className="mt-4 w-full rounded-md border border-[#d6d09b] bg-[#EFEABB] px-4 py-2 text-xs font-semibold text-gray-900 transition hover:bg-[#e3dc9e] disabled:cursor-not-allowed disabled:opacity-50"
              >
                Proceed to Payment
              </button>

            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

export default POS;