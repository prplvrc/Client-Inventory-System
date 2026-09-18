import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Search,
  ShoppingCart,
  Plus,
  Minus,
  Trash2,
  RefreshCw,
  CheckCircle,
  AlertCircle,
} from "lucide-react";

import { Skeleton } from "./LoadingSkeleton";
import { API_URL } from "../services/api";
import { useAuth } from "../hooks/useAuth";
import { useBranch } from "../hooks/useBranch";

interface Product {
  id: number;
  product: string;
  category: string;
  price: number;
  status: "ACTIVE" | "INACTIVE";
  requiresPreparation: boolean;

  batchStatus:
    | "AVAILABLE"
    | "LOW"
    | "EMPTY"
    | null;

  sellable: boolean;
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

type PaymentMethod = "CASH" | "GCASH";

function POS() {
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const { user } = useAuth();

  const {
    selectedBranchId,
    selectedBranch,
  } = useBranch();

  const posBranchId =
    user?.role === "STAFF"
      ? user.branch.id
      : selectedBranchId === "ALL"
      ? null
      : selectedBranchId;

  const posBranchName =
    user?.role === "STAFF"
      ? user.branch.name
      : selectedBranch?.name ?? null;

  // Payment method
  const [paymentMethod, setPaymentMethod] =
    useState<PaymentMethod>("CASH");

  // Payment processing
  const [processingPayment, setProcessingPayment] =
    useState(false);

  // Payment success
  const [successMessage, setSuccessMessage] =
    useState("");

  // Transaction error
  const [paymentError, setPaymentError] =
    useState("");

  // Idempotency key
  const [idempotencyKey, setIdempotencyKey] =
    useState("");

  // Created transaction ID
  const [
    completedTransactionId,
    setCompletedTransactionId,
  ] = useState<number | null>(null);

  // Fetch products
  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      if (!posBranchId) {
        setProducts([]);
        setError(
          "Please select a branch before processing the sale."
        );
        setLoading(false);
        return;
      }

      if (!API_URL) {
        throw new Error(
          "VITE_API_URL is not configured."
        );
      }

      const params = new URLSearchParams();

      params.append("page", "1");
      params.append("limit", "100");
      params.append(
        "branchId",
        String(posBranchId)
      );

      if (search.trim()) {
        params.append(
          "search",
          search.trim()
        );
      }

      if (category.trim()) {
        params.append(
          "category",
          category.trim()
        );
      }

      const token =
        localStorage.getItem("token");

      if (!token) {
        throw new Error(
          "You are not logged in."
        );
      }

      const response = await fetch(
        `${API_URL}/products?${params.toString()}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(
          `Failed to fetch products: ${response.status}`
        );
      }

      const result: ProductResponse =
        await response.json();

      // Only active products can be sold
      const activeProducts = (
        result.data ?? []
      ).filter(
        (product) =>
          product.status?.toLowerCase() ===
          "active"
      );

      setProducts(activeProducts);
    } catch (err) {
      console.error(
        "Fetch products error:",
        err
      );

      setProducts([]);
      setError(
        "Unable to load products. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }, [
    search,
    category,
    posBranchId,
  ]);

  // Clear cart when branch changes
  useEffect(() => {
    setCart([]);
    setPaymentMethod("CASH");
    setPaymentError("");
    setSuccessMessage("");
    setCompletedTransactionId(null);
  }, [posBranchId]);

  // Fetch products when search/filter changes
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchProducts();
    }, 300);

    return () => clearTimeout(timer);
  }, [fetchProducts]);

  // Categories
  const categories = useMemo(() => {
    return Array.from(
      new Set(
        products
          .map(
            (product) =>
              product.category
          )
          .filter(Boolean)
      )
    );
  }, [products]);

  // Add product to cart
  const addToCart = (
    product: Product
  ) => {
    if (!product.sellable) {
      return;
    }

    setCart((currentCart) => {
      const existingItem =
        currentCart.find(
          (item) =>
            item.id === product.id
        );

      if (existingItem) {
        return currentCart.map(
          (item) =>
            item.id === product.id
              ? {
                  ...item,
                  quantity:
                    item.quantity + 1,
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

    setError("");
    setSuccessMessage("");
    setPaymentError("");

    // Generate a new key when starting a new order
    if (cart.length === 0) {
      setIdempotencyKey(
        crypto.randomUUID()
      );
    }
  };

  // Increase quantity
  const increaseQuantity = (
    id: number
  ) => {
    const item = cart.find(
      (item) => item.id === id
    );

    if (!item) {
      return;
    }

    setCart((currentCart) =>
      currentCart.map((item) =>
        item.id === id
          ? {
              ...item,
              quantity:
                item.quantity + 1,
            }
          : item
      )
    );

    setError("");
    setPaymentError("");
  };

  // Decrease quantity
  const decreaseQuantity = (
    id: number
  ) => {
    setCart((currentCart) =>
      currentCart
        .map((item) =>
          item.id === id
            ? {
                ...item,
                quantity:
                  item.quantity - 1,
              }
            : item
        )
        .filter(
          (item) =>
            item.quantity > 0
        )
    );
  };

  // Remove item
  const removeFromCart = (
    id: number
  ) => {
    setCart((currentCart) =>
      currentCart.filter(
        (item) => item.id !== id
      )
    );
  };

  // Calculate subtotal
  const subtotal = useMemo(() => {
    return cart.reduce(
      (total, item) =>
        total +
        Number(item.price) *
          item.quantity,
      0
    );
  }, [cart]);

  // Total items
  const totalItems = useMemo(() => {
    return cart.reduce(
      (total, item) =>
        total + item.quantity,
      0
    );
  }, [cart]);

  // Reset search/category
  const handleReset = () => {
    setSearch("");
    setCategory("");
  };

  // Confirm payment / complete sale
  const handleConfirmPayment =
    async () => {
      if (cart.length === 0) {
        return;
      }

      try {
        setProcessingPayment(true);
        setPaymentError("");
        setSuccessMessage("");

        if (!API_URL) {
          throw new Error(
            "VITE_API_URL is not configured."
          );
        }

        // Make sure an idempotency key exists
        const currentIdempotencyKey =
          idempotencyKey ||
          crypto.randomUUID();

        if (!idempotencyKey) {
          setIdempotencyKey(
            currentIdempotencyKey
          );
        }

        // Prepare sale items
        const items = cart.map(
          (item) => ({
            productId: item.id,
            quantity: item.quantity,
          })
        );

        // Send sale to backend
        const token =
          localStorage.getItem("token");

        if (!token) {
          throw new Error(
            "You are not logged in."
          );
        }

        const response = await fetch(
          `${API_URL}/sales`,
          {
            method: "POST",
            headers: {
              "Content-Type":
                "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              branchId: posBranchId,
              paymentMethod,
              items,
              idempotencyKey:
                currentIdempotencyKey,
            }),
          }
        );

        const result =
          await response
            .json()
            .catch(() => null);

        if (!response.ok) {
          throw new Error(
            result?.message ||
              `Failed to complete sale: ${response.status}`
          );
        }

        // Get transaction ID
        const transactionId =
          result?.sale?.id ?? null;

        setCompletedTransactionId(
          transactionId
        );

        // Clear cart after successful sale
        setCart([]);

        // Reset payment method
        setPaymentMethod("CASH");

        // Reset idempotency key
        setIdempotencyKey("");

        // Show success message
        setSuccessMessage(
          transactionId
            ? `Sale completed successfully. Transaction #${transactionId}.`
            : "Sale completed successfully."
        );

        // Refresh products
        fetchProducts();
      } catch (err) {
        console.error(
          "Payment error:",
          err
        );

        setPaymentError(
          err instanceof Error
            ? err.message
            : "Unable to complete payment."
        );
      } finally {
        setProcessingPayment(false);
      }
    };

  return (
    <div className="mx-auto w-full max-w-[1600px] p-4 lg:p-6">
      {/* HEADER */}
      <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="pl-12 lg:pl-0">
          <h1 className="text-xl font-bold uppercase tracking-tight text-gray-900">
            Point of Sale
          </h1>

          <p className="text-xs font-semibold text-gray-600">
            Operating Branch:{" "}
            <span className="text-gray-900">
              {posBranchName ??
                "No Branch Selected"}
            </span>
          </p>
        </div>
      </div>

      {/* SUCCESS MESSAGE */}
      {successMessage && (
        <div className="mb-4 flex items-start gap-2 rounded-md border border-green-200 bg-green-50 p-3 text-xs text-green-700">
          <CheckCircle
            size={15}
            className="mt-0.5 shrink-0"
          />

          <div>
            <p className="font-semibold">
              Payment Successful
            </p>

            <p className="mt-0.5">
              {successMessage}
            </p>

            {completedTransactionId && (
              <p className="mt-1 font-medium">
                You can view this transaction in
                Sales.
              </p>
            )}
          </div>
        </div>
      )}

      {/* ERROR */}
      {error && (
        <div className="mb-4 flex items-center gap-2 rounded-md border border-red-200 bg-red-50 p-3 text-xs text-red-600">
          <AlertCircle size={14} />
          {error}
        </div>
      )}

      {/* PAYMENT ERROR */}
      {paymentError && (
        <div className="mb-4 flex items-start gap-2 rounded-md border border-red-200 bg-red-50 p-3 text-xs text-red-600">
          <AlertCircle
            size={14}
            className="mt-0.5 shrink-0"
          />

          <div>
            <p className="font-semibold">
              Payment Failed
            </p>

            <p className="mt-0.5">
              {paymentError}
            </p>
          </div>
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
                onChange={(e) =>
                  setSearch(
                    e.target.value
                  )
                }
                placeholder="Search products..."
                className="w-full rounded-md border border-gray-300 bg-white py-2 pl-9 pr-3 text-xs text-gray-900 placeholder:text-gray-400 focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
              />
            </div>

            {/* CATEGORY */}
            <select
              value={category}
              onChange={(e) =>
                setCategory(
                  e.target.value
                )
              }
              className="rounded-md border border-gray-300 bg-white px-3 py-2 text-xs text-gray-700 focus:border-black focus:outline-none"
            >
              <option value="">
                All Categories
              </option>

              {categories.map(
                (item) => (
                  <option
                    key={item}
                    value={item}
                  >
                    {item}
                  </option>
                )
              )}
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
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {Array.from(
                { length: 6 },
                (_, index) => (
                  <ProductCardSkeleton
                    key={index}
                  />
                )
              )}
            </div>
          ) : products.length ===
            0 ? (
            <div className="rounded-lg border border-gray-200 bg-white py-12 text-center text-xs text-gray-500 shadow-sm">
              No active products found.
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {products.map(
                (product) => (
                  <div
                    key={product.id}
                    className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm transition hover:shadow-md"
                  >
                    {/* PRODUCT NAME */}
                    <h3 className="text-sm font-semibold text-gray-900">
                      {product.product}
                    </h3>

                    {/* PREPARED PRODUCT STATUS */}
                    {product.requiresPreparation && (
                      <span
                        className={`mt-2 inline-flex rounded-full px-2 py-1 text-[10px] font-semibold ${
                          product.batchStatus ===
                          "AVAILABLE"
                            ? "bg-emerald-50 text-emerald-700"
                            : product.batchStatus ===
                              "LOW"
                            ? "bg-amber-50 text-amber-700"
                            : "bg-red-50 text-red-700"
                        }`}
                      >
                        {product.batchStatus}
                      </span>
                    )}

                    {/* PRICE + ADD */}
                    <div className="mt-4 flex items-center justify-between">
                      <span className="text-sm font-bold text-gray-900">
                        ₱
                        {Number(
                          product.price
                        ).toFixed(2)}
                      </span>

                      <button
                        type="button"
                        onClick={() =>
                          addToCart(
                            product
                          )
                        }
                        disabled={
                          !product.sellable
                        }
                        className="flex items-center gap-1 rounded-md border border-[#d6d09b] bg-[#EFEABB] px-3 py-1.5 text-[11px] font-semibold text-gray-900 transition hover:bg-[#e3dc9e] disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <Plus size={12} />

                        {!product.sellable
                          ? "Unavailable"
                          : "Add"}
                      </button>
                    </div>
                  </div>
                )
              )}
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
                  Current Order
                </h2>
              </div>

              <span className="rounded-full bg-gray-200 px-2 py-0.5 text-[10px] font-semibold text-gray-600">
                {totalItems}{" "}
                {totalItems === 1
                  ? "Item"
                  : "Items"}
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
                    Your order is empty
                  </p>

                  <p className="mt-1 text-[11px] text-gray-400">
                    Add products to start an order.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {cart.map(
                    (item) => (
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
                              ₱
                              {Number(
                                item.price
                              ).toFixed(
                                2
                              )}{" "}
                              each
                            </p>
                          </div>

                          <button
                            type="button"
                            onClick={() =>
                              removeFromCart(
                                item.id
                              )
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
                                decreaseQuantity(
                                  item.id
                                )
                              }
                              className="rounded border border-gray-300 bg-white p-1 hover:bg-gray-50"
                            >
                              <Minus size={11} />
                            </button>

                            <span className="min-w-5 text-center text-xs font-semibold">
                              {
                                item.quantity
                              }
                            </span>

                            <button
                              type="button"
                              onClick={() =>
                                increaseQuantity(
                                  item.id
                                )
                              }
                              className="rounded border border-gray-300 bg-white p-1 hover:bg-gray-50"
                            >
                              <Plus size={11} />
                            </button>
                          </div>

                          <span className="text-xs font-bold text-gray-900">
                            ₱
                            {(
                              Number(
                                item.price
                              ) *
                              item.quantity
                            ).toFixed(
                              2
                            )}
                          </span>
                        </div>
                      </div>
                    )
                  )}
                </div>
              )}
            </div>

            {/* CART SUMMARY + PAYMENT */}
            <div className="border-t border-gray-200 bg-gray-50 p-4">
              {/* SUBTOTAL */}
              <div className="flex justify-between text-xs text-gray-600">
                <span>
                  Subtotal
                </span>

                <span>
                  ₱{subtotal.toFixed(2)}
                </span>
              </div>

              {/* DISCOUNT */}
              <div className="mt-2 flex justify-between text-xs text-gray-600">
                <span>
                  Discount
                </span>

                <span>
                  ₱0.00
                </span>
              </div>

              {/* TOTAL */}
              <div className="mt-3 flex justify-between border-t border-gray-200 pt-3">
                <span className="text-sm font-bold text-gray-900">
                  Total
                </span>

                <span className="text-sm font-bold text-gray-900">
                  ₱
                  {subtotal.toFixed(
                    2
                  )}
                </span>
              </div>

              {/* PAYMENT METHOD */}
              <div className="mt-5">
                <p className="mb-2 text-xs font-semibold text-gray-800">
                  Payment Method
                </p>

                <div className="grid grid-cols-2 gap-2">
                  {/* CASH */}
                  <button
                    type="button"
                    disabled={
                      cart.length === 0 ||
                      processingPayment
                    }
                    onClick={() =>
                      setPaymentMethod(
                        "CASH"
                      )
                    }
                    className={`rounded-md border px-3 py-3 text-center transition ${
                      paymentMethod ===
                      "CASH"
                        ? "border-black bg-gray-900 text-white"
                        : "border-gray-300 bg-white text-gray-700 hover:bg-gray-100"
                    } disabled:cursor-not-allowed disabled:opacity-50`}
                  >
                    <span className="block text-xs font-semibold">
                      Cash
                    </span>

                    <span
                      className={`mt-1 block text-[10px] ${
                        paymentMethod ===
                        "CASH"
                          ? "text-gray-300"
                          : "text-gray-500"
                      }`}
                    >
                      Customer pays with cash
                    </span>
                  </button>

                  {/* GCASH */}
                  <button
                    type="button"
                    disabled={
                      cart.length === 0 ||
                      processingPayment
                    }
                    onClick={() =>
                      setPaymentMethod(
                        "GCASH"
                      )
                    }
                    className={`rounded-md border px-3 py-3 text-center transition ${
                      paymentMethod ===
                      "GCASH"
                        ? "border-black bg-gray-900 text-white"
                        : "border-gray-300 bg-white text-gray-700 hover:bg-gray-100"
                    } disabled:cursor-not-allowed disabled:opacity-50`}
                  >
                    <span className="block text-xs font-semibold">
                      GCash
                    </span>

                    <span
                      className={`mt-1 block text-[10px] ${
                        paymentMethod ===
                        "GCASH"
                          ? "text-gray-300"
                          : "text-gray-500"
                      }`}
                    >
                      Customer pays through GCash
                    </span>
                  </button>
                </div>
              </div>

              {/* COMPLETE SALE */}
              <button
                type="button"
                disabled={
                  cart.length === 0 ||
                  processingPayment
                }
                onClick={
                  handleConfirmPayment
                }
                className="mt-3 w-full rounded-md border border-[#d6d09b] bg-[#EFEABB] px-4 py-2.5 text-xs font-semibold text-gray-900 transition hover:bg-[#e3dc9e] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {processingPayment
                  ? "Processing..."
                  : "Complete Sale"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// PRODUCT CARD SKELETON
function ProductCardSkeleton() {
  return (
    <div
      className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm"
      role="status"
    >
      <Skeleton className="h-4 w-4/5" />

      <Skeleton className="mt-3 h-5 w-20 rounded-full" />

      <div className="mt-4 flex items-center justify-between">
        <Skeleton className="h-4 w-16" />

        <Skeleton className="h-7 w-15" />
      </div>

      <span className="sr-only">
        Loading product...
      </span>
    </div>
  );
}

export default POS;